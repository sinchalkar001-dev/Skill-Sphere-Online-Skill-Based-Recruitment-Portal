import { Router } from 'express';
import authRoutes from './auth.routes.js';
import jobRoutes from './job.routes.js';
import applicationRoutes from './application.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);

export default router;
