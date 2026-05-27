import { cleanEnv, str, port, num } from 'envalid'

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

  UPLOAD_DIR: str({ default: 'uploads' }),
  ORDER_FILES_RETENTION_DAYS: num({ default: 7 }),
  MAX_ORDER_UPLOAD_MB: num({ default: 50 }),
})

export default env
