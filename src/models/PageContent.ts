import { Schema, model, Document, Types } from 'mongoose'

export interface ISection {
  key: string
  title: string
  order: number
  isVisible: boolean
  data: unknown
  updatedAt: Date
  updatedBy?: Types.ObjectId
}

export interface IPageContent {
  page: string
  slug: string
  metaTitle: string
  metaDescription: string
  isPublished: boolean
  sections: ISection[]
  createdBy: Types.ObjectId
  updatedBy?: Types.ObjectId
}

export interface IPageContentDocument extends IPageContent, Document {}

const sectionSchema = new Schema<ISection>(
  {
    key: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    isVisible: { type: Boolean, default: true },
    // Mixed allows any JSON shape — content varies per section type
    data: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
)

const pageContentSchema = new Schema<IPageContentDocument>(
  {
    page: { type: String, required: true, unique: true, trim: true, lowercase: true },
    slug: { type: String, required: true, unique: true, trim: true },
    metaTitle: { type: String, required: true, trim: true },
    metaDescription: { type: String, required: true, trim: true },
    isPublished: { type: Boolean, default: false },
    sections: { type: [sectionSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

// Index for fast public lookups by slug or page key
pageContentSchema.index({ slug: 1 })
pageContentSchema.index({ page: 1, isPublished: 1 })

export const PageContent = model<IPageContentDocument>('PageContent', pageContentSchema)
