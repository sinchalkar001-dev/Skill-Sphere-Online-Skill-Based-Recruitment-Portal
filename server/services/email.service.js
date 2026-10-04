import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { EmailJob, Notification } from '../models/index.js';

const LOCK_MS = 2 * 60 * 1000; // how long a worker may hold a job before it is considered crashed
const MAX_RETRY_DELAY_MS = 60 * 60 * 1000;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // finished jobs are kept 30 days for troubleshooting

// ── Transport ──

const consoleTransport = {
  sendMail: async ({ to, subject }) => {
    console.log(`Email (not sent, no SMTP configured) to ${to}: ${subject}`);
  },
};

const createDefaultTransport = () => {
  if (env.EMAIL_USER && env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }
  console.log('Email not configured. Emails will be logged to the console.');
  return consoleTransport;
};

let transport = createDefaultTransport();

/** Swap the transport (used by tests to simulate a failing mail server). */
export const setEmailTransport = (next) => {
  transport = next || createDefaultTransport();
};

// ── Templates ──

// Names, job titles and feedback are user input, so escape them before putting them in HTML
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const BRAND = '#0369A1';
const STATUS_LABELS = {
  applied: 'Applied',
  reviewing: 'In review',
  shortlisted: 'Shortlisted',
  assessed: 'Assessed',
  accepted: 'Accepted',
  rejected: 'Rejected',
};
const STATUS_COLORS = { accepted: '#16A34A', rejected: '#DC2626' };

const layout = (heading, body) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #D7E2EC; border-radius: 12px; overflow: hidden;">
    <div style="background: ${BRAND}; padding: 24px 32px; color: #ffffff;">
      <p style="margin: 0 0 6px; font-size: 14px; font-weight: 600;">Skill Sphere</p>
      <h1 style="margin: 0; font-size: 22px; line-height: 1.3;">${heading}</h1>
    </div>
    <div style="background: #ffffff; padding: 28px 32px; color: #0F2A3D; font-size: 15px; line-height: 1.6;">
      ${body}
    </div>
  </div>
`;

const button = (href, label) =>
  `<a href="${href}" style="display: inline-block; background: ${BRAND}; color: #ffffff; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px;">${label}</a>`;

const templates = {
  welcome: (data) => ({
    subject: `Welcome to Skill Sphere, ${data.name}`,
    html: layout(
      'Welcome to Skill Sphere',
      `
        <p style="margin-top: 0;">Hi ${escapeHtml(data.name)},</p>
        <p>Your ${data.role === 'recruiter' ? 'recruiter' : 'candidate'} account is ready.</p>
        <p style="color: #4A6378;">${
          data.role === 'recruiter'
            ? 'Post a role, set your rubric, and score applicants on the work they share.'
            : 'Add your skills and projects, then apply to roles that match your stack.'
        }</p>
        ${button(`${env.FRONTEND_URL}/dashboard`, 'Go to your dashboard')}
      `
    ),
  }),

  applicationReceived: (data) => ({
    subject: `New application for "${data.jobTitle}"`,
    html: layout(
      'New application received',
      `
        <p style="margin-top: 0;"><strong>${escapeHtml(data.candidateName)}</strong> applied for <strong>${escapeHtml(data.jobTitle)}</strong>.</p>
        <p style="color: #4A6378;">Review their projects and score the application from your dashboard.</p>
        ${button(`${env.FRONTEND_URL}/dashboard`, 'Review application')}
      `
    ),
  }),

  statusChange: (data) => {
    const label = STATUS_LABELS[data.status] || data.status;
    return {
      subject: `Application update: ${label}`,
      html: layout(
        'Your application was updated',
        `
          <p style="margin-top: 0;">Hi ${escapeHtml(data.candidateName)},</p>
          <p>Your application for <strong>${escapeHtml(data.jobTitle)}</strong> is now:
            <span style="display: inline-block; background: ${STATUS_COLORS[data.status] || BRAND}; color: #ffffff; padding: 3px 12px; border-radius: 16px; font-size: 13px; font-weight: 600;">${escapeHtml(label)}</span>
          </p>
          ${
            data.feedback
              ? `<p style="background: #EAF0F5; padding: 12px 16px; border-radius: 8px; border-left: 4px solid ${BRAND}; color: #4A6378;">${escapeHtml(data.feedback)}</p>`
              : ''
          }
          ${button(`${env.FRONTEND_URL}/applications`, 'View application')}
        `
      ),
    };
  },
};

// ── Delivery with retries ──

/**
 * Wait before the next attempt, after `attempt` failures: 30s, 2m, 8m, 32m (capped at 1h).
 */
export const getRetryDelayMs = (attempt, baseMs = env.EMAIL_RETRY_BASE_MS) =>
  Math.min(baseMs * 4 ** Math.max(attempt - 1, 0), MAX_RETRY_DELAY_MS);

const dueFilter = (now) => ({
  $or: [
    { status: 'pending', nextAttemptAt: { $lte: now } },
    // claimed by a worker that never finished (crash or restart mid-send)
    { status: 'sending', lockedUntil: { $lte: now } },
  ],
});

/**
 * Try to deliver one queued email. Returns the job after the attempt, or null
 * if it was not due or another worker already claimed it.
 */
export const deliverEmailJob = async (jobId) => {
  const now = new Date();

  // Atomic claim: of any number of concurrent workers, exactly one moves the job to "sending"
  const job = await EmailJob.findOneAndUpdate(
    { _id: jobId, ...dueFilter(now) },
    { $set: { status: 'sending', lockedUntil: new Date(now.getTime() + LOCK_MS) }, $inc: { attempts: 1 } },
    { new: true }
  );
  if (!job) return null;

  try {
    const { subject, html } = templates[job.template](job.data || {});
    await transport.sendMail({
      from: `"${env.SENDER_NAME}" <${env.SENDER_EMAIL}>`,
      to: job.to,
      subject,
      html,
    });

    job.set({
      status: 'sent',
      sentAt: new Date(),
      lastError: undefined,
      lockedUntil: undefined,
      expiresAt: new Date(Date.now() + RETENTION_MS),
    });
    await job.save();

    if (job.notification) {
      await Notification.updateOne({ _id: job.notification }, { isEmailSent: true });
    }
  } catch (error) {
    const exhausted = job.attempts >= job.maxAttempts;
    job.set({
      status: exhausted ? 'failed' : 'pending',
      lastError: error.message,
      lockedUntil: undefined,
      ...(exhausted
        ? { expiresAt: new Date(Date.now() + RETENTION_MS) }
        : { nextAttemptAt: new Date(Date.now() + getRetryDelayMs(job.attempts)) }),
    });
    await job.save();
    console.error(
      `Email to ${job.to} failed (attempt ${job.attempts}/${job.maxAttempts}${exhausted ? ', giving up' : ', will retry'}): ${error.message}`
    );
  }

  return job;
};

/**
 * Queue an email and start delivering it in the background, so the API response
 * never waits on the mail server. Failures are retried by the worker below.
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.template - Template key from the templates object
 * @param {object} options.data - Data to pass to the template
 * @param {string} [options.notificationId] - Notification to mark as emailed on success
 */
export const queueEmail = async ({ to, template, data, notificationId }) => {
  if (!templates[template]) {
    console.warn(`Email template '${template}' not found`);
    return null;
  }

  const job = await EmailJob.create({
    to,
    template,
    data,
    notification: notificationId,
    maxAttempts: env.EMAIL_MAX_ATTEMPTS,
  });

  setImmediate(() => {
    deliverEmailJob(job._id).catch((error) => console.error('Email delivery error:', error.message));
  });

  return job;
};

/**
 * Deliver every email that is due: new ones whose first attempt has not run yet,
 * and failed ones whose retry time has arrived.
 */
export const processDueEmails = async (limit = 25) => {
  const due = await EmailJob.find(dueFilter(new Date())).sort({ nextAttemptAt: 1 }).limit(limit).select('_id').lean();

  let attempted = 0;
  for (const { _id } of due) {
    if (await deliverEmailJob(_id)) attempted += 1;
  }
  return attempted;
};

let workerTimer = null;

export const startEmailWorker = () => {
  if (workerTimer) return;
  workerTimer = setInterval(() => {
    processDueEmails().catch((error) => console.error('Email worker error:', error.message));
  }, env.EMAIL_WORKER_INTERVAL_MS);
  workerTimer.unref();
};

export const stopEmailWorker = () => {
  clearInterval(workerTimer);
  workerTimer = null;
};

export default { queueEmail, deliverEmailJob, processDueEmails, startEmailWorker, stopEmailWorker };
