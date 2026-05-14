import { Request, Response } from 'express'
import { z } from 'zod'
import * as TestimonialService from '../services/testimonial.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

// ─── Validation schemas ───────────────────────────────────────────────────────

const createTestimonialSchema = z.object({
  feedback: z.string().min(1),
  clientName: z.string().min(1),
  services: z.array(z.string().min(1)).min(1),
})

const updateTestimonialSchema = createTestimonialSchema.partial()

// ─── Public controllers ───────────────────────────────────────────────────────

export const listApprovedByService = asyncHandler(async (req: Request, res: Response) => {
  const testimonials = await TestimonialService.getApprovedTestimonialsByService(req.params.serviceName)
  sendSuccess(res, HttpMessage.OK, testimonials, HttpStatus.OK)
})

export const listTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const { isApproved, isRejected } = req.query
  const filter: Record<string, boolean> = {}
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true'
  if (isRejected !== undefined) filter.isRejected = isRejected === 'true'
  const testimonials = await TestimonialService.getAllTestimonials(filter)
  sendSuccess(res, HttpMessage.OK, testimonials, HttpStatus.OK)
})

export const getTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await TestimonialService.getTestimonialById(req.params.id)
  sendSuccess(res, HttpMessage.OK, testimonial, HttpStatus.OK)
})

// ─── Admin controllers ────────────────────────────────────────────────────────

export const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const input = createTestimonialSchema.parse(req.body)
  const testimonial = await TestimonialService.createTestimonial(input)
  sendSuccess(res, HttpMessage.CREATED, testimonial, HttpStatus.CREATED)
})

export const updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const input = updateTestimonialSchema.parse(req.body)
  const testimonial = await TestimonialService.updateTestimonial(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, testimonial, HttpStatus.OK)
})

export const approveTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await TestimonialService.approveTestimonial(req.params.id)
  sendSuccess(res, HttpMessage.UPDATED, testimonial, HttpStatus.OK)
})

export const rejectTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await TestimonialService.rejectTestimonial(req.params.id)
  sendSuccess(res, HttpMessage.UPDATED, testimonial, HttpStatus.OK)
})

export const deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  await TestimonialService.deleteTestimonial(req.params.id)
  sendSuccess(res, HttpMessage.DELETED, null, HttpStatus.OK)
})
