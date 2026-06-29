import { Request, Response } from 'express'
import * as ConsultationEventService from '../services/consultationEvent.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

export const adminListConsultationEvents = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const from = req.query.from ? new Date(req.query.from as string) : undefined
  const to = req.query.to ? new Date(req.query.to as string) : undefined
  const customerId = req.query.customerId as string | undefined

  const assignedTo = req.user!.role === 'employee' ? req.user!._id : undefined
  const { items, total } = await ConsultationEventService.listConsultationEvents({ from, to, customerId, page, limit, assignedTo })
  sendSuccess(res, HttpMessage.OK, items, HttpStatus.OK, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

export const adminDeleteConsultationEvent = asyncHandler(async (req: Request, res: Response) => {
  await ConsultationEventService.deleteConsultationEvent(req.params.id)
  sendSuccess(res, 'Consultation event deleted', null, HttpStatus.OK)
})
