import { Types } from 'mongoose'
import { PageContent, ISection } from '../models/PageContent'
import { ApiError } from '../utils/ApiError'

interface PageResult {
  _id: Types.ObjectId
  page: string
  slug: string
  metaTitle: string
  metaDescription: string
  isPublished: boolean
  sections: ISection[]
  createdBy: Types.ObjectId
  updatedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// ─── Public ──────────────────────────────────────────────────────────────────

export async function getPublishedPage(page: string): Promise<PageResult> {
  const doc = await PageContent.findOne({ page, isPublished: true }).lean<PageResult>()
  if (!doc) throw new ApiError(404, `Page "${page}" not found`)
  doc.sections = doc.sections.filter((s) => s.isVisible).sort((a, b) => a.order - b.order)
  return doc
}

// ─── Admin — Pages ───────────────────────────────────────────────────────────

export async function listPages() {
  return PageContent.find().select('-sections').sort({ page: 1 }).lean()
}

export async function getPageAdmin(page: string): Promise<PageResult> {
  const doc = await PageContent.findOne({ page }).lean<PageResult>()
  if (!doc) throw new ApiError(404, `Page "${page}" not found`)
  doc.sections = doc.sections.sort((a, b) => a.order - b.order)
  return doc
}

interface CreatePageInput {
  page: string
  slug: string
  metaTitle: string
  metaDescription: string
  isPublished?: boolean
  createdBy: string
}

export async function createPage(input: CreatePageInput) {
  const existing = await PageContent.findOne({ $or: [{ page: input.page }, { slug: input.slug }] })
  if (existing) throw new ApiError(409, 'A page with this key or slug already exists')
  return PageContent.create(input)
}

interface UpdatePageMetaInput {
  slug?: string
  metaTitle?: string
  metaDescription?: string
  isPublished?: boolean
  updatedBy: string
}

export async function updatePageMeta(page: string, input: UpdatePageMetaInput) {
  const doc = await PageContent.findOneAndUpdate(
    { page },
    { $set: input },
    { new: true, runValidators: true },
  ).select('-sections')
  if (!doc) throw new ApiError(404, `Page "${page}" not found`)
  return doc
}

export async function deletePage(page: string) {
  const doc = await PageContent.findOneAndDelete({ page })
  if (!doc) throw new ApiError(404, `Page "${page}" not found`)
}

// ─── Admin — Sections ────────────────────────────────────────────────────────

interface UpsertSectionInput {
  title: string
  order?: number
  isVisible?: boolean
  data: unknown
  updatedBy: string
}

export async function upsertSection(page: string, sectionKey: string, input: UpsertSectionInput) {
  const doc = await PageContent.findOne({ page })
  if (!doc) throw new ApiError(404, `Page "${page}" not found`)

  const existing = doc.sections.find((s) => s.key === sectionKey)

  if (existing) {
    existing.title = input.title
    existing.order = input.order ?? existing.order
    existing.isVisible = input.isVisible ?? existing.isVisible
    existing.data = input.data
    existing.updatedBy = input.updatedBy as unknown as import('mongoose').Types.ObjectId
  } else {
    const maxOrder = doc.sections.reduce((m, s) => Math.max(m, s.order), 0)
    doc.sections.push({
      key: sectionKey,
      title: input.title,
      order: input.order ?? maxOrder + 1,
      isVisible: input.isVisible ?? true,
      data: input.data,
      updatedBy: input.updatedBy as unknown as import('mongoose').Types.ObjectId,
      updatedAt: new Date(),
    } as ISection)
  }

  doc.updatedBy = input.updatedBy as unknown as import('mongoose').Types.ObjectId
  await doc.save()
  return doc.sections.find((s) => s.key === sectionKey)
}

export async function deleteSection(page: string, sectionKey: string) {
  const doc = await PageContent.findOne({ page })
  if (!doc) throw new ApiError(404, `Page "${page}" not found`)

  const before = doc.sections.length
  doc.sections = doc.sections.filter((s) => s.key !== sectionKey)
  if (doc.sections.length === before) throw new ApiError(404, `Section "${sectionKey}" not found`)

  await doc.save()
}

export async function reorderSections(
  page: string,
  order: { key: string; order: number }[],
  updatedBy: string,
) {
  const doc = await PageContent.findOne({ page })
  if (!doc) throw new ApiError(404, `Page "${page}" not found`)

  for (const { key, order: newOrder } of order) {
    const section = doc.sections.find((s) => s.key === key)
    if (section) section.order = newOrder
  }

  doc.updatedBy = updatedBy as unknown as import('mongoose').Types.ObjectId
  await doc.save()
  return doc.sections.sort((a, b) => a.order - b.order)
}
