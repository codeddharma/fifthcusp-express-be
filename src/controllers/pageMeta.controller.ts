import { Request, Response } from 'express'
import { z } from 'zod'
import * as PageMetaService from '../services/pageMeta.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const pageMetaSchema = z.object({
  pagePath: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  metaKeywords: z.array(z.string()).optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal('')),
})

export const getByPath = asyncHandler(async (req: Request, res: Response) => {
  const path = typeof req.query.path === 'string' ? req.query.path : '/'
  const meta = await PageMetaService.getPageMetaByPath(path)
  sendSuccess(res, HttpMessage.OK, meta, HttpStatus.OK)
})

export const listPageMeta = asyncHandler(async (_req: Request, res: Response) => {
  const metas = await PageMetaService.listPageMeta()
  sendSuccess(res, HttpMessage.OK, metas, HttpStatus.OK)
})

export const createPageMeta = asyncHandler(async (req: Request, res: Response) => {
  const input = pageMetaSchema.parse(req.body)
  const meta = await PageMetaService.createPageMeta(input)
  sendSuccess(res, HttpMessage.CREATED, meta, HttpStatus.CREATED)
})

export const updatePageMeta = asyncHandler(async (req: Request, res: Response) => {
  const input = pageMetaSchema.partial().parse(req.body)
  const meta = await PageMetaService.updatePageMeta(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, meta, HttpStatus.OK)
})

export const deletePageMeta = asyncHandler(async (req: Request, res: Response) => {
  await PageMetaService.deletePageMeta(req.params.id)
  sendSuccess(res, 'Deleted successfully', null, HttpStatus.OK)
})
