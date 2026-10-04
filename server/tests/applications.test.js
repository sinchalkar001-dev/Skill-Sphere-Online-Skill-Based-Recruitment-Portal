import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Application, Job } from '../models/index.js';
import {
  submitApplication,
  withdrawApplication,
  getJobStatusCounts,
  getCandidateStats,
  getRecruiterStats,
} from '../services/application.service.js';
import { connect, resetDatabase, disconnect, createUsers, createJob } from './helpers.js';

before(connect);
beforeEach(resetDatabase);
after(disconnect);

const outcomes = (results) => ({
  fulfilled: results.filter((r) => r.status === 'fulfilled').length,
  rejectedWith: (code) => results.filter((r) => r.status === 'rejected' && r.reason.statusCode === code).length,
});

test('a posting never goes over its application cap when candidates apply at the same moment', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  const candidates = await createUsers(30);
  const job = await createJob(recruiter._id, { maxApplications: 5 });

  const results = await Promise.allSettled(
    candidates.map((candidate) => submitApplication({ jobId: job._id, candidateId: candidate._id }))
  );

  const { fulfilled, rejectedWith } = outcomes(results);
  assert.equal(fulfilled, 5);
  assert.equal(rejectedWith(400), 25);
  assert.equal(await Application.countDocuments({ job: job._id }), 5);
  assert.equal((await Job.findById(job._id)).applicationsCount, 5);
});

test('simultaneous duplicate submissions from one candidate create one application', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  const [candidate] = await createUsers(1);
  const job = await createJob(recruiter._id);

  const results = await Promise.allSettled(
    Array.from({ length: 10 }, () => submitApplication({ jobId: job._id, candidateId: candidate._id }))
  );

  const { fulfilled, rejectedWith } = outcomes(results);
  assert.equal(fulfilled, 1);
  assert.equal(rejectedWith(409), 9);
  assert.equal(await Application.countDocuments({ job: job._id }), 1);
  assert.equal((await Job.findById(job._id)).applicationsCount, 1);
});

test('closed and expired postings reject applications with a specific reason', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  const [candidate] = await createUsers(1);
  const closed = await createJob(recruiter._id, { isActive: false });
  const expired = await createJob(recruiter._id, { applicationDeadline: new Date(Date.now() - 60_000) });

  await assert.rejects(submitApplication({ jobId: closed._id, candidateId: candidate._id }), /no longer accepting/);
  await assert.rejects(submitApplication({ jobId: expired._id, candidateId: candidate._id }), /deadline has passed/);
  assert.equal(await Application.countDocuments(), 0);
});

test('withdrawing frees the slot exactly once, even if requested several times at once', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  const [candidate, other] = await createUsers(2);
  const job = await createJob(recruiter._id);
  const { application } = await submitApplication({ jobId: job._id, candidateId: candidate._id });
  await submitApplication({ jobId: job._id, candidateId: other._id });

  await assert.rejects(
    withdrawApplication({ applicationId: application._id, candidateId: other._id }),
    (error) => error.statusCode === 403
  );

  const results = await Promise.allSettled(
    Array.from({ length: 5 }, () => withdrawApplication({ applicationId: application._id, candidateId: candidate._id }))
  );

  assert.equal(outcomes(results).fulfilled, 1);
  assert.equal((await Job.findById(job._id)).applicationsCount, 1);
});

test('dashboard stats count applications per status for candidates and recruiters', async () => {
  const [recruiter, otherRecruiter] = await createUsers(2, 'recruiter');
  const candidates = await createUsers(6);
  const jobA = await createJob(recruiter._id);
  const jobB = await createJob(recruiter._id, { isActive: false });
  const foreignJob = await createJob(otherRecruiter._id);

  const statuses = ['applied', 'applied', 'reviewing', 'shortlisted', 'assessed', 'accepted'];
  await Application.insertMany([
    ...candidates.map((candidate, i) => ({ job: jobA._id, candidate: candidate._id, status: statuses[i] })),
    { job: jobB._id, candidate: candidates[0]._id, status: 'rejected' },
    { job: foreignJob._id, candidate: candidates[0]._id, status: 'shortlisted' },
  ]);

  const jobCounts = await getJobStatusCounts(jobA._id);
  assert.equal(jobCounts.total, 6);
  assert.deepEqual(jobCounts.byStatus, { applied: 2, reviewing: 1, shortlisted: 1, assessed: 1, rejected: 0, accepted: 1 });

  const recruiterStats = await getRecruiterStats(recruiter._id);
  assert.equal(recruiterStats.total, 7);
  assert.equal(recruiterStats.byStatus.rejected, 1);
  assert.deepEqual(recruiterStats.jobs, { total: 2, active: 1 });

  const candidateStats = await getCandidateStats(candidates[0]._id);
  assert.equal(candidateStats.total, 3);
  assert.deepEqual(
    { applied: candidateStats.byStatus.applied, rejected: candidateStats.byStatus.rejected, shortlisted: candidateStats.byStatus.shortlisted },
    { applied: 1, rejected: 1, shortlisted: 1 }
  );

  const empty = await getRecruiterStats(candidates[0]._id);
  assert.equal(empty.total, 0);
});

test('status counts are answered from the compound index without reading documents', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  const candidates = await createUsers(40);
  const job = await createJob(recruiter._id);
  await Application.insertMany(
    candidates.map((candidate, i) => ({ job: job._id, candidate: candidate._id, status: i % 2 ? 'applied' : 'reviewing' }))
  );

  const explain = await Application.aggregate([
    { $match: { job: job._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]).explain('executionStats');
  const stats = explain.executionStats || explain.stages[0].$cursor.executionStats;

  assert.equal(stats.totalDocsExamined, 0);
  assert.equal(stats.totalKeysExamined, 40);
});
