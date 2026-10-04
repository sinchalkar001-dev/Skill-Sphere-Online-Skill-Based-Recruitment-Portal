/**
 * Measures the dashboard queries before and after the compound indexes.
 *
 *   npm run benchmark                       # default dataset
 *   npm run benchmark -- --apps-per-job 800 --iterations 60
 *
 * "Before" recreates the indexes the project had prior to the compound-index
 * change; "after" is whatever the schemas declare now. Data, queries and code
 * path are identical in both runs. Runs against its own throwaway database.
 */
import mongoose from 'mongoose';
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import { Application, Job } from '../models/index.js';
import { getRecruiterStats, getCandidateStats, getJobStatusCounts } from '../services/application.service.js';
import { toSkillKeys } from '../utils/skills.js';
import { seedDataset, SKILLS } from './lib/dataset.js';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const URI = process.env.BENCHMARK_MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-sphere-benchmark';
const ITERATIONS = parseInt(option('iterations', '40'), 10);
const WARMUP = 5;
const dataset = {
  recruiters: parseInt(option('recruiters', '30'), 10),
  jobsPerRecruiter: parseInt(option('jobs-per-recruiter', '10'), 10),
  candidates: parseInt(option('candidates', '20000'), 10),
  applicationsPerJob: parseInt(option('apps-per-job', '520'), 10),
};
const outFile = option('out', null);

// Index set on main before this change (models at commit a70de01)
const BASELINE_INDEXES = {
  applications: [
    [{ job: 1 }],
    [{ candidate: 1 }],
    [{ job: 1, candidate: 1 }, { unique: true }],
    [{ status: 1 }],
  ],
  jobs: [
    [{ recruiter: 1 }],
    [{ isActive: 1, createdAt: -1 }],
    [{ techStack: 1 }],
    [{ title: 'text', description: 'text' }],
  ],
};

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
const round = (ms) => Math.round(ms * 100) / 100;

const applyBaselineIndexes = async () => {
  for (const [name, indexes] of Object.entries(BASELINE_INDEXES)) {
    const collection = mongoose.connection.collection(name);
    await collection.dropIndexes();
    for (const [keys, options] of indexes) await collection.createIndex(keys, options);
  }
};

const applySchemaIndexes = async () => {
  for (const model of [Application, Job]) {
    await model.collection.dropIndexes();
    await model.syncIndexes();
  }
};

// Pull docs/keys examined out of a find() or aggregate() explain result
const executionStats = (explain) => {
  const stats =
    explain.executionStats ||
    explain.stages?.[0]?.$cursor?.executionStats ||
    explain.shards?.[Object.keys(explain.shards)[0]]?.executionStats;
  return stats
    ? { docsExamined: stats.totalDocsExamined, keysExamined: stats.totalKeysExamined, returned: stats.nReturned }
    : {};
};

const buildQueries = ({ recruiters, candidates, jobs }) => {
  const statuses = ['applied', 'reviewing', 'shortlisted', 'assessed'];
  const at = (list, i) => list[i % list.length];

  return [
    {
      name: 'Recruiter dashboard: pipeline counts across all postings',
      run: (i) => getRecruiterStats(at(recruiters, i)),
      explain: async () => {
        const jobIds = await Job.find({ recruiter: recruiters[0] }).distinct('_id');
        return Application.aggregate([
          { $match: { job: { $in: jobIds } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).explain('executionStats');
      },
    },
    {
      name: 'Applicants page: status counts for one posting',
      run: (i) => getJobStatusCounts(at(jobs, i)._id),
      explain: () =>
        Application.aggregate([
          { $match: { job: jobs[0]._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).explain('executionStats'),
    },
    {
      name: 'Applicants page: one status, newest first (page of 20 + total)',
      run: (i) => {
        const filter = { job: at(jobs, i)._id, status: at(statuses, i) };
        return Promise.all([
          Application.find(filter).sort({ createdAt: -1 }).limit(20).lean(),
          Application.countDocuments(filter),
        ]);
      },
      explain: () =>
        Application.find({ job: jobs[0]._id, status: 'applied' }).sort({ createdAt: -1 }).limit(20).explain('executionStats'),
    },
    {
      name: 'Applicants page: all statuses, ranked by score (page of 20)',
      run: (i) =>
        Application.find({ job: at(jobs, i)._id }).sort({ 'assessment.percentageScore': -1 }).limit(20).lean(),
      explain: () =>
        Application.find({ job: jobs[0]._id }).sort({ 'assessment.percentageScore': -1 }).limit(20).explain('executionStats'),
    },
    {
      name: 'Candidate dashboard: own applications by status',
      run: (i) => getCandidateStats(at(candidates, i * 7)),
      explain: () =>
        Application.aggregate([
          { $match: { candidate: candidates[0] } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).explain('executionStats'),
    },
    {
      name: 'Job board: active postings for a skill tag, newest first (page of 12)',
      // Before the change the filter ran on the raw tags; now it runs on the normalised keys
      run: (i, phase) => {
        const tag = at(SKILLS, i);
        const filter =
          phase === 'before'
            ? { isActive: true, techStack: { $in: [tag] } }
            : { isActive: true, techStackKeys: { $in: toSkillKeys([tag]) } };
        return Job.find(filter).sort({ createdAt: -1 }).limit(12).lean();
      },
      explain: (phase) => {
        const filter =
          phase === 'before'
            ? { isActive: true, techStack: { $in: ['React'] } }
            : { isActive: true, techStackKeys: { $in: ['react'] } };
        return Job.find(filter).sort({ createdAt: -1 }).limit(12).explain('executionStats');
      },
    },
  ];
};

const measure = async (queries, phase) => {
  const results = [];
  for (const query of queries) {
    for (let i = 0; i < WARMUP; i++) await query.run(i, phase);

    const timings = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();
      await query.run(i + WARMUP, phase);
      timings.push(performance.now() - start);
    }
    timings.sort((a, b) => a - b);

    results.push({
      name: query.name,
      medianMs: round(percentile(timings, 50)),
      p95Ms: round(percentile(timings, 95)),
      ...executionStats(await query.explain(phase)),
    });
  }
  return results;
};

const main = async () => {
  // autoIndex off: this script decides exactly which indexes exist in each phase
  await mongoose.connect(URI, { autoIndex: false });
  console.log(`Benchmark database: ${mongoose.connection.db.databaseName}`);

  console.log('Seeding dataset...');
  const ids = await seedDataset({ ...dataset, log: (message) => console.log(`  ${message}`) });
  const queries = buildQueries(ids);

  console.log(`\nMeasuring with the previous indexes (${ITERATIONS} runs per query)...`);
  await applyBaselineIndexes();
  const before = await measure(queries, 'before');

  console.log('Measuring with the compound indexes...');
  await applySchemaIndexes();
  const after = await measure(queries, 'after');

  const rows = before.map((b, i) => {
    const a = after[i];
    return {
      query: b.name,
      beforeMedianMs: b.medianMs,
      afterMedianMs: a.medianMs,
      beforeP95Ms: b.p95Ms,
      afterP95Ms: a.p95Ms,
      medianChange: `${Math.round((1 - a.medianMs / b.medianMs) * 100)}%`,
      docsExaminedBefore: b.docsExamined,
      docsExaminedAfter: a.docsExamined,
    };
  });

  console.log('\nResults (lower is better; change is the reduction in median time)\n');
  for (const row of rows) {
    console.log(row.query);
    console.log(
      `  median ${row.beforeMedianMs} ms -> ${row.afterMedianMs} ms (${row.medianChange}),  p95 ${row.beforeP95Ms} ms -> ${row.afterP95Ms} ms,  docs examined ${row.docsExaminedBefore} -> ${row.docsExaminedAfter}`
    );
  }

  if (outFile) {
    const report = {
      ranAt: new Date().toISOString(),
      node: process.version,
      mongodb: (await mongoose.connection.db.admin().serverInfo()).version,
      dataset: ids.counts,
      iterations: ITERATIONS,
      results: rows,
    };
    fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
    fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nSaved ${outFile}`);
  }

  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
