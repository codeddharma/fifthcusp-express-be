import { Document, model, Schema } from 'mongoose'

export interface ITestimonial extends Document {
  feedback: string
  clientName: string
  services: string[]
  isApproved: boolean
  isRejected: boolean
  approvedAt?: Date
  rejectedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    feedback: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    services: { type: [String], required: true },
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true },
)

export const Testimonial = model<ITestimonial>('Testimonial', TestimonialSchema)
