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
})

export default env
