import { Document, model, Schema, Types } from 'mongoose'

export interface ITestimonial extends Document {
  feedback: string
  clientName: string
  services: string[]
  isApproved: boolean
  isRejected: boolean
  approvedAt?: Date
  rejectedAt?: Date
  // Order-linked testimonials (created via feedback flow)
  orderId?: Types.ObjectId
  customerId?: Types.ObjectId
  starRating?: number
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
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    starRating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true },
)

export const Testimonial = model<ITestimonial>('Testimonial', TestimonialSchema)
