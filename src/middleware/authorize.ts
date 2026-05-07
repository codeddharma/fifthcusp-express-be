import { Request, Response, NextFunction, RequestHandler } from 'express'
import { UserRole } from '../types/user.types'
import { ApiError } from '../utils/ApiError'

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated')
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Insufficient permissions')
    }
    next()
  }
}
