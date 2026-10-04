import mongoose from 'mongoose';
import env from '../config/env.js';
import * as models from '../models/index.js';

const { User, Job } = models;

export const connect = async () => {
  await mongoose.connect(env.MONGODB_URI, { autoIndex: false });
  const name = mongoose.connection.db.databaseName;
  if (!name.endsWith('-test')) throw new Error(`Refusing to run tests against "${name}"`);
};

/** Empty database with the schema's indexes in place (the unique indexes matter to these tests). */
export const resetDatabase = async () => {
  await mongoose.connection.db.dropDatabase();
  for (const model of Object.values(models)) await model.syncIndexes();
};

export const disconnect = async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};

// Users are inserted directly: these tests need accounts, not password hashing
export const createUsers = async (count, role = 'candidate') => {
  const docs = Array.from({ length: count }, (_, i) => ({
    _id: new mongoose.Types.ObjectId(),
    name: `${role} ${i + 1}`,
    email: `${role}${i + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`,
    password: 'not-a-real-hash',
    role,
    isActive: true,
  }));
  await User.collection.insertMany(docs);
  return docs;
};

export const createJob = async (recruiterId, overrides = {}) =>
  Job.create({
    title: 'Backend Engineer',
    description: 'Build APIs.',
    techStack: ['Node.js', 'MongoDB'],
    recruiter: recruiterId,
    ...overrides,
  });
