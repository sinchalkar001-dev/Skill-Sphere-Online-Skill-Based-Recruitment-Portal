import mongoose from 'mongoose';

/**
 * Catalogue of every skill tag used on a job posting or a candidate profile.
 * Powers tag autocomplete and keeps one spelling per skill.
 */
const skillSchema = new mongoose.Schema(
  {
    // Normalised form used for matching, e.g. "node.js"
    key: { type: String, required: true, unique: true },
    // Display form, taken from the first time the skill was used, e.g. "Node.js"
    name: { type: String, required: true, trim: true },
    jobCount: { type: Number, default: 0, min: 0 },
    candidateCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Suggestions: prefix match on key, most used first
skillSchema.index({ jobCount: -1, candidateCount: -1 });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
