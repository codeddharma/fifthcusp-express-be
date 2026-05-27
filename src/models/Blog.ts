import { Document, model, Schema } from 'mongoose'

export interface IBlog extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  category: string
  tags: string[]
  readTime: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords: string[]
  isPublished: boolean
  publishedAt?: Date
  createdBy: Schema.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    readTime: { type: Number, required: true, min: 1 },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

BlogSchema.index({ slug: 1 })
BlogSchema.index({ isPublished: 1, publishedAt: -1 })

BlogSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.createdBy
    return ret
  },
})

export const Blog = model<IBlog>('Blog', BlogSchema)
