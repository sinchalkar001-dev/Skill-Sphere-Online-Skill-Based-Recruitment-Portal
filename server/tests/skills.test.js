import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Job, Skill } from '../models/index.js';
import { toSkillKey, toSkillKeys } from '../utils/skills.js';
import { trackSkillUsage, suggestSkills, rebuildSkillCatalog } from '../services/skill.service.js';
import { syncDatabase } from '../services/database.service.js';
import { connect, resetDatabase, disconnect, createUsers, createJob } from './helpers.js';

before(connect);
beforeEach(resetDatabase);
after(disconnect);

test('skill keys ignore case and surrounding whitespace, and drop duplicates', () => {
  assert.equal(toSkillKey('  Node.js '), 'node.js');
  assert.deepEqual(toSkillKeys(['React', 'react', ' REACT ', 'C++', '']), ['react', 'c++']);
});

test('a job keeps its skill keys in step with its tech stack', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  const job = await createJob(recruiter._id, { techStack: ['React', 'Node.js'] });

  let stored = await Job.findById(job._id).select('+techStackKeys');
  assert.deepEqual([...stored.techStackKeys], ['react', 'node.js']);

  stored.techStack = ['TypeScript'];
  await stored.save();
  stored = await Job.findById(job._id).select('+techStackKeys');
  assert.deepEqual([...stored.techStackKeys], ['typescript']);
});

test('filtering by skill matches regardless of how the tag was typed', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  await createJob(recruiter._id, { title: 'A', techStack: ['React', 'Node.js'] });
  await createJob(recruiter._id, { title: 'B', techStack: ['react'] });
  await createJob(recruiter._id, { title: 'C', techStack: ['Python'] });

  const matches = await Job.find({ isActive: true, techStackKeys: { $in: toSkillKeys(['REACT']) } }).lean();
  assert.deepEqual(matches.map((job) => job.title).sort(), ['A', 'B']);
});

test('keyword search finds postings by skill tag as well as title', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  await createJob(recruiter._id, { title: 'Platform Engineer', description: 'Own the platform.', techStack: ['Kubernetes'] });
  await createJob(recruiter._id, { title: 'Designer', description: 'Design things.', techStack: ['Figma'] });

  const matches = await Job.find({ $text: { $search: 'kubernetes' } }).lean();
  assert.deepEqual(matches.map((job) => job.title), ['Platform Engineer']);
});

test('the catalogue counts usage up and down and suggests the most used skills first', async () => {
  await trackSkillUsage('jobCount', [], ['React', 'Redis', 'Node.js']);
  await trackSkillUsage('jobCount', [], ['react', 'Rust']);
  await trackSkillUsage('candidateCount', [], ['REACT']);

  const react = await Skill.findOne({ key: 'react' });
  assert.equal(react.name, 'React'); // first spelling wins
  assert.equal(react.jobCount, 2);
  assert.equal(react.candidateCount, 1);

  const suggestions = await suggestSkills('re');
  assert.deepEqual(suggestions.map((skill) => skill.name), ['React', 'Redis']);

  await trackSkillUsage('jobCount', ['React', 'Redis'], ['React']); // Redis removed from a posting
  assert.equal((await Skill.findOne({ key: 'redis' })).jobCount, 0);
  assert.equal((await Skill.findOne({ key: 'react' })).jobCount, 2);
});

test('special characters in a suggestion query are treated literally', async () => {
  await trackSkillUsage('jobCount', [], ['C++', 'C#', 'CSS']);
  assert.deepEqual((await suggestSkills('c+')).map((skill) => skill.name), ['C++']);
  assert.deepEqual((await suggestSkills('.*')).length, 0);
});

test('syncDatabase backfills skill keys on old postings and builds the catalogue', async () => {
  const [recruiter] = await createUsers(1, 'recruiter');
  // A posting written before techStackKeys existed
  await Job.collection.insertOne({
    title: 'Legacy posting',
    description: 'Old data.',
    techStack: ['React', ' Node.js ', 'react'],
    recruiter: recruiter._id,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await syncDatabase();

  const job = await Job.findOne({ title: 'Legacy posting' }).select('+techStackKeys').lean();
  assert.deepEqual([...job.techStackKeys].sort(), ['node.js', 'react']);
  assert.equal(await Skill.countDocuments(), 2);

  assert.equal(await rebuildSkillCatalog(), 2); // idempotent
});
