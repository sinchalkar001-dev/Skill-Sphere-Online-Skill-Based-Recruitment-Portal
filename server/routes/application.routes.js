import { Router } from 'express';
import {
  createApplication,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller.js';
import { assessApplication, getAssessment } from '../controllers/assessment.controller.js';
import { protect } from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';
import validate from '../middleware/validate.js';
import {
  createApplicationValidator,
  updateStatusValidator,
  assessApplicationValidator,
} from '../validators/application.validator.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Candidate routes
router.post('/', roleGuard('candidate'), createApplicationValidator, validate, createApplication);
router.get('/my', roleGuard('candidate'), getMyApplications);

// Recruiter routes
router.get('/job/:jobId', roleGuard('recruiter'), getJobApplications);

// Shared routes (with authorization check inside controller)
router.get('/:id', getApplicationById);
router.get('/:id/assessment', getAssessment);

// Recruiter status management
router.patch('/:id/status', roleGuard('recruiter'), updateStatusValidator, validate, updateApplicationStatus);
router.patch('/:id/assess', roleGuard('recruiter'), assessApplicationValidator, validate, assessApplication);

// Candidate withdrawal
router.delete('/:id', roleGuard('candidate'), withdrawApplication);

export default router;
