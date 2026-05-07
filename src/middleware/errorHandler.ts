import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import env from '../config/env'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError && err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message, data: null })
    return
  }

  // Unexpected / programmer errors — log and mask details in production
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    data: null,
  })
}
