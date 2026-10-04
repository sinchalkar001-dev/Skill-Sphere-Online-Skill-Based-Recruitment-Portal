import { Application, Job } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { APPLICATION_STATUSES } from '../utils/constants.js';

/**
 * Take one application slot on a job, atomically.
 *
 * The filter and the increment run as a single MongoDB operation, so when many
 * candidates apply at once a posting can never go over `maxApplications`, and a
 * closed or expired posting can never be applied to. Returns null if no slot was taken.
 */
const reserveSlot = (jobId) => {
  const now = new Date();
  return Job.findOneAndUpdate(
    {
      _id: jobId,
      isActive: true,
      $and: [
        // `null` also matches postings where the field was never set
        { $or: [{ applicationDeadline: null }, { applicationDeadline: { $gt: now } }] },
        { $or: [{ maxApplications: null }, { $expr: { $lt: ['$applicationsCount', '$maxApplications'] } }] },
      ],
    },
    { $inc: { applicationsCount: 1 } },
    { new: true }
  ).populate('recruiter', 'name email');
};

const releaseSlot = (jobId) =>
  Job.updateOne({ _id: jobId, applicationsCount: { $gt: 0 } }, { $inc: { applicationsCount: -1 } });

// Work out why a slot could not be reserved, for a useful error message
const explainUnavailable = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) return ApiError.notFound('Job not found');
  if (!job.isActive) return ApiError.badRequest('This job is no longer accepting applications');
  if (job.isExpired) return ApiError.badRequest('Application deadline has passed');
  return ApiError.badRequest('Maximum number of applications reached');
};

/**
 * Create an application. Returns the application and the job (with recruiter populated).
 */
export const submitApplication = async ({ jobId, candidateId, coverLetter, portfolioLinks, projectShowcase }) => {
  // Friendly early exit; the unique index on { job, candidate } is what actually guarantees one application each
  if (await Application.exists({ job: jobId, candidate: candidateId })) {
    throw ApiError.conflict('You have already applied for this job');
  }

  const job = await reserveSlot(jobId);
  if (!job) throw await explainUnavailable(jobId);

  try {
    const application = await Application.create({
      job: jobId,
      candidate: candidateId,
      coverLetter,
      portfolioLinks,
      projectShowcase,
    });
    return { application, job };
  } catch (error) {
    await releaseSlot(jobId);
    if (error.code === 11000) throw ApiError.conflict('You have already applied for this job');
    throw error;
  }
};

/**
 * Withdraw an application and give its slot back. Deleting with the conditions
 * in the filter means two simultaneous withdrawals cannot both decrement the count.
 */
export const withdrawApplication = async ({ applicationId, candidateId }) => {
  const application = await Application.findOneAndDelete({
    _id: applicationId,
    candidate: candidateId,
    status: { $ne: 'accepted' },
  });
  if (application) {
    await releaseSlot(application.job);
    return application;
  }

  const existing = await Application.findById(applicationId).select('candidate status').lean();
  if (!existing) throw ApiError.notFound('Application not found');
  if (existing.candidate.toString() !== candidateId.toString()) {
    throw ApiError.forbidden('You can only withdraw your own applications');
  }
  throw ApiError.badRequest('Cannot withdraw an accepted application');
};

const emptyCounts = () => ({
  total: 0,
  byStatus: Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, 0])),
});

/**
 * Count applications per status with one aggregation. With the
 * { job, status, createdAt } and { candidate, status, createdAt } indexes the
 * count is answered from the index alone, without reading any documents.
 */
const countByStatus = async (match) => {
  const rows = await Application.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts = emptyCounts();
  for (const { _id, count } of rows) {
    counts.byStatus[_id] = count;
    counts.total += count;
  }
  return counts;
};

/** Status counts for one posting (the tabs on the applicants page). */
export const getJobStatusCounts = (jobId) => countByStatus({ job: jobId });

/** Dashboard numbers for a candidate: their applications by status. */
export const getCandidateStats = (candidateId) => countByStatus({ candidate: candidateId });

/** Dashboard numbers for a recruiter: postings, and the pipeline across all of them. */
export const getRecruiterStats = async (recruiterId) => {
  const jobs = await Job.find({ recruiter: recruiterId }).select('isActive').lean();
  const applications = jobs.length
    ? await countByStatus({ job: { $in: jobs.map((job) => job._id) } })
    : emptyCounts();

  return {
    ...applications,
    jobs: { total: jobs.length, active: jobs.filter((job) => job.isActive).length },
  };
};

export default {
  submitApplication,
  withdrawApplication,
  getJobStatusCounts,
  getCandidateStats,
  getRecruiterStats,
};
