import { Request, Response } from 'express'
import { z } from 'zod'
import * as ConsultationBookingService from '../services/consultationBooking.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

export const getBookingInfo = asyncHandler(async (req: Request, res: Response) => {
  const info = await ConsultationBookingService.getBookingInfo(req.params.token)
  sendSuccess(res, HttpMessage.OK, info, HttpStatus.OK)
})

export const getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
  const daysAhead = req.query.daysAhead ? Number(req.query.daysAhead) : 30
  const slots = await ConsultationBookingService.getAvailableSlots(req.params.token, daysAhead)
  sendSuccess(res, HttpMessage.OK, slots, HttpStatus.OK)
})

export const bookSlot = asyncHandler(async (req: Request, res: Response) => {
  const { startTime } = z.object({ startTime: z.string().datetime() }).parse(req.body)
  const event = await ConsultationBookingService.bookSlot(req.params.token, startTime)
  sendSuccess(res, 'Consultation booked successfully', event, HttpStatus.CREATED)
})
