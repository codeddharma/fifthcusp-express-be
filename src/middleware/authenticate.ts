import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { verifyAccessToken } from '../utils/tokenUtils'
import { ApiError } from '../utils/ApiError'

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided')
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = { _id: new Types.ObjectId(payload.userId), role: payload.role, email: '', name: '' }
    next()
  } catch {
    throw new ApiError(401, 'Invalid or expired access token')
  }
}
