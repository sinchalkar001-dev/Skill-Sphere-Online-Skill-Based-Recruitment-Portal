import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleJobStatus,
} from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';
import validate from '../middleware/validate.js';
import { createJobValidator, updateJobValidator } from '../validators/job.validator.js';

const router = Router();

// Recruiter only — must come before /:id routes if using same pattern
router.get('/my-jobs', protect, roleGuard('recruiter'), getMyJobs);

// Public
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, roleGuard('recruiter'), createJobValidator, validate, createJob);
router.put('/:id', protect, roleGuard('recruiter'), updateJobValidator, validate, updateJob);
router.delete('/:id', protect, roleGuard('recruiter'), deleteJob);
router.patch('/:id/toggle', protect, roleGuard('recruiter'), toggleJobStatus);

export default router;
