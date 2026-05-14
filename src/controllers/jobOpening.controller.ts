import { Request, Response } from 'express'
import { z } from 'zod'
import * as JobOpeningService from '../services/jobOpening.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

// ─── Validation schemas ───────────────────────────────────────────────────────

const createJobOpeningSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  experienceLevel: z.enum(['junior', 'mid', 'senior']),
  experienceYears: z.number().min(0),
  skills: z.array(z.string().min(1)).min(1),
  qualifications: z.array(z.string().min(1)).min(1),
  responsibilities: z.array(z.string().min(1)).min(1),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  applicationDeadline: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
})

const updateJobOpeningSchema = createJobOpeningSchema.partial()

// ─── Public controllers ───────────────────────────────────────────────────────

export const listJobOpenings = asyncHandler(async (req: Request, res: Response) => {
  const { isActive, isClosed, department } = req.query
  const filter: Record<string, unknown> = {}
  if (isActive !== undefined) filter.isActive = isActive === 'true'
  if (isClosed !== undefined) filter.isClosed = isClosed === 'true'
  if (department) filter.department = department as string
  const jobs = await JobOpeningService.getAllJobOpenings(filter)
  sendSuccess(res, HttpMessage.OK, jobs, HttpStatus.OK)
})

export const getJobOpening = asyncHandler(async (req: Request, res: Response) => {
  const job = await JobOpeningService.getJobOpeningById(req.params.id)
  sendSuccess(res, HttpMessage.OK, job, HttpStatus.OK)
})

// ─── Admin controllers ────────────────────────────────────────────────────────

export const createJobOpening = asyncHandler(async (req: Request, res: Response) => {
  const input = createJobOpeningSchema.parse(req.body)
  const data = { ...input, applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const job = await JobOpeningService.createJobOpening(data as any)
  sendSuccess(res, HttpMessage.CREATED, job, HttpStatus.CREATED)
})

export const updateJobOpening = asyncHandler(async (req: Request, res: Response) => {
  const input = updateJobOpeningSchema.parse(req.body)
  const data = { ...input, applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const job = await JobOpeningService.updateJobOpening(req.params.id, data as any)
  sendSuccess(res, HttpMessage.UPDATED, job, HttpStatus.OK)
})

export const closeJobOpening = asyncHandler(async (req: Request, res: Response) => {
  const job = await JobOpeningService.closeJobOpening(req.params.id)
  sendSuccess(res, HttpMessage.UPDATED, job, HttpStatus.OK)
})

export const deleteJobOpening = asyncHandler(async (req: Request, res: Response) => {
  await JobOpeningService.deleteJobOpening(req.params.id)
  sendSuccess(res, HttpMessage.DELETED, null, HttpStatus.OK)
})
