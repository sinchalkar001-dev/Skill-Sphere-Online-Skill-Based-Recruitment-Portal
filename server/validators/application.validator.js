import { body } from 'express-validator';

export const createApplicationValidator = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid Job ID'),
  body('coverLetter')
    .optional()
    .isLength({ max: 3000 })
    .withMessage('Cover letter cannot exceed 3000 characters'),
  body('projectShowcase')
    .optional()
    .isArray()
    .withMessage('Project showcase must be an array'),
];

export const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['reviewing', 'shortlisted', 'assessed', 'rejected', 'accepted'])
    .withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }),
];

export const assessApplicationValidator = [
  body('scores')
    .isArray({ min: 1 })
    .withMessage('At least one score is required'),
  body('scores.*.criteria')
    .notEmpty()
    .withMessage('Criteria name is required'),
  body('scores.*.score')
    .isInt({ min: 0 })
    .withMessage('Score must be a positive number'),
  body('scores.*.maxScore')
    .isInt({ min: 1 })
    .withMessage('Max score must be at least 1'),
  body('overallFeedback')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot exceed 2000 characters'),
];