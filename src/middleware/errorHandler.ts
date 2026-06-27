import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError'
import env from '../config/env'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError && err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message, data: null })
    return
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    res.status(400).json({ success: false, message, data: null })
    return
  }

  // Unexpected / programmer errors — log and mask details in production
  // Log message + stack separately to avoid Node.js inspect crashes on complex error objects
  console.error('Unhandled error:', err?.message ?? String(err))
  if (err?.stack) console.error(err.stack)
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    data: null,
  })
}
