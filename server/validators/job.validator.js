import { body } from 'express-validator';

export const createJobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('techStack')
    .optional()
    .isArray()
    .withMessage('Tech stack must be an array'),
  body('salary.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min salary must be positive'),
  body('salary.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max salary must be positive'),
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),
  body('locationType')
    .optional()
    .isIn(['remote', 'onsite', 'hybrid'])
    .withMessage('Invalid location type'),
];

export const updateJobValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
];
