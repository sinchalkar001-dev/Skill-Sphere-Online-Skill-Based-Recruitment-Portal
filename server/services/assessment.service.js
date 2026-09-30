/**
 * Assessment scoring service
 * Calculates candidate scores based on recruiter-defined criteria
 */

/**
 * Calculate total and percentage scores from individual criteria scores
 * @param {Array} scores - Array of { criteria, score, maxScore, feedback }
 * @param {Array} criteriaWeights - Array of { name, maxScore, weight } from job config
 * @returns {Object} { totalScore, maxPossibleScore, percentageScore }
 */
export const calculateAssessmentScore = (scores, criteriaWeights = []) => {
  if (!scores || scores.length === 0) {
    return { totalScore: 0, maxPossibleScore: 0, percentageScore: 0 };
  }

  // If weights are provided, use weighted scoring
  if (criteriaWeights.length > 0) {
    let weightedScore = 0;
    let totalWeight = 0;

    scores.forEach((score) => {
      const weight = criteriaWeights.find((w) => w.name === score.criteria);
      const scoreWeight = weight ? weight.weight : 100 / scores.length;
      const normalizedScore = (score.score / score.maxScore) * scoreWeight;
      weightedScore += normalizedScore;
      totalWeight += scoreWeight;
    });

    const percentageScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const maxPossibleScore = scores.reduce((sum, s) => sum + s.maxScore, 0);

    return { totalScore, maxPossibleScore, percentageScore };
  }

  // Simple scoring without weights
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxPossibleScore = scores.reduce((sum, s) => sum + s.maxScore, 0);
  const percentageScore = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100)
    : 0;

  return { totalScore, maxPossibleScore, percentageScore };
};

/**
 * Get a letter grade from percentage score
 */
export const getGrade = (percentageScore) => {
  if (percentageScore >= 90) return 'A+';
  if (percentageScore >= 80) return 'A';
  if (percentageScore >= 70) return 'B';
  if (percentageScore >= 60) return 'C';
  if (percentageScore >= 50) return 'D';
  return 'F';
};

export default { calculateAssessmentScore, getGrade };
