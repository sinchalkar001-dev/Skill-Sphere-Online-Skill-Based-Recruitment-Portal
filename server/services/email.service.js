import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Create transporter — falls back to console logging if no email config
let transporter;

if (env.EMAIL_USER && env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });
} else {
  console.log('⚠ Email not configured. Emails will be logged to console.');
}

// Email templates
const templates = {
  welcome: (data) => ({
    subject: `Welcome to Skill Sphere, ${data.name}!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden;">
        <div style="padding: 40px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🚀 Welcome to Skill Sphere</h1>
          <p style="opacity: 0.9; font-size: 16px;">Your journey to the perfect ${data.role === 'recruiter' ? 'hire' : 'career'} starts now</p>
        </div>
        <div style="background: white; padding: 32px; border-radius: 16px 16px 0 0;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Hi ${data.name},</h2>
          <p style="color: #4a5568; line-height: 1.6;">Thank you for joining Skill Sphere! We're excited to have you on board.</p>
          ${data.role === 'recruiter' 
            ? '<p style="color: #4a5568;">Start posting jobs and find the best talent matched to your requirements.</p>'
            : '<p style="color: #4a5568;">Browse opportunities, showcase your projects, and let your skills speak for themselves.</p>'
          }
          <a href="${env.FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">Go to Dashboard</a>
        </div>
      </div>
    `,
  }),

  applicationReceived: (data) => ({
    subject: `New Application for "${data.jobTitle}"`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; color: white;">
          <h2 style="margin: 0;">📩 New Application Received</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
          <p style="color: #2d3748;"><strong>${data.candidateName}</strong> applied for <strong>${data.jobTitle}</strong></p>
          <p style="color: #4a5568;">Review their application and assess their skills on your dashboard.</p>
          <a href="${env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none;">Review Application</a>
        </div>
      </div>
    `,
  }),

  statusChange: (data) => ({
    subject: `Application Update: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0; color: white;">
          <h2 style="margin: 0;">📋 Application Status Update</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
          <p style="color: #2d3748;">Hi ${data.candidateName},</p>
          <p style="color: #4a5568;">Your application for <strong>${data.jobTitle}</strong> has been updated to: 
            <span style="background: ${data.status === 'accepted' ? '#48bb78' : data.status === 'rejected' ? '#f56565' : '#667eea'}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px;">${data.status.toUpperCase()}</span>
          </p>
          ${data.feedback ? `<p style="color: #4a5568; background: #edf2f7; padding: 12px; border-radius: 8px; border-left: 4px solid #667eea;">${data.feedback}</p>` : ''}
          <a href="${env.FRONTEND_URL}/applications" style="display: inline-block; background: #667eea; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none;">View Details</a>
        </div>
      </div>
    `,
  }),
};

/**
 * Send an email using a template
 * @param {string} to - Recipient email
 * @param {string} templateName - Template key from templates object
 * @param {object} data - Data to pass to the template
 */
export const sendEmail = async (to, templateName, data) => {
  try {
    const template = templates[templateName];
    if (!template) {
      console.warn(`Email template '${templateName}' not found`);
      return false;
    }

    const { subject, html } = template(data);

    if (!transporter) {
      // Log to console in development
      console.log(`📧 Email (${templateName}) to ${to}: ${subject}`);
      return true;
    }

    await transporter.sendMail({
      from: `"${env.SENDER_NAME}" <${env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`✓ Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`✗ Email failed to ${to}:`, error.message);
    return false;
  }
};

export default { sendEmail };
