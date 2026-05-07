import { Request, Response } from 'express'
import { z } from 'zod'
import * as PageContentService from '../services/pageContent.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'

// ─── Validation schemas ───────────────────────────────────────────────────────

const createPageSchema = z.object({
  page: z.string().min(1).toLowerCase(),
  slug: z.string().min(1).startsWith('/'),
  metaTitle: z.string().min(1).max(60),
  metaDescription: z.string().min(1).max(160),
  isPublished: z.boolean().optional(),
})

const updatePageSchema = z.object({
  slug: z.string().min(1).startsWith('/').optional(),
  metaTitle: z.string().min(1).max(60).optional(),
  metaDescription: z.string().min(1).max(160).optional(),
  isPublished: z.boolean().optional(),
})

const upsertSectionSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
  data: z.record(z.unknown()),
})

const reorderSchema = z.object({
  order: z.array(z.object({ key: z.string(), order: z.number().int().min(0) })).min(1),
})

// ─── Public controllers ───────────────────────────────────────────────────────

export const getPublishedPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await PageContentService.getPublishedPage(req.params.page)
  sendSuccess(res, 'Page content fetched', page)
})

// ─── Admin controllers ────────────────────────────────────────────────────────

export const listPages = asyncHandler(async (_req: Request, res: Response) => {
  const pages = await PageContentService.listPages()
  sendSuccess(res, 'Pages fetched', pages)
})

export const getPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await PageContentService.getPageAdmin(req.params.page)
  sendSuccess(res, 'Page fetched', page)
})

export const createPage = asyncHandler(async (req: Request, res: Response) => {
  const input = createPageSchema.parse(req.body)
  const page = await PageContentService.createPage({ ...input, createdBy: req.user!._id.toString() })
  sendSuccess(res, 'Page created', page, 201)
})

export const updatePageMeta = asyncHandler(async (req: Request, res: Response) => {
  const input = updatePageSchema.parse(req.body)
  const page = await PageContentService.updatePageMeta(req.params.page, {
    ...input,
    updatedBy: req.user!._id.toString(),
  })
  sendSuccess(res, 'Page updated', page)
})

export const deletePage = asyncHandler(async (req: Request, res: Response) => {
  await PageContentService.deletePage(req.params.page)
  sendSuccess(res, 'Page deleted')
})

export const upsertSection = asyncHandler(async (req: Request, res: Response) => {
  const input = upsertSectionSchema.parse(req.body)
  const section = await PageContentService.upsertSection(req.params.page, req.params.key, {
    ...input,
    updatedBy: req.user!._id.toString(),
  })
  sendSuccess(res, 'Section saved', section)
})

export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  await PageContentService.deleteSection(req.params.page, req.params.key)
  sendSuccess(res, 'Section deleted')
})

export const reorderSections = asyncHandler(async (req: Request, res: Response) => {
  const { order } = reorderSchema.parse(req.body)
  const sections = await PageContentService.reorderSections(req.params.page, order, req.user!._id.toString())
  sendSuccess(res, 'Sections reordered', sections)
})
