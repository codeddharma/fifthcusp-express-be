import { Request, Response } from 'express'
import * as OrderService from '../services/order.service'
import { asyncHandler } from '../utils/asyncHandler'

export const razorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature']
  const sig = Array.isArray(signature) ? signature[0] : signature
  // req.body is a Buffer when mounted with express.raw
  await OrderService.handleWebhookEvent(req.body as Buffer, sig)
  res.status(200).json({ success: true })
})
