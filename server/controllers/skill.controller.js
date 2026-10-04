import asyncHandler from '../utils/asyncHandler.js';
import { suggestSkills } from '../services/skill.service.js';

/**
 * @desc    Suggest skill tags for autocomplete, most used first
 * @route   GET /api/skills?q=rea&limit=8
 * @access  Public
 */
export const getSkillSuggestions = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 8));
  const skills = await suggestSkills(String(req.query.q || ''), limit);

  res.json({
    status: 'success',
    data: { skills },
  });
});
