import { Document, model, Schema, Types } from 'mongoose'

export type RecurringOrderStatus = 'active' | 'paused' | 'cancelled'
export type IntervalUnit = 'day' | 'week' | 'month'

export interface IRecurringOrder extends Document {
  customerId: Types.ObjectId
  serviceId?: Types.ObjectId
  customServiceDescription?: string
  amount: number
  description: string
  intervalUnit: IntervalUnit
  intervalCount: number
  linkValidityDays: number
  status: RecurringOrderStatus
  nextRunAt: Date
  lastRunAt?: Date
  generatedLinks: Types.ObjectId[]
  notes?: string
  prefillName: string
  prefillEmail: string
  prefillPhone: string
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const RecurringOrderSchema = new Schema<IRecurringOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    customServiceDescription: { type: String, trim: true },
    amount: { type: Number, required: true, min: 1 },
    description: { type: String, required: true, trim: true },
    intervalUnit: { type: String, enum: ['day', 'week', 'month'], required: true },
    intervalCount: { type: Number, required: true, min: 1 },
    linkValidityDays: { type: Number, required: true, min: 1, default: 7 },
    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
    nextRunAt: { type: Date, required: true },
    lastRunAt: { type: Date },
    generatedLinks: [{ type: Schema.Types.ObjectId, ref: 'PaymentLink' }],
    notes: { type: String, trim: true },
    prefillName: { type: String, required: true, trim: true },
    prefillEmail: { type: String, required: true, trim: true, lowercase: true },
    prefillPhone: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

RecurringOrderSchema.index({ status: 1, nextRunAt: 1 })
RecurringOrderSchema.index({ customerId: 1, createdAt: -1 })

export const RecurringOrder = model<IRecurringOrder>('RecurringOrder', RecurringOrderSchema)
