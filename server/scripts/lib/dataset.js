import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Job, Application, Notification } from '../../models/index.js';
import { toSkillKeys } from '../../utils/skills.js';

const SKILLS = [
  'React', 'Node.js', 'TypeScript', 'JavaScript', 'MongoDB', 'PostgreSQL', 'Python', 'Django', 'Flask', 'Java',
  'Spring Boot', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Redis', 'GraphQL',
  'Next.js', 'Vue', 'Angular', 'Tailwind CSS', 'Express', 'Kafka', 'RabbitMQ', 'Terraform', 'Jenkins', 'Figma',
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'MySQL', 'Elasticsearch', 'Linux', 'Git', 'CI/CD', 'Jest',
];
const TITLES = ['Frontend Engineer', 'Backend Engineer', 'Full-Stack Developer', 'DevOps Engineer', 'Mobile Developer', 'Data Engineer', 'QA Engineer', 'Platform Engineer'];
const CITIES = ['Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi', 'Chennai', 'Kolkata', 'Remote'];
// Share of applications in each stage of the pipeline
const STATUS_MIX = [['applied', 0.45], ['reviewing', 0.2], ['shortlisted', 0.12], ['assessed', 0.1], ['rejected', 0.1], ['accepted', 0.03]];
const COVER_LETTER =
  'I have spent the last few years building and shipping production web applications, and this role lines up with the work I enjoy most. ' +
  'My recent projects cover API design, data modelling and front-end performance, and I am comfortable owning a feature from the first sketch to deployment. ' +
  'I would welcome the chance to talk through the attached projects and how I could contribute to the team.';

const DAY = 24 * 60 * 60 * 1000;

// Deterministic PRNG so every run builds the same dataset
const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const insertInBatches = async (collection, docs, size = 5000) => {
  for (let i = 0; i < docs.length; i += size) {
    await collection.insertMany(docs.slice(i, i + size), { ordered: false });
  }
};

/**
 * Refuse to touch anything but a throwaway database.
 */
export const assertDisposableDatabase = () => {
  const name = mongoose.connection.db.databaseName;
  if (!/-(benchmark|loadtest|test)$/.test(name)) {
    throw new Error(`Refusing to run against "${name}". Use a database whose name ends in -benchmark, -loadtest or -test.`);
  }
  return name;
};

/**
 * Fill the current (disposable) database with a platform-sized dataset.
 * Documents are inserted directly, so no indexes other than _id exist afterwards.
 */
export const seedDataset = async ({
  recruiters = 30,
  jobsPerRecruiter = 10,
  candidates = 20000,
  applicationsPerJob = 520,
  seed = 42,
  log = () => {},
} = {}) => {
  assertDisposableDatabase();
  await mongoose.connection.db.dropDatabase();

  const random = mulberry32(seed);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const pickSome = (list, count) => {
    const chosen = new Set();
    while (chosen.size < count) chosen.add(pick(list));
    return [...chosen];
  };
  const now = Date.now();
  const password = await bcrypt.hash('password123', 4);

  // ── Users ── (example.test is a reserved domain: nothing here can ever be emailed)
  const recruiterDocs = Array.from({ length: recruiters }, (_, i) => ({
    _id: new mongoose.Types.ObjectId(),
    name: `Recruiter ${i + 1}`,
    email: `recruiter${i + 1}@example.test`,
    password,
    role: 'recruiter',
    company: { name: `Company ${i + 1}`, size: '51-200' },
    isActive: true,
    createdAt: new Date(now - 120 * DAY),
    updatedAt: new Date(now - 120 * DAY),
  }));
  const candidateDocs = Array.from({ length: candidates }, (_, i) => ({
    _id: new mongoose.Types.ObjectId(),
    name: `Candidate ${i + 1}`,
    email: `candidate${i + 1}@example.test`,
    password,
    role: 'candidate',
    skills: pickSome(SKILLS, 5),
    experience: Math.floor(random() * 10),
    location: pick(CITIES),
    isActive: true,
    createdAt: new Date(now - 100 * DAY),
    updatedAt: new Date(now - 100 * DAY),
  }));
  await insertInBatches(User.collection, [...recruiterDocs, ...candidateDocs]);
  log(`users: ${recruiters} recruiters, ${candidates} candidates`);

  // ── Jobs ──
  const jobDocs = [];
  for (const recruiter of recruiterDocs) {
    for (let j = 0; j < jobsPerRecruiter; j++) {
      const techStack = pickSome(SKILLS, 6);
      const createdAt = new Date(now - (30 + Math.floor(random() * 60)) * DAY);
      jobDocs.push({
        _id: new mongoose.Types.ObjectId(),
        title: `${pick(TITLES)} ${jobDocs.length + 1}`,
        description: `We are hiring for a role working with ${techStack.join(', ')}. You will ship features end to end with a small team.`,
        requirements: ['3+ years of relevant experience', 'Strong communication'],
        responsibilities: ['Build and maintain product features', 'Review code'],
        techStack,
        techStackKeys: toSkillKeys(techStack),
        recruiter: recruiter._id,
        salary: { min: 800000, max: 2400000, currency: 'INR', period: 'yearly' },
        location: pick(CITIES),
        locationType: pick(['remote', 'onsite', 'hybrid']),
        jobType: pick(['full-time', 'full-time', 'contract', 'internship']),
        experienceLevel: pick(['entry', 'mid', 'senior', 'lead']),
        applicationsCount: 0,
        isActive: random() < 0.85,
        assessment: { enabled: true, criteria: [] },
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  // ── Applications ── each posting gets a distinct set of candidates
  const applicationDocs = [];
  for (const job of jobDocs) {
    const count = Math.round(applicationsPerJob * (0.9 + random() * 0.2));
    const start = Math.floor(random() * candidates);
    let step = 1 + Math.floor(random() * (candidates - 1));
    while (gcd(step, candidates) !== 1) step += 1;

    for (let k = 0; k < Math.min(count, candidates); k++) {
      const candidate = candidateDocs[(start + k * step) % candidates];
      const roll = random();
      let cumulative = 0;
      const status = STATUS_MIX.find(([, share]) => (cumulative += share) >= roll)?.[0] || 'applied';
      const createdAt = new Date(job.createdAt.getTime() + Math.floor(random() * 29 * DAY));
      const scored = status === 'assessed' || (status === 'accepted' && random() < 0.8);
      const percentageScore = scored ? 40 + Math.floor(random() * 60) : 0;

      applicationDocs.push({
        job: job._id,
        candidate: candidate._id,
        coverLetter: COVER_LETTER,
        portfolioLinks: [],
        projectShowcase: [
          { title: 'Sample project', description: 'A production web application.', techStack: job.techStack.slice(0, 3), url: 'https://example.test/project' },
        ],
        status,
        assessment: {
          scores: [],
          totalScore: 0,
          maxPossibleScore: 0,
          percentageScore,
          ...(scored && { assessedAt: createdAt }),
        },
        statusHistory: [{ status, changedAt: createdAt }],
        createdAt,
        updatedAt: createdAt,
      });
    }
    job.applicationsCount = Math.min(count, candidates);
  }
  await insertInBatches(Job.collection, jobDocs);
  await insertInBatches(Application.collection, applicationDocs);
  log(`jobs: ${jobDocs.length}, applications: ${applicationDocs.length} (about ${applicationsPerJob} per posting)`);

  // ── Notifications ── for the accounts a load test signs in as
  const notified = [...recruiterDocs, ...candidateDocs.slice(0, 1000)];
  const notificationDocs = notified.flatMap((user) =>
    Array.from({ length: 5 }, (_, n) => ({
      recipient: user._id,
      type: 'application_status_change',
      title: 'Application update',
      message: 'There is an update on an application.',
      isRead: n > 1,
      isEmailSent: true,
      createdAt: new Date(now - n * DAY),
      updatedAt: new Date(now - n * DAY),
    }))
  );
  await insertInBatches(Notification.collection, notificationDocs);

  return {
    recruiters: recruiterDocs.map(({ _id }) => _id),
    candidates: candidateDocs.map(({ _id }) => _id),
    jobs: jobDocs.map(({ _id, recruiter, isActive, techStack }) => ({ _id, recruiter, isActive, techStack })),
    counts: {
      recruiters,
      candidates,
      jobs: jobDocs.length,
      applications: applicationDocs.length,
    },
  };
};

export { SKILLS };
