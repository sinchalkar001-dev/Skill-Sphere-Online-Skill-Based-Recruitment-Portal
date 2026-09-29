import mongoose from 'mongoose';

const assessmentCriteriaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  maxScore: { type: Number, required: true, min: 1, default: 10 },
  weight: { type: Number, required: true, min: 1, max: 100, default: 25 },
});

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
    techStack: [{ type: String, trim: true }],
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'INR', trim: true },
      period: {
        type: String,
        enum: ['yearly', 'monthly', 'hourly'],
        default: 'yearly',
      },
    },
    location: { type: String, trim: true },
    locationType: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'onsite',
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'mid',
    },
    applicationDeadline: { type: Date },
    maxApplications: { type: Number, min: 1 },
    applicationsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // Assessment configuration
    assessment: {
      enabled: { type: Boolean, default: false },
      criteria: [assessmentCriteriaSchema],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ techStack: 1 });
jobSchema.index({ title: 'text', description: 'text' });

// Virtual: check if deadline has passed
jobSchema.virtual('isExpired').get(function () {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

// Virtual: check if max applications reached
jobSchema.virtual('isFull').get(function () {
  if (!this.maxApplications) return false;
  return this.applicationsCount >= this.maxApplications;
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
