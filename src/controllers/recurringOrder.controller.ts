import { Request, Response } from 'express'
import { z } from 'zod'
import * as RecurringOrderService from '../services/recurringOrder.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const createSchema = z.object({
  customerId: z.string().min(1),
  serviceId: z.string().optional(),
  customServiceDescription: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().min(1),
  intervalUnit: z.enum(['day', 'week', 'month']),
  intervalCount: z.number().int().positive(),
  linkValidityDays: z.number().int().positive().optional(),
  notes: z.string().optional(),
  sendFirstNow: z.boolean().optional(),
})

const statusSchema = z.object({
  status: z.enum(['active', 'paused', 'cancelled']),
})

export const listRecurringOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const result = await RecurringOrderService.listRecurringOrders({ page, limit })
  sendSuccess(res, HttpMessage.OK, result.data, HttpStatus.OK, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  })
})

export const createRecurringOrder = asyncHandler(async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body)
  const recurring = await RecurringOrderService.createRecurringOrder({
    ...input,
    createdBy: req.user?._id,
  })
  sendSuccess(res, HttpMessage.CREATED, recurring, HttpStatus.CREATED)
})

export const getRecurringOrder = asyncHandler(async (req: Request, res: Response) => {
  const recurring = await RecurringOrderService.getRecurringOrderById(req.params.id)
  sendSuccess(res, HttpMessage.OK, recurring, HttpStatus.OK)
})

export const updateRecurringOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = statusSchema.parse(req.body)
  const recurring = await RecurringOrderService.updateRecurringOrderStatus(req.params.id, status)
  sendSuccess(res, HttpMessage.UPDATED, recurring, HttpStatus.OK)
})
