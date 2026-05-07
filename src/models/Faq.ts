import { Document, model, Schema } from 'mongoose'

export interface IFaqItem {
  question: string
  answer: string
  isActive: boolean
}

export interface IFaq extends Document {
  page: string
  faqs: IFaqItem[]
  createdAt: Date
  updatedAt: Date
}

const FaqItemSchema = new Schema<IFaqItem>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
)

const FaqSchema = new Schema<IFaq>(
  {
    page: { type: String, required: true, unique: true, trim: true, lowercase: true },
    faqs: { type: [FaqItemSchema], required: true },
  },
  { timestamps: true },
)

export const Faq = model<IFaq>('Faq', FaqSchema)
