/**
 * Reconcile the database with the current schemas: create/drop indexes and
 * backfill derived fields. Run after deploying a schema change:
 *
 *   npm run db:sync
 */
import mongoose from 'mongoose';
import env from '../config/env.js';
import { syncDatabase } from '../services/database.service.js';

const main = async () => {
  await mongoose.connect(env.MONGODB_URI, { autoIndex: false });
  console.log(`Syncing ${mongoose.connection.db.databaseName}...`);
  await syncDatabase({ log: (message) => console.log(`  ${message}`) });
  console.log('Done.');
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
