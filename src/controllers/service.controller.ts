import { Request, Response } from 'express'
import { z } from 'zod'
import * as ServiceService from '../services/service.service'
import { ServiceType } from '../models/Service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

// ─── Validation schemas ───────────────────────────────────────────────────────

const createServiceSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  type: z.enum(['basic', 'advanced']).default('basic'),
  isInSale: z.boolean().optional(),
  saleTitle: z.string().optional(),
  hasSaleBanner: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  isActiveService: z.boolean().optional(),
})

const updateServiceSchema = createServiceSchema.partial()

// ─── Public controllers ───────────────────────────────────────────────────────

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const onlyActive = req.query.active === 'true'
  const rawType = req.query.type
  const type = rawType === 'basic' || rawType === 'advanced' ? (rawType as ServiceType) : undefined
  const services = await ServiceService.getAllServices(onlyActive, type)
  sendSuccess(res, HttpMessage.OK, services, HttpStatus.OK)
})

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await ServiceService.getServiceById(req.params.id)
  sendSuccess(res, HttpMessage.OK, service, HttpStatus.OK)
})

// ─── Admin controllers ────────────────────────────────────────────────────────

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const input = createServiceSchema.parse(req.body)
  const service = await ServiceService.createService(input)
  sendSuccess(res, HttpMessage.CREATED, service, HttpStatus.CREATED)
})

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const input = updateServiceSchema.parse(req.body)
  const service = await ServiceService.updateService(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, service, HttpStatus.OK)
})

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await ServiceService.deleteService(req.params.id)
  sendSuccess(res, HttpMessage.DELETED, null, HttpStatus.OK)
})
