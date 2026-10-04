import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { EmailJob, Notification } from '../models/index.js';
import {
  getRetryDelayMs,
  deliverEmailJob,
  processDueEmails,
  queueEmail,
  setEmailTransport,
} from '../services/email.service.js';
import { connect, resetDatabase, disconnect, createUsers } from './helpers.js';

const statusEmail = { candidateName: 'Asha', jobTitle: 'Backend Engineer', status: 'shortlisted' };

// A mail server that fails the first `failures` sends, then accepts
const flakyTransport = (failures) => {
  const transport = {
    calls: [],
    sendMail: async (message) => {
      transport.calls.push(message);
      if (transport.calls.length <= failures) throw new Error('SMTP connection refused');
    },
  };
  return transport;
};

before(connect);
beforeEach(resetDatabase);
after(async () => {
  setEmailTransport(null);
  await disconnect();
});

test('retry delay grows 4x per attempt and is capped at one hour', () => {
  const base = 30_000;
  assert.equal(getRetryDelayMs(1, base), 30_000);
  assert.equal(getRetryDelayMs(2, base), 120_000);
  assert.equal(getRetryDelayMs(3, base), 480_000);
  assert.equal(getRetryDelayMs(4, base), 1_920_000);
  assert.equal(getRetryDelayMs(5, base), 3_600_000);
});

test('a failed send is retried and delivered once the mail server recovers', async () => {
  const transport = flakyTransport(2);
  setEmailTransport(transport);
  const [user] = await createUsers(1);
  const notification = await Notification.create({
    recipient: user._id,
    type: 'shortlisted',
    title: 'Application Shortlisted',
    message: 'Shortlisted',
  });
  const job = await EmailJob.create({
    to: 'asha@example.test',
    template: 'statusChange',
    data: statusEmail,
    notification: notification._id,
    maxAttempts: 3,
  });

  let result = await deliverEmailJob(job._id);
  assert.equal(result.status, 'pending');
  assert.equal(result.attempts, 1);
  assert.equal(result.lastError, 'SMTP connection refused');
  assert.equal((await Notification.findById(notification._id)).isEmailSent, false);

  await processDueEmails(); // attempt 2 fails
  await processDueEmails(); // attempt 3 succeeds

  result = await EmailJob.findById(job._id);
  assert.equal(result.status, 'sent');
  assert.equal(result.attempts, 3);
  assert.equal(result.lastError, undefined);
  assert.ok(result.sentAt);
  assert.equal(transport.calls.length, 3);
  assert.equal((await Notification.findById(notification._id)).isEmailSent, true);
});

test('delivery stops after the maximum number of attempts', async () => {
  const transport = flakyTransport(Infinity);
  setEmailTransport(transport);
  const job = await EmailJob.create({ to: 'asha@example.test', template: 'statusChange', data: statusEmail, maxAttempts: 3 });

  for (let i = 0; i < 5; i++) await processDueEmails();

  const result = await EmailJob.findById(job._id);
  assert.equal(result.status, 'failed');
  assert.equal(result.attempts, 3);
  assert.equal(transport.calls.length, 3);
});

test('concurrent workers send a queued email exactly once', async () => {
  const transport = flakyTransport(0);
  setEmailTransport(transport);
  const job = await EmailJob.create({ to: 'asha@example.test', template: 'statusChange', data: statusEmail });

  const results = await Promise.all(Array.from({ length: 10 }, () => deliverEmailJob(job._id)));

  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(transport.calls.length, 1);
});

test('a job left in "sending" by a crashed worker is picked up again', async () => {
  const transport = flakyTransport(0);
  setEmailTransport(transport);
  const job = await EmailJob.create({
    to: 'asha@example.test',
    template: 'statusChange',
    data: statusEmail,
    status: 'sending',
    attempts: 1,
    lockedUntil: new Date(Date.now() - 1000),
  });

  await processDueEmails();

  assert.equal((await EmailJob.findById(job._id)).status, 'sent');
  assert.equal(transport.calls.length, 1);
});

test('queueEmail returns without waiting for the mail server and delivers in the background', async () => {
  const transport = flakyTransport(0);
  setEmailTransport(transport);

  const job = await queueEmail({ to: 'asha@example.test', template: 'statusChange', data: statusEmail });
  assert.equal(job.status, 'pending');

  let delivered;
  for (let i = 0; i < 50 && delivered?.status !== 'sent'; i++) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    delivered = await EmailJob.findById(job._id);
  }
  assert.equal(delivered.status, 'sent');
  assert.equal(transport.calls[0].to, 'asha@example.test');
  assert.match(transport.calls[0].subject, /Shortlisted/);
});

test('user-supplied text is escaped in the email body', async () => {
  const transport = flakyTransport(0);
  setEmailTransport(transport);
  const job = await EmailJob.create({
    to: 'asha@example.test',
    template: 'statusChange',
    data: { ...statusEmail, candidateName: '<script>alert(1)</script>', feedback: '<img src=x onerror=alert(1)>' },
  });

  await deliverEmailJob(job._id);

  const { html } = transport.calls[0];
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;'));
});
