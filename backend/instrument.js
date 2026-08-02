// instrument.js
require('dotenv').config(); // Load environment variables FIRST
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://5b002fa55a0c80d7dd742166f14dd065@o4511838494523392.ingest.us.sentry.io/4511839092080640",
  tracesSampleRate: 1.0,
});