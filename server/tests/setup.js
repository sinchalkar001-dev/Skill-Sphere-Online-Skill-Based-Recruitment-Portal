// Loaded before any test file (see the "test" script). Points the app at a
// throwaway database and makes sure no test can send real email.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-sphere-test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASSWORD = '';
process.env.EMAIL_MAX_ATTEMPTS = '3';
process.env.EMAIL_RETRY_BASE_MS = '0'; // retries are due immediately, so tests need no waiting
process.env.SYNC_INDEXES = 'false';
