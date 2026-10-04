import { Job, Application } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePagination, paginationMeta, escapeRegex } from '../utils/helpers.js';
import { toSkillKeys } from '../utils/skills.js';
import { trackSkillUsage } from '../services/skill.service.js';

/**
 * @desc    Get all active jobs (public, paginated, filterable)
 * @route   GET /api/jobs
 * @access  Public
 */
export const getJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const {
    search,
    techStack,
    jobType,
    experienceLevel,
    locationType,
    location,
    salaryMin,
    salaryMax,
    sort = '-createdAt',
  } = req.query;

  // Build filter
  const filter = { isActive: true };

  // Keyword search across title, skill tags and description
  if (search) {
    filter.$text = { $search: search };
  }

  // Skill tag filter (match any, case-insensitive via the normalised keys)
  if (techStack) {
    const keys = toSkillKeys(String(techStack).split(','));
    if (keys.length > 0) filter.techStackKeys = { $in: keys };
  }

  // Enum filters
  if (jobType) filter.jobType = jobType;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (locationType) filter.locationType = locationType;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };

  // Salary range
  if (salaryMin) filter['salary.min'] = { $gte: parseInt(salaryMin, 10) };
  if (salaryMax) filter['salary.max'] = { $lte: parseInt(salaryMax, 10) };

  // Sort mapping
  const sortMap = {
    '-createdAt': { createdAt: -1 },
    'createdAt': { createdAt: 1 },
    '-salary': { 'salary.max': -1 },
    'salary': { 'salary.min': 1 },
    'title': { title: 1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('recruiter', 'name email avatar company')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    data: { jobs },
    pagination: paginationMeta(total, page, limit),
  });
});

/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('recruiter', 'name email avatar company')
    .lean();

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  res.json({
    status: 'success',
    data: { job },
  });
});

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Recruiter
 */
export const createJob = asyncHandler(async (req, res) => {
  const jobData = {
    ...req.body,
    recruiter: req.user._id,
  };

  const job = await Job.create(jobData);
  await trackSkillUsage('jobCount', [], job.techStack);
  const populated = await Job.findById(job._id)
    .populate('recruiter', 'name email avatar company')
    .lean();

  res.status(201).json({
    status: 'success',
    message: 'Job posted successfully',
    data: { job: populated },
  });
});

/**
 * @desc    Update a job
 * @route   PUT /api/jobs/:id
 * @access  Recruiter (owner)
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Verify ownership
  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only update your own job postings');
  }

  // Prevent updating certain fields
  const { recruiter, applicationsCount, techStackKeys, ...updateData } = req.body;

  // Saving the document (rather than findByIdAndUpdate) runs validators and the
  // hook that keeps the skill keys in step with the tech stack
  const previousTechStack = [...job.techStack];
  job.set(updateData);
  await job.save();
  await trackSkillUsage('jobCount', previousTechStack, job.techStack);
  await job.populate('recruiter', 'name email avatar company');

  res.json({
    status: 'success',
    message: 'Job updated successfully',
    data: { job },
  });
});

/**
 * @desc    Delete a job
 * @route   DELETE /api/jobs/:id
 * @access  Recruiter (owner)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only delete your own job postings');
  }

  // Delete associated applications
  await Application.deleteMany({ job: job._id });
  await Job.findByIdAndDelete(req.params.id);
  await trackSkillUsage('jobCount', job.techStack, []);

  res.json({
    status: 'success',
    message: 'Job and associated applications deleted',
  });
});

/**
 * @desc    Get recruiter's own jobs
 * @route   GET /api/jobs/my-jobs
 * @access  Recruiter
 */
export const getMyJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const filter = { recruiter: req.user._id };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    data: { jobs },
    pagination: paginationMeta(total, page, limit),
  });
});

/**
 * @desc    Toggle job active status
 * @route   PATCH /api/jobs/:id/toggle
 * @access  Recruiter (owner)
 */
export const toggleJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only modify your own job postings');
  }

  job.isActive = !job.isActive;
  await job.save();

  res.json({
    status: 'success',
    message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { job },
  });
});
