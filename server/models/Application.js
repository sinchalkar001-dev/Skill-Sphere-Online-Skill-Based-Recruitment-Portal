import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  criteria: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, required: true, min: 1 },
  feedback: { type: String, trim: true },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
});

const projectShowcaseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  techStack: [{ type: String, trim: true }],
  url: { type: String, trim: true },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverLetter: {
      type: String,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    resumeUrl: { type: String, trim: true },
    portfolioLinks: [{ type: String, trim: true }],
    projectShowcase: [projectShowcaseSchema],
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'assessed', 'rejected', 'accepted'],
      default: 'applied',
    },

    // Assessment scores (filled by recruiter)
    assessment: {
      scores: [scoreSchema],
      totalScore: { type: Number, default: 0 },
      maxPossibleScore: { type: Number, default: 0 },
      percentageScore: { type: Number, default: 0 },
      assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      assessedAt: { type: Date },
      overallFeedback: { type: String, trim: true },
    },

    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure one application per candidate per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ status: 1 });

// Auto-add status history on status change
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
