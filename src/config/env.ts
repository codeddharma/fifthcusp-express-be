import { cleanEnv, str, port, num, bool } from 'envalid'

const env = cleanEnv(process.env, {
  PORT: port({ default: 5000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),

  MONGODB_URI: str(),

  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_ACCESS_EXPIRES_IN: str({ default: '15m' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),

  CORS_ORIGIN: str(),

  SMTP_HOST: str(),
  SMTP_PORT: num({ default: 587 }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  SMTP_FROM: str(),

  RAZORPAY_KEY_ID: str(),
  RAZORPAY_KEY_SECRET: str(),
  RAZORPAY_WEBHOOK_SECRET: str(),

  FRONTEND_URL: str({ default: 'https://fifthcusp.com' }),
  // Public URL of the logo used in emails. Must be publicly reachable — email clients
  // cannot load images from localhost, so keep this pointing at a deployed host even in dev.
  EMAIL_LOGO_URL: str({ default: 'https://fifthcusp.com/assets/The%20Fifth%20Cusp_Logo.png' }),

  GOOGLE_SERVICE_ACCOUNT_EMAIL: str(),
  GOOGLE_PRIVATE_KEY: str(),
  GOOGLE_CONSULTATION_CALENDAR_ID: str(),
  GOOGLE_REMEDY_CALENDAR_ID: str(),

  // Workspace mode: when true, auto-generate a unique Google Meet link per booking
  // and add the customer as an attendee. Requires a Google Workspace account with
  // Domain-Wide Delegation + GOOGLE_IMPERSONATE_EMAIL set. Leave false on consumer Gmail.
  GOOGLE_WORKSPACE_MODE: bool({ default: false }),
  // The Workspace user to impersonate via Domain-Wide Delegation (production only).
  GOOGLE_IMPERSONATE_EMAIL: str({ default: '' }),
  // Fallback meeting link used when GOOGLE_WORKSPACE_MODE is false (e.g. a permanent
  // Google Meet room or Zoom link). Sent to the client in the confirmation email.
  CONSULTATION_FALLBACK_MEET_LINK: str({ default: '' }),

  UPLOAD_DIR: str({ default: 'uploads' }),
  ORDER_FILES_RETENTION_DAYS: num({ default: 7 }),
  MAX_ORDER_UPLOAD_MB: num({ default: 50 }),

  // Pending orders older than this are auto-marked failed (abandoned checkout).
  STALE_PAYMENT_MINUTES: num({ default: 30 }),
})

export default env
