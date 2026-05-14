import { Request, Response } from 'express'
import { z } from 'zod'
import * as BlogService from '../services/blog.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

// ─── Validation schemas ───────────────────────────────────────────────────────

const createBlogSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.string().min(1),
  slug: z.string().optional(),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
})

const updateBlogSchema = createBlogSchema.partial()

// ─── Public controllers ───────────────────────────────────────────────────────

export const listBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { isPublished, category, tag } = req.query
  const filter: Record<string, unknown> = {}
  if (isPublished !== undefined) filter.isPublished = isPublished === 'true'
  if (category) filter.category = category as string
  if (tag) filter.tag = tag as string
  const blogs = await BlogService.getAllBlogs(filter)
  sendSuccess(res, HttpMessage.OK, blogs, HttpStatus.OK)
})

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.getBlogBySlug(req.params.slug)
  sendSuccess(res, HttpMessage.OK, blog, HttpStatus.OK)
})

export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.getBlogById(req.params.id)
  sendSuccess(res, HttpMessage.OK, blog, HttpStatus.OK)
})

// ─── Admin controllers ────────────────────────────────────────────────────────

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const input = createBlogSchema.parse(req.body)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id ?? '000000000000000000000001'
  const blog = await BlogService.createBlog(input, userId)
  sendSuccess(res, HttpMessage.CREATED, blog, HttpStatus.CREATED)
})

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBlogSchema.parse(req.body)
  const blog = await BlogService.updateBlog(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, blog, HttpStatus.OK)
})

export const publishBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.publishBlog(req.params.id)
  sendSuccess(res, HttpMessage.UPDATED, blog, HttpStatus.OK)
})

export const unpublishBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.unpublishBlog(req.params.id)
  sendSuccess(res, HttpMessage.UPDATED, blog, HttpStatus.OK)
})

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  await BlogService.deleteBlog(req.params.id)
  sendSuccess(res, HttpMessage.DELETED, null, HttpStatus.OK)
})
