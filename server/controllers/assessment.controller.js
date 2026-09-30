import { Application, Job } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateAssessmentScore, getGrade } from '../services/assessment.service.js';
import { createNotification } from '../services/notification.service.js';

/**
 * @desc    Submit assessment scores for an application
 * @route   PATCH /api/applications/:id/assess
 * @access  Recruiter (job owner)
 */
export const assessApplication = asyncHandler(async (req, res) => {
  const { scores, overallFeedback } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('candidate', 'name email')
    .populate('job', 'title recruiter assessment');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  // Verify job ownership
  if (application.job.recruiter.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only assess applications for your own jobs');
  }

  // Calculate scores
  const criteriaWeights = application.job.assessment?.criteria || [];
  const { totalScore, maxPossibleScore, percentageScore } = calculateAssessmentScore(
    scores,
    criteriaWeights
  );

  // Update application
  application.assessment = {
    scores,
    totalScore,
    maxPossibleScore,
    percentageScore,
    assessedBy: req.user._id,
    assessedAt: new Date(),
    overallFeedback: overallFeedback || '',
  };
  application.status = 'assessed';
  await application.save();

  const grade = getGrade(percentageScore);

  // Notify candidate
  await createNotification({
    recipientId: application.candidate._id,
    type: 'assessment_complete',
    title: 'Assessment Complete',
    message: `Your application for "${application.job.title}" has been assessed. Score: ${percentageScore}% (${grade})`,
    relatedJob: application.job._id,
    relatedApplication: application._id,
    emailTemplate: 'statusChange',
    recipientEmail: application.candidate.email,
    emailData: {
      candidateName: application.candidate.name,
      jobTitle: application.job.title,
      status: 'assessed',
      feedback: `Score: ${percentageScore}% (${grade}). ${overallFeedback || ''}`,
    },
  });

  res.json({
    status: 'success',
    message: 'Assessment submitted successfully',
    data: {
      application,
      grade,
    },
  });
});

/**
 * @desc    Get assessment details for an application
 * @route   GET /api/applications/:id/assessment
 * @access  Application owner or recruiter
 */
export const getAssessment = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidate', 'name email avatar')
    .populate('job', 'title assessment recruiter')
    .populate('assessment.assessedBy', 'name')
    .lean();

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  // Authorization
  const isCandidateOwner = application.candidate._id.toString() === req.user._id.toString();
  const isRecruiterOwner = application.job.recruiter.toString() === req.user._id.toString();

  if (!isCandidateOwner && !isRecruiterOwner) {
    throw ApiError.forbidden('Not authorized to view this assessment');
  }

  if (!application.assessment || !application.assessment.assessedAt) {
    throw ApiError.notFound('No assessment found for this application');
  }

  const grade = getGrade(application.assessment.percentageScore);

  res.json({
    status: 'success',
    data: {
      assessment: application.assessment,
      grade,
      jobTitle: application.job.title,
      candidateName: application.candidate.name,
    },
  });
});
