import mongoose from 'mongoose';

export const EMAIL_STATUSES = ['pending', 'sending', 'sent', 'failed'];

/**
 * Outbox for transactional email. Every email is written here first, then
 * delivered; failed sends stay queued and are retried with backoff, so a
 * mail-server outage or an API restart never loses a message.
 */
const emailJobSchema = new mongoose.Schema(
  {
    to: { type: String, required: true, trim: true },
    template: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    notification: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },

    status: { type: String, enum: EMAIL_STATUSES, default: 'pending' },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    nextAttemptAt: { type: Date, default: Date.now },
    // A worker that claims a job holds it until this time; if it crashes mid-send the job is picked up again
    lockedUntil: { type: Date },
    lastError: { type: String },
    sentAt: { type: Date },
    // Finished jobs are removed by the TTL index below
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// The worker's "what is due?" query
emailJobSchema.index({ status: 1, nextAttemptAt: 1 });
emailJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailJob = mongoose.model('EmailJob', emailJobSchema);
export default EmailJob;
