import { Request, Response } from 'express'
import { z } from 'zod'
import * as DisclaimerBannerService from '../services/disclaimerBanner.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const upsertSchema = z.object({
  text: z.string().min(1),
  isActive: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
})

export const getDisclaimerBanner = asyncHandler(async (_req: Request, res: Response) => {
  const banner = await DisclaimerBannerService.getDisclaimerBanner()
  sendSuccess(res, HttpMessage.OK, banner, HttpStatus.OK)
})

export const updateDisclaimerBanner = asyncHandler(async (req: Request, res: Response) => {
  const input = upsertSchema.parse(req.body)
  const banner = await DisclaimerBannerService.upsertDisclaimerBanner(input)
  sendSuccess(res, HttpMessage.UPDATED, banner, HttpStatus.OK)
})
