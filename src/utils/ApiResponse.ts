import { Response } from 'express'

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function sendSuccess(
  res: Response,
  message: string,
  data?: unknown,
  statusCode = 200,
  pagination?: PaginationMeta,
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    ...(pagination && { pagination }),
  })
}

export function sendError(res: Response, message: string, statusCode = 500): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  })
}
