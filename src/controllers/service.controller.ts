import { Request, Response } from 'express'
import { z } from 'zod'
import * as ServiceService from '../services/service.service'
import { ServiceType } from '../models/Service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

// ─── Validation schemas ───────────────────────────────────────────────────────

const ASTROLOGY_TYPES = ['numerology', 'consultation', 'reports_basic', 'reports_advanced'] as const
const GENERIC_TYPES = ['basic', 'advanced', 'practice'] as const

const FIELD_TYPES = ['text', 'textarea', 'email', 'password', 'phonenumber', 'dropdown', 'multiSelect', 'radio', 'date', 'number', 'checkbox'] as const

const formInputValidationSchema = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
  pattern: z.string().optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

const formInputSchema = z.object({
  fieldKey: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  isRequired: z.boolean(),
  placeholder: z.string().optional(),
  tooltip: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation: formInputValidationSchema.optional(),
  order: z.number().int().min(0),
})

const fileUploadSchema = z.object({
  fieldKey: z.string().min(1),
  label: z.string().min(1),
  tooltip: z.string().optional(),
  acceptedTypes: z.array(z.string().min(1)).min(1),
  maxFiles: z.number().int().min(1).default(1),
  maxFileSizeMB: z.number().min(0.1).max(100).default(5),
  isRequired: z.boolean(),
  order: z.number().int().min(0),
})

const addOnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  formInputs: z.array(formInputSchema).optional().default([]),
  fileUploads: z.array(fileUploadSchema).optional().default([]),
})

const repeatableGroupSchema = z.object({
  enabled: z.boolean(),
  label: z.string().min(1),
  maxRepeats: z.number().int().min(1).max(20).default(1),
})

const serviceTypeValidation = (schema: z.ZodObject<z.ZodRawShape>) =>
  schema.superRefine((data, ctx) => {
    const isAstrologyPage = data.pages?.includes('astrology')
    if (!data.type) return
    if (isAstrologyPage && (GENERIC_TYPES as readonly string[]).includes(data.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['type'],
        message: 'Astrology page services must use: numerology, consultation, reports_basic, or reports_advanced',
      })
    }
    if (!isAstrologyPage && (ASTROLOGY_TYPES as readonly string[]).includes(data.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['type'],
        message: 'numerology, consultation, reports_basic, reports_advanced types are only valid for the astrology page',
      })
    }
  })

const createServiceSchema = serviceTypeValidation(
  z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    price: z.number().min(0),
    type: z.enum(['basic', 'advanced', 'practice', 'numerology', 'consultation', 'reports_basic', 'reports_advanced']),
    pages: z.array(z.string().min(1)).min(1),
    formInputs: z.array(formInputSchema).optional().default([]),
    fileUploads: z.array(fileUploadSchema).optional().default([]),
    addOns: z.array(addOnSchema).optional().default([]),
    repeatableGroup: repeatableGroupSchema.optional(),
    isInSale: z.boolean().optional(),
    saleTitle: z.string().optional(),
    hasSaleBanner: z.boolean().optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    isActiveService: z.boolean().optional(),
  }),
)

const updateServiceSchema = serviceTypeValidation(
  z.object({
    title: z.string().min(1).optional(),
    subtitle: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    type: z.enum(['basic', 'advanced', 'practice', 'numerology', 'consultation', 'reports_basic', 'reports_advanced']).optional(),
    pages: z.array(z.string().min(1)).min(1).optional(),
    formInputs: z.array(formInputSchema).optional(),
    fileUploads: z.array(fileUploadSchema).optional(),
    addOns: z.array(addOnSchema).optional(),
    repeatableGroup: repeatableGroupSchema.optional(),
    isInSale: z.boolean().optional(),
    saleTitle: z.string().optional(),
    hasSaleBanner: z.boolean().optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    isActiveService: z.boolean().optional(),
  }),
)

// ─── Public controllers ───────────────────────────────────────────────────────

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const onlyActive = req.query.active === 'true'
  const rawType = req.query.type
  const validTypes: ServiceType[] = ['basic', 'advanced', 'practice', 'numerology', 'consultation', 'reports_basic', 'reports_advanced']
  const type = validTypes.includes(rawType as ServiceType) ? (rawType as ServiceType) : undefined
  const page = typeof req.query.page === 'string' ? req.query.page : undefined
  const services = await ServiceService.getAllServices(onlyActive, type, page)
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
