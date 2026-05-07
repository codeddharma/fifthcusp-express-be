import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

// Global limiter: 100 requests per 15 minutes per IP
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.', data: null },
})

// Auth limiter: 10 requests per 15 minutes per IP (brute-force protection)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.', data: null },
})

// DDoS mitigation: progressive delay after 50 requests per minute
export const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => hits * 100,
})
