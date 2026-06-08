import { Request, Response } from 'express'
import { z } from 'zod'
import * as RemedyEventService from '../services/remedyEvent.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const createRemedySchema = z.object({
  customerId: z.string().min(1),
  orderId: z.string().optional(),
  remedyName: z.string().min(1),
  notes: z.string().optional(),
  // datetime-local inputs send "YYYY-MM-DDTHH:mm" without timezone — coerce.date() handles all formats
  scheduledAt: z.coerce.date(),
})

export const adminCreateRemedyEvent = asyncHandler(async (req: Request, res: Response) => {
  const input = createRemedySchema.parse(req.body)
  const event = await RemedyEventService.createRemedyEvent({
    ...input,
    createdBy: req.user!._id.toString(),
  })
  sendSuccess(res, 'Remedy event created', event, HttpStatus.CREATED)
})

export const adminListRemedyEvents = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const from = req.query.from ? new Date(req.query.from as string) : undefined
  const to = req.query.to ? new Date(req.query.to as string) : undefined
  const customerId = req.query.customerId as string | undefined

  const { items, total } = await RemedyEventService.listRemedyEvents({ from, to, customerId, page, limit })
  sendSuccess(res, HttpMessage.OK, items, HttpStatus.OK, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

export const adminDeleteRemedyEvent = asyncHandler(async (req: Request, res: Response) => {
  await RemedyEventService.deleteRemedyEvent(req.params.id)
  sendSuccess(res, 'Remedy event deleted', null, HttpStatus.OK)
})
