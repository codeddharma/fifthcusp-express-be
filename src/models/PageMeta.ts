import { Document, model, Schema } from 'mongoose'

export interface IPageMeta extends Document {
  pagePath: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const PageMetaSchema = new Schema<IPageMeta>(
  {
    pagePath: { type: String, required: true, unique: true, trim: true, lowercase: true },
    metaTitle: { type: String, required: true, trim: true },
    metaDescription: { type: String, required: true, trim: true },
    metaKeywords: [{ type: String, trim: true }],
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImageUrl: { type: String, trim: true },
  },
  { timestamps: true },
)

PageMetaSchema.index({ pagePath: 1 }, { unique: true })

export const PageMeta = model<IPageMeta>('PageMeta', PageMetaSchema)
