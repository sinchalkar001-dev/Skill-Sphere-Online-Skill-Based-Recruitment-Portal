import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'welcome',
        'application_received',
        'application_status_change',
        'shortlisted',
        'rejected',
        'accepted',
        'new_job_match',
        'assessment_complete',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    isRead: { type: Boolean, default: false },
    isEmailSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
