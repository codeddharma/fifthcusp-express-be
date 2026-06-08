import { Document, model, Schema, Types } from 'mongoose'

export interface IRemedyEvent extends Document {
  customerId: Types.ObjectId
  orderId?: Types.ObjectId
  remedyName: string
  notes?: string
  scheduledAt: Date
  googleEventId: string
  reminderSentAt?: Date
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const RemedyEventSchema = new Schema<IRemedyEvent>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    remedyName: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    scheduledAt: { type: Date, required: true },
    googleEventId: { type: String, required: true },
    reminderSentAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

RemedyEventSchema.index({ customerId: 1, scheduledAt: -1 })
RemedyEventSchema.index({ scheduledAt: 1, reminderSentAt: 1 })

export const RemedyEvent = model<IRemedyEvent>('RemedyEvent', RemedyEventSchema)
