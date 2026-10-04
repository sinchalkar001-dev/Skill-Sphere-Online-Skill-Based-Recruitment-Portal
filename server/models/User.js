import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  techStack: [{ type: String, trim: true }],
  liveUrl: { type: String, trim: true },
  repoUrl: { type: String, trim: true },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // Shape check only (the request validator does the strict check). The domain
      // ending is not length-limited: .info, .tech and .email are all valid.
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: ['candidate', 'recruiter'],
      required: [true, 'Role is required'],
    },
    avatar: { type: String, default: '' },

    // ── Candidate-specific fields ──
    bio: { type: String, maxlength: 500 },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experience: { type: Number, min: 0, default: 0 },
    portfolio: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    projects: [projectSchema],

    // ── Recruiter-specific fields ──
    company: {
      name: { type: String, trim: true },
      website: { type: String, trim: true },
      logo: { type: String, trim: true },
      description: { type: String, maxlength: 1000 },
      size: {
        type: String,
        enum: ['1-50', '51-200', '201-500', '500+', ''],
        default: '',
      },
    },

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient queries
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ skills: 1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
