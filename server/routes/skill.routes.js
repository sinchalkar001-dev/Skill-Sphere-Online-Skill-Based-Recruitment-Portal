import { Router } from 'express';
import { getSkillSuggestions } from '../controllers/skill.controller.js';

const router = Router();

// Public
router.get('/', getSkillSuggestions);

export default router;
