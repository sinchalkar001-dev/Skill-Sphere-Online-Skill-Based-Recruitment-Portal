import { Application, Job } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePagination, paginationMeta } from '../utils/helpers.js';
import { createNotification } from '../services/notification.service.js';
import {
  submitApplication,
  withdrawApplication as withdraw,
  getJobStatusCounts,
  getCandidateStats,
  getRecruiterStats,
} from '../services/application.service.js';

/**
 * @desc    Submit a new application
 * @route   POST /api/applications
 * @access  Candidate
 */
export const createApplication = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, portfolioLinks, projectShowcase } = req.body;

  const { application, job } = await submitApplication({
    jobId,
    candidateId: req.user._id,
    coverLetter,
    portfolioLinks,
    projectShowcase,
  });

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

  // Same shape a populated read would return, built from records already in hand
  const { _id, name, email, avatar, skills } = req.user;
  const populated = {
    ...application.toObject(),
    job: { _id: job._id, title: job.title, techStack: job.techStack },
    candidate: { _id, name, email, avatar, skills },
  };

  res.status(201).json({
    status: 'success',
    message: 'Application submitted successfully',
    data: { application: populated },
  });
});

/**
 * @desc    Dashboard numbers for the signed-in user
 * @route   GET /api/applications/stats
 * @access  Candidate (own applications) or Recruiter (pipeline across own postings)
 */
export const getApplicationStats = asyncHandler(async (req, res) => {
  const stats =
    req.user.role === 'recruiter'
      ? await getRecruiterStats(req.user._id)
      : await getCandidateStats(req.user._id);

  res.json({
    status: 'success',
    data: { stats },
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
  const job = await Job.findById(req.params.jobId).select('title recruiter').lean();
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only view applications for your own jobs');
  }

  const filter = { job: job._id };
  if (status) filter.status = status;

  const sortMap = {
    '-createdAt': { createdAt: -1 },
    'createdAt': { createdAt: 1 },
    '-score': { 'assessment.percentageScore': -1 },
    'score': { 'assessment.percentageScore': 1 },
  };

  const [applications, statusCounts] = await Promise.all([
    Application.find(filter)
      .populate('candidate', 'name email avatar skills experience location portfolio projects')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    getJobStatusCounts(job._id),
  ]);
  // The per-status counts already hold the total for this filter
  const total = status ? statusCounts.byStatus[status] ?? 0 : statusCounts.total;

  res.json({
    status: 'success',
    data: { applications, job: { _id: job._id, title: job.title }, statusCounts },
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
  await withdraw({ applicationId: req.params.id, candidateId: req.user._id });

  res.json({
    status: 'success',
    message: 'Application withdrawn successfully',
  });
});
