import { Skill, Job, User } from '../models/index.js';
import { toSkillKey, toSkillKeys } from '../utils/skills.js';
import { escapeRegex } from '../utils/helpers.js';

/**
 * Keep the catalogue's usage counts in step when a job's or a candidate's tags change.
 * The catalogue is an aid, not a source of truth, so a failure here never fails the request.
 * @param {'jobCount'|'candidateCount'} field
 */
export const trackSkillUsage = async (field, before = [], after = []) => {
  const beforeKeys = new Set(toSkillKeys(before));
  const afterNames = new Map();
  for (const tag of after) {
    const key = toSkillKey(tag);
    if (key && !afterNames.has(key)) afterNames.set(key, String(tag).trim());
  }

  const ops = [];
  for (const [key, name] of afterNames) {
    if (!beforeKeys.has(key)) {
      ops.push({
        updateOne: { filter: { key }, update: { $inc: { [field]: 1 }, $setOnInsert: { name } }, upsert: true },
      });
    }
  }
  for (const key of beforeKeys) {
    if (!afterNames.has(key)) {
      ops.push({ updateOne: { filter: { key, [field]: { $gt: 0 } }, update: { $inc: { [field]: -1 } } } });
    }
  }
  if (ops.length === 0) return;

  try {
    await Skill.bulkWrite(ops, { ordered: false });
  } catch (error) {
    console.error('Skill catalogue update failed:', error.message);
  }
};

/**
 * Suggestions for the tag input: skills starting with `query`, most used first.
 */
export const suggestSkills = async (query = '', limit = 8) => {
  const key = toSkillKey(query);
  const filter = key ? { key: { $regex: `^${escapeRegex(key)}` } } : {};
  return Skill.find(filter)
    .sort({ jobCount: -1, candidateCount: -1, key: 1 })
    .limit(limit)
    .select('name key jobCount candidateCount -_id')
    .lean();
};

const tagUsage = (Model, path, match = {}) =>
  Model.aggregate([
    { $match: match },
    { $unwind: `$${path}` },
    {
      $group: {
        _id: { $toLower: { $trim: { input: `$${path}` } } },
        name: { $first: { $trim: { input: `$${path}` } } },
        count: { $sum: 1 },
      },
    },
    { $match: { _id: { $ne: '' } } },
  ]);

/**
 * Rebuild the catalogue from the tags currently on jobs and candidate profiles.
 */
export const rebuildSkillCatalog = async () => {
  const [fromJobs, fromCandidates] = await Promise.all([
    tagUsage(Job, 'techStack'),
    tagUsage(User, 'skills', { role: 'candidate' }),
  ]);

  const skills = new Map();
  for (const { _id: key, name, count } of fromJobs) {
    skills.set(key, { key, name, jobCount: count, candidateCount: 0 });
  }
  for (const { _id: key, name, count } of fromCandidates) {
    const skill = skills.get(key) || { key, name, jobCount: 0, candidateCount: 0 };
    skill.candidateCount = count;
    skills.set(key, skill);
  }

  await Skill.deleteMany({});
  if (skills.size > 0) await Skill.insertMany([...skills.values()]);
  return skills.size;
};

export default { trackSkillUsage, suggestSkills, rebuildSkillCatalog };
