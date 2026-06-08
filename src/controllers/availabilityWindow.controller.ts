import { Request, Response } from 'express'
import { z } from 'zod'
import * as AvailabilityWindowService from '../services/availabilityWindow.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const windowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
  isActive: z.boolean().optional(),
})

export const listWindows = asyncHandler(async (_req: Request, res: Response) => {
  const windows = await AvailabilityWindowService.listAvailabilityWindows()
  sendSuccess(res, HttpMessage.OK, windows, HttpStatus.OK)
})

export const createWindow = asyncHandler(async (req: Request, res: Response) => {
  const input = windowSchema.parse(req.body)
  const window = await AvailabilityWindowService.createAvailabilityWindow(input)
  sendSuccess(res, HttpMessage.CREATED, window, HttpStatus.CREATED)
})

export const updateWindow = asyncHandler(async (req: Request, res: Response) => {
  const input = windowSchema.partial().parse(req.body)
  const window = await AvailabilityWindowService.updateAvailabilityWindow(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, window, HttpStatus.OK)
})

export const deleteWindow = asyncHandler(async (req: Request, res: Response) => {
  await AvailabilityWindowService.deleteAvailabilityWindow(req.params.id)
  sendSuccess(res, 'Deleted successfully', null, HttpStatus.OK)
})
