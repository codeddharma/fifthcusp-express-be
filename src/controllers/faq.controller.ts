import { Request, Response } from 'express'
import { z } from 'zod'
import * as FaqService from '../services/faq.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

// ─── Validation schemas ───────────────────────────────────────────────────────

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  isActive: z.boolean().optional(),
})

const createFaqSchema = z.object({
  page: z.string().min(1),
  faqs: z.array(faqItemSchema).min(1),
})

const updateFaqSchema = createFaqSchema.partial()

// ─── Public controllers ───────────────────────────────────────────────────────

export const listFaqs = asyncHandler(async (_req: Request, res: Response) => {
  const faqs = await FaqService.getAllFaqs()
  sendSuccess(res, HttpMessage.OK, faqs, HttpStatus.OK)
})

export const getFaqByPage = asyncHandler(async (req: Request, res: Response) => {
  const faq = await FaqService.getFaqByPage(req.params.page)
  sendSuccess(res, HttpMessage.OK, faq, HttpStatus.OK)
})

export const getFaq = asyncHandler(async (req: Request, res: Response) => {
  const faq = await FaqService.getFaqById(req.params.id)
  sendSuccess(res, HttpMessage.OK, faq, HttpStatus.OK)
})

// ─── Admin controllers ────────────────────────────────────────────────────────

export const createFaq = asyncHandler(async (req: Request, res: Response) => {
  const input = createFaqSchema.parse(req.body)
  const faq = await FaqService.createFaq(input)
  sendSuccess(res, HttpMessage.CREATED, faq, HttpStatus.CREATED)
})

export const updateFaq = asyncHandler(async (req: Request, res: Response) => {
  const input = updateFaqSchema.parse(req.body)
  const faq = await FaqService.updateFaq(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, faq, HttpStatus.OK)
})

export const deleteFaq = asyncHandler(async (req: Request, res: Response) => {
  await FaqService.deleteFaq(req.params.id)
  sendSuccess(res, HttpMessage.DELETED, null, HttpStatus.OK)
})
