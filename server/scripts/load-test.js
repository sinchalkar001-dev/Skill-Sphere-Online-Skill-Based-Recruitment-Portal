/**
 * Load test: N concurrent signed-in users against a real API instance.
 *
 *   npm run loadtest                                   # 200 users, 10 s ramp-up + 60 s, 1 s think time
 *   npm run loadtest -- --users 200 --duration 120 --think 0
 *
 * The script seeds a throwaway database, starts its own server on a spare port
 * (rate limiting off, since every request comes from one IP; SMTP off), brings
 * the users on over a ramp-up period, then measures latency while all of them
 * are active. Failures are counted over the whole run, ramp-up included. It never
 * touches the development database or sends email.
 */
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Application } from '../models/index.js';
import { syncDatabase } from '../services/database.service.js';
import { seedDataset, SKILLS } from './lib/dataset.js';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const URI = process.env.LOADTEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-sphere-loadtest';
const PORT = parseInt(option('port', '5099'), 10);
const BASE = `http://127.0.0.1:${PORT}`;
const USERS = parseInt(option('users', '200'), 10);
const DURATION_S = parseInt(option('duration', '60'), 10);
const RAMP_S = parseInt(option('ramp', '10'), 10);
const THINK_MS = parseInt(option('think', '1000'), 10);
const outFile = option('out', null);
const JWT_SECRET = 'load-test-only-secret';
const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
const round = (ms) => Math.round(ms * 10) / 10;

let server = null;

const startServer = async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: SERVER_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(PORT),
      MONGODB_URI: URI,
      JWT_SECRET,
      RATE_LIMIT_ENABLED: 'false',
      SYNC_INDEXES: 'false',
      EMAIL_USER: '',
      EMAIL_PASSWORD: '',
    },
    stdio: ['ignore', 'ignore', 'inherit'],
  });

  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/health`)).ok) return server;
    } catch {
      // not listening yet
    }
    await sleep(500);
  }
  server.kill();
  throw new Error('Server did not start');
};

// Weighted request mix for each role: [weight, name, build(user) -> { path, method?, body? }]
const candidateActions = (jobs) => [
  [25, 'GET /jobs', () => ({ path: `/api/jobs?page=${1 + Math.floor(Math.random() * 5)}&limit=12` })],
  [10, 'GET /jobs?techStack', () => ({ path: `/api/jobs?techStack=${encodeURIComponent(pick(SKILLS))}&limit=12` })],
  [10, 'GET /jobs?search', () => ({ path: `/api/jobs?search=${encodeURIComponent(pick(SKILLS))}&limit=12` })],
  [20, 'GET /jobs/:id', () => ({ path: `/api/jobs/${pick(jobs)._id}` })],
  [12, 'GET /applications/my', () => ({ path: '/api/applications/my?limit=10' })],
  [8, 'GET /applications/stats', () => ({ path: '/api/applications/stats' })],
  [8, 'GET /notifications', () => ({ path: '/api/notifications?limit=20' })],
  [4, 'GET /skills', () => ({ path: `/api/skills?q=${pick(['re', 'no', 'py', 'ja', 'do'])}` })],
  [
    3,
    'POST /applications',
    (user) => {
      const job = user.openJobs.pop();
      if (!job) return { path: '/api/applications/my?limit=10' };
      return { path: '/api/applications', method: 'POST', body: { jobId: job, coverLetter: 'Load test application.' } };
    },
  ],
];

const recruiterActions = () => [
  [30, 'GET /applications/stats', () => ({ path: '/api/applications/stats' })],
  [25, 'GET /jobs/my-jobs', () => ({ path: '/api/jobs/my-jobs?limit=50' })],
  [
    35,
    'GET /applications/job/:id',
    (user) => ({
      path: `/api/applications/job/${pick(user.jobs)}?limit=20&status=${pick(['', 'applied', 'reviewing', 'shortlisted'])}&sort=${pick(['-createdAt', '-score'])}`,
    }),
  ],
  [10, 'GET /notifications', () => ({ path: '/api/notifications?limit=20' })],
];

const chooseAction = (actions) => {
  let roll = Math.random() * actions.reduce((sum, [weight]) => sum + weight, 0);
  return actions.find(([weight]) => (roll -= weight) < 0) || actions[0];
};

const runUser = async (user, actions, startDelayMs, deadline, samples) => {
  // Users arrive one after another across the ramp-up period
  await sleep(startDelayMs);

  while (performance.now() < deadline) {
    const [, name, build] = chooseAction(actions);
    const { path: url, method = 'GET', body } = build(user);
    const start = performance.now();
    let status = 0;
    try {
      const response = await fetch(BASE + url, {
        method,
        headers: { Authorization: `Bearer ${user.token}`, ...(body && { 'Content-Type': 'application/json' }) },
        body: body ? JSON.stringify(body) : undefined,
      });
      await response.arrayBuffer();
      status = response.status;
    } catch {
      status = 0; // connection error
    }
    samples.push({ name, status, at: start, ms: performance.now() - start });

    if (THINK_MS > 0) await sleep(THINK_MS * (0.5 + Math.random()));
  }
};

const main = async () => {
  await mongoose.connect(URI, { autoIndex: false });
  console.log(`Load-test database: ${mongoose.connection.db.databaseName}`);

  console.log('Seeding dataset...');
  const ids = await seedDataset({ log: (message) => console.log(`  ${message}`) });
  await syncDatabase();
  console.log('  indexes built');

  // 75% candidates, 25% recruiters, each a different account with its own token
  const recruiterCount = Math.min(ids.recruiters.length, Math.round(USERS * 0.25));
  const candidateIds = ids.candidates.slice(0, USERS - recruiterCount);
  const sign = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });

  const applied = new Map(candidateIds.map((id) => [id.toString(), new Set()]));
  for (const { job, candidate } of await Application.find({ candidate: { $in: candidateIds } }).select('job candidate').lean()) {
    applied.get(candidate.toString()).add(job.toString());
  }
  const activeJobs = ids.jobs.filter((job) => job.isActive);

  const users = [
    ...candidateIds.map((id) => ({
      role: 'candidate',
      token: sign(id),
      // Active postings this candidate has not applied to yet, so every POST is a valid new application
      openJobs: activeJobs.map((job) => job._id.toString()).filter((jobId) => !applied.get(id.toString()).has(jobId)),
    })),
    ...ids.recruiters.slice(0, recruiterCount).map((id) => ({
      role: 'recruiter',
      token: sign(id),
      jobs: ids.jobs.filter((job) => job.recruiter.equals(id)).map((job) => job._id.toString()),
    })),
  ];

  console.log('Starting server...');
  await startServer();

  console.log(`Ramping to ${users.length} concurrent users over ${RAMP_S} s, then measuring for ${DURATION_S} s (think time ${THINK_MS} ms)...`);
  const allSamples = [];
  const actions = { candidate: candidateActions(ids.jobs), recruiter: recruiterActions() };
  const started = performance.now();
  const steadyFrom = started + RAMP_S * 1000;
  const deadline = steadyFrom + DURATION_S * 1000;
  const shuffled = [...users].sort(() => Math.random() - 0.5);
  await Promise.all(
    shuffled.map((user, i) =>
      runUser(user, actions[user.role], (i / shuffled.length) * RAMP_S * 1000, deadline, allSamples)
    )
  );
  const elapsedS = DURATION_S;

  server.kill();

  // ── Report ── latency over the steady-state window; failures over the whole run
  const samples = allSamples.filter((sample) => sample.at >= steadyFrom);
  const latencies = samples.map((sample) => sample.ms).sort((a, b) => a - b);
  const failures = allSamples.filter((sample) => sample.status < 200 || sample.status >= 400);
  const failuresByStatus = {};
  for (const { status } of failures) failuresByStatus[status || 'network'] = (failuresByStatus[status || 'network'] || 0) + 1;

  const byEndpoint = {};
  for (const sample of samples) (byEndpoint[sample.name] ||= []).push(sample.ms);
  const endpoints = Object.entries(byEndpoint)
    .map(([name, times]) => {
      times.sort((a, b) => a - b);
      return { name, requests: times.length, p50Ms: round(percentile(times, 50)), p95Ms: round(percentile(times, 95)) };
    })
    .sort((a, b) => b.p95Ms - a.p95Ms);

  const report = {
    ranAt: new Date().toISOString(),
    node: process.version,
    mongodb: (await mongoose.connection.db.admin().serverInfo()).version,
    dataset: ids.counts,
    users: users.length,
    rampUpS: RAMP_S,
    durationS: Math.round(elapsedS),
    thinkTimeMs: THINK_MS,
    requests: samples.length,
    requestsIncludingRampUp: allSamples.length,
    requestsPerSecond: Math.round(samples.length / elapsedS),
    failedRequests: failures.length,
    failuresByStatus,
    latencyMs: {
      p50: round(percentile(latencies, 50)),
      p95: round(percentile(latencies, 95)),
      p99: round(percentile(latencies, 99)),
      max: round(latencies[latencies.length - 1]),
    },
    endpoints,
  };

  console.log(`\n${report.requests} requests in ${report.durationS} s at ${report.users} users (${report.requestsPerSecond} req/s)`);
  console.log(`Failed requests (whole run, ${allSamples.length} requests): ${report.failedRequests}${failures.length ? ` ${JSON.stringify(failuresByStatus)}` : ''}`);
  console.log(`Latency: p50 ${report.latencyMs.p50} ms, p95 ${report.latencyMs.p95} ms, p99 ${report.latencyMs.p99} ms, max ${report.latencyMs.max} ms\n`);
  for (const endpoint of endpoints) {
    console.log(`  ${endpoint.name.padEnd(28)} ${String(endpoint.requests).padStart(6)} requests   p50 ${String(endpoint.p50Ms).padStart(6)} ms   p95 ${String(endpoint.p95Ms).padStart(6)} ms`);
  }

  if (outFile) {
    fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
    fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nSaved ${outFile}`);
  }

  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  process.exit(failures.length > 0 ? 1 : 0);
};

main().catch(async (error) => {
  console.error(error);
  server?.kill();
  await mongoose.disconnect();
  process.exit(1);
});
