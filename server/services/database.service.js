import * as models from '../models/index.js';
import { rebuildSkillCatalog } from './skill.service.js';

const { Job, Skill } = models;

/**
 * Bring an existing database in line with the current schemas:
 *  1. create new indexes and drop ones the schemas no longer declare
 *  2. backfill fields added since the data was written
 * Safe to run repeatedly.
 */
export const syncDatabase = async ({ log = () => {} } = {}) => {
  for (const model of Object.values(models)) {
    const dropped = await model.syncIndexes();
    if (dropped.length > 0) log(`${model.modelName}: dropped stale indexes ${dropped.join(', ')}`);
  }

  // Jobs written before techStackKeys existed. Mirrors utils/skills.js: trim + lowercase, de-duplicated.
  const backfilled = await Job.updateMany({ techStackKeys: { $exists: false } }, [
    {
      $set: {
        techStackKeys: {
          $setUnion: [
            {
              $map: {
                input: { $ifNull: ['$techStack', []] },
                in: { $toLower: { $trim: { input: '$$this' } } },
              },
            },
          ],
        },
      },
    },
  ]);
  if (backfilled.modifiedCount > 0) log(`Job: backfilled skill keys on ${backfilled.modifiedCount} postings`);

  if ((await Skill.estimatedDocumentCount()) === 0) {
    const count = await rebuildSkillCatalog();
    if (count > 0) log(`Skill: built catalogue of ${count} skills`);
  }
};

export default { syncDatabase };
