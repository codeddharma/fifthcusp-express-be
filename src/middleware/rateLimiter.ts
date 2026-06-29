import { Request } from 'express'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { ApiError } from '../utils/ApiError'
import { verifyAccessToken } from '../utils/tokenUtils'

// Authenticated staff (valid access token) are exempt from the global limiter —
// it's meant to throttle anonymous/public traffic, not the admin panel's own usage.
function isAuthenticatedStaff(req: Request): boolean {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return false
  try {
    verifyAccessToken(authHeader.slice(7))
    return true
  } catch {
    return false
  }
}

// Global limiter: 100 requests per 15 minutes per IP (public/unauthenticated traffic only)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isAuthenticatedStaff,
  handler: (_req, _res, next) => next(new ApiError(429, 'Too many requests, please try again later.')),
})

// Auth limiter: 10 requests per 15 minutes per IP (brute-force protection)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new ApiError(429, 'Too many login attempts, please try again later.')),
})

// DDoS mitigation: progressive delay after 50 requests per minute
export const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => hits * 100,
})
