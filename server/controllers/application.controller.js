import { Application, Job, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePagination, paginationMeta } from '../utils/helpers.js';
import { createNotification } from '../services/notification.service.js';
import { calculateAssessmentScore } from '../services/assessment.service.js';

/**
 * @desc    Submit a new application
 * @route   POST /api/applications
 * @access  Candidate
 */
export const createApplication = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, portfolioLinks, projectShowcase } = req.body;

  // Verify job exists and is active
  const job = await Job.findById(jobId).populate('recruiter', 'name email');
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  if (!job.isActive) {
    throw ApiError.badRequest('This job is no longer accepting applications');
  }
  if (job.isExpired) {
    throw ApiError.badRequest('Application deadline has passed');
  }
  if (job.isFull) {
    throw ApiError.badRequest('Maximum number of applications reached');
  }

  // Check for duplicate application
  const existing = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });
  if (existing) {
    throw ApiError.conflict('You have already applied for this job');
  }

  // Create application
  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    coverLetter,
    portfolioLinks,
    projectShowcase,
  });

  // Increment applications count
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  // Notify recruiter
  await createNotification({
    recipientId: job.recruiter._id,
    type: 'application_received',
    title: 'New Application Received',
    message: `${req.user.name} applied for "${job.title}"`,
    relatedJob: job._id,
    relatedApplication: application._id,
    emailTemplate: 'applicationReceived',
    recipientEmail: job.recruiter.email,
    emailData: {
      candidateName: req.user.name,
      jobTitle: job.title,
    },
  });

  const populated = await Application.findById(application._id)
    .populate('job', 'title company techStack')
    .populate('candidate', 'name email avatar skills')
    .lean();

  res.status(201).json({
    status: 'success',
    message: 'Application submitted successfully',
    data: { application: populated },
  });
});

/**
 * @desc    Get candidate's own applications
 * @route   GET /api/applications/my
 * @access  Candidate
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const filter = { candidate: req.user._id };
  if (status) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate({
        path: 'job',
        select: 'title techStack salary location locationType jobType recruiter isActive',
        populate: { path: 'recruiter', select: 'name company' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    data: { applications },
    pagination: paginationMeta(total, page, limit),
  });
});

/**
 * @desc    Get applications for a job (recruiter view)
 * @route   GET /api/applications/job/:jobId
 * @access  Recruiter (job owner)
 */
export const getJobApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, sort = '-createdAt' } = req.query;

  // Verify job ownership
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only view applications for your own jobs');
  }

  const filter = { job: req.params.jobId };
  if (status) filter.status = status;

  const sortMap = {
    '-createdAt': { createdAt: -1 },
    'createdAt': { createdAt: 1 },
    '-score': { 'assessment.percentageScore': -1 },
    'score': { 'assessment.percentageScore': 1 },
  };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('candidate', 'name email avatar skills experience location portfolio projects')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  res.json({
    status: 'success',
    data: { applications, job: { _id: job._id, title: job.title } },
    pagination: paginationMeta(total, page, limit),
  });
});

/**
 * @desc    Get a single application
 * @route   GET /api/applications/:id
 * @access  Application owner or job recruiter
 */
export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidate', 'name email avatar skills experience location portfolio projects bio phone')
    .populate({
      path: 'job',
      select: 'title description techStack salary location locationType jobType experienceLevel recruiter assessment',
      populate: { path: 'recruiter', select: 'name email company' },
    })
    .lean();

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  // Authorization: candidate who applied OR recruiter who posted the job
  const isCandidateOwner = application.candidate._id.toString() === req.user._id.toString();
  const isRecruiterOwner = application.job.recruiter._id.toString() === req.user._id.toString();

  if (!isCandidateOwner && !isRecruiterOwner) {
    throw ApiError.forbidden('You are not authorized to view this application');
  }

  res.json({
    status: 'success',
    data: { application },
  });
});

/**
 * @desc    Update application status
 * @route   PATCH /api/applications/:id/status
 * @access  Recruiter (job owner)
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('candidate', 'name email')
    .populate('job', 'title recruiter');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  // Verify job ownership
  if (application.job.recruiter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only update applications for your own jobs');
  }

  // Update status with history tracking
  application.status = status;
  if (notes) {
    application.statusHistory[application.statusHistory.length - 1].notes = notes;
    application.statusHistory[application.statusHistory.length - 1].changedBy = req.user._id;
  }
  await application.save();

  // Determine notification type
  const notificationTypeMap = {
    shortlisted: 'shortlisted',
    rejected: 'rejected',
    accepted: 'accepted',
    reviewing: 'application_status_change',
    assessed: 'assessment_complete',
  };

  // Notify candidate
  await createNotification({
    recipientId: application.candidate._id,
    type: notificationTypeMap[status] || 'application_status_change',
    title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your application for "${application.job.title}" has been ${status}`,
    relatedJob: application.job._id,
    relatedApplication: application._id,
    emailTemplate: 'statusChange',
    recipientEmail: application.candidate.email,
    emailData: {
      candidateName: application.candidate.name,
      jobTitle: application.job.title,
      status,
      feedback: notes || '',
    },
  });

  res.json({
    status: 'success',
    message: `Application status updated to ${status}`,
    data: { application },
  });
});

/**
 * @desc    Withdraw application
 * @route   DELETE /api/applications/:id
 * @access  Candidate (owner)
 */
export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (application.candidate.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only withdraw your own applications');
  }

  // Can only withdraw if not yet accepted
  if (application.status === 'accepted') {
    throw ApiError.badRequest('Cannot withdraw an accepted application');
  }

  // Decrement count
  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
  await Application.findByIdAndDelete(req.params.id);

  res.json({
    status: 'success',
    message: 'Application withdrawn successfully',
  });
});
