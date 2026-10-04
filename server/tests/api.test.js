// End-to-end checks against a real server process: authentication, password
// storage and role-based access.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import { User, EmailJob } from '../models/index.js';
import { connect, resetDatabase, disconnect } from './helpers.js';

const PORT = 5098;
const BASE = `http://127.0.0.1:${PORT}`;
const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let server;
const accounts = {};
let jobId;
let applicationId;

const api = async (url, { method = 'GET', token, body } = {}) => {
  const response = await fetch(BASE + url, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
};

const register = async (key, details) => {
  const { status, body } = await api('/api/auth/register', {
    method: 'POST',
    body: { password: 'correct-horse-1', confirmPassword: 'correct-horse-1', ...details },
  });
  assert.equal(status, 201, JSON.stringify(body));
  accounts[key] = { ...body.data.user, token: body.data.accessToken };
  return body;
};

before(async () => {
  await connect();
  await resetDatabase();
  server = spawn(process.execPath, ['server.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/health`)).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Server did not start');
});

after(async () => {
  server?.kill();
  await disconnect();
});

test('registration stores a bcrypt hash and never returns the password', async () => {
  const body = await register('candidate', { name: 'Asha Rao', email: 'asha@example.test', role: 'candidate' });

  assert.equal(body.data.user.password, undefined);
  assert.ok(body.data.accessToken);

  const stored = await User.findOne({ email: 'asha@example.test' }).select('+password');
  assert.notEqual(stored.password, 'correct-horse-1');
  assert.match(stored.password, /^\$2[aby]\$12\$/); // bcrypt, cost factor 12
});

test('login returns a signed token for the right password only', async () => {
  const wrong = await api('/api/auth/login', { method: 'POST', body: { email: 'asha@example.test', password: 'nope-nope' } });
  assert.equal(wrong.status, 401);

  const right = await api('/api/auth/login', { method: 'POST', body: { email: 'asha@example.test', password: 'correct-horse-1' } });
  assert.equal(right.status, 200);
  const payload = jwt.verify(right.body.data.accessToken, process.env.JWT_SECRET);
  assert.equal(payload.id, accounts.candidate._id);
});

test('protected routes reject missing, malformed and forged tokens', async () => {
  assert.equal((await api('/api/auth/me')).status, 401);
  assert.equal((await api('/api/auth/me', { token: 'not-a-jwt' })).status, 401);

  const forged = jwt.sign({ id: accounts.candidate._id }, 'some-other-secret');
  assert.equal((await api('/api/auth/me', { token: forged })).status, 401);

  const me = await api('/api/auth/me', { token: accounts.candidate.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, 'asha@example.test');
});

test('only recruiters can post jobs and only candidates can apply', async () => {
  await register('recruiter', { name: 'Ravi Menon', email: 'ravi@example.test', role: 'recruiter', company: { name: 'Acme' } });
  const job = { title: 'Backend Engineer', description: 'Build APIs.', techStack: ['Node.js', 'MongoDB'] };

  assert.equal((await api('/api/jobs', { method: 'POST', token: accounts.candidate.token, body: job })).status, 403);

  const posted = await api('/api/jobs', { method: 'POST', token: accounts.recruiter.token, body: job });
  assert.equal(posted.status, 201);
  jobId = posted.body.data.job._id;

  assert.equal((await api('/api/applications', { method: 'POST', token: accounts.recruiter.token, body: { jobId } })).status, 403);

  const applied = await api('/api/applications', { method: 'POST', token: accounts.candidate.token, body: { jobId, coverLetter: 'Hello' } });
  assert.equal(applied.status, 201);
  applicationId = applied.body.data.application._id;
  assert.equal(applied.body.data.application.job.title, 'Backend Engineer');

  const again = await api('/api/applications', { method: 'POST', token: accounts.candidate.token, body: { jobId } });
  assert.equal(again.status, 409);
});

test('applicants are visible to the posting owner only', async () => {
  await register('otherRecruiter', { name: 'Meera Shah', email: 'meera@example.test', role: 'recruiter', company: { name: 'Globex' } });

  assert.equal((await api(`/api/applications/job/${jobId}`, { token: accounts.candidate.token })).status, 403);
  assert.equal((await api(`/api/applications/job/${jobId}`, { token: accounts.otherRecruiter.token })).status, 403);

  const owner = await api(`/api/applications/job/${jobId}`, { token: accounts.recruiter.token });
  assert.equal(owner.status, 200);
  assert.equal(owner.body.data.applications.length, 1);
  assert.equal(owner.body.data.statusCounts.byStatus.applied, 1);
  assert.equal(owner.body.pagination.total, 1);
});

test('a status change notifies the candidate by email and shows in both dashboards', async () => {
  const forbidden = await api(`/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    token: accounts.otherRecruiter.token,
    body: { status: 'shortlisted' },
  });
  assert.equal(forbidden.status, 403);

  const updated = await api(`/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    token: accounts.recruiter.token,
    body: { status: 'shortlisted' },
  });
  assert.equal(updated.status, 200);

  // The email goes through the outbox and is delivered in the background
  let email;
  for (let i = 0; i < 50 && email?.status !== 'sent'; i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    email = await EmailJob.findOne({ to: 'asha@example.test', template: 'statusChange' });
  }
  assert.equal(email.status, 'sent');
  assert.equal(email.data.status, 'shortlisted');

  const candidateStats = await api('/api/applications/stats', { token: accounts.candidate.token });
  assert.equal(candidateStats.body.data.stats.total, 1);
  assert.equal(candidateStats.body.data.stats.byStatus.shortlisted, 1);

  const recruiterStats = await api('/api/applications/stats', { token: accounts.recruiter.token });
  assert.equal(recruiterStats.body.data.stats.byStatus.shortlisted, 1);
  assert.deepEqual(recruiterStats.body.data.stats.jobs, { total: 1, active: 1 });
});

test('the job board filters by skill tag in any letter case and suggests skills', async () => {
  const filtered = await api('/api/jobs?techStack=NODE.JS');
  assert.equal(filtered.body.data.jobs.length, 1);

  const none = await api('/api/jobs?techStack=cobol');
  assert.equal(none.body.data.jobs.length, 0);

  const suggestions = await api('/api/skills?q=no');
  assert.deepEqual(suggestions.body.data.skills.map((skill) => skill.name), ['Node.js']);
});
