import { Document, model, Schema, Types } from 'mongoose'

export type BookingTokenStatus = 'pending' | 'booked' | 'expired'

export interface IConsultationBookingToken extends Document {
  token: string
  orderId: Types.ObjectId
  customerId: Types.ObjectId
  status: BookingTokenStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const ConsultationBookingTokenSchema = new Schema<IConsultationBookingToken>(
  {
    token: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    status: { type: String, enum: ['pending', 'booked', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

ConsultationBookingTokenSchema.index({ token: 1 })
ConsultationBookingTokenSchema.index({ orderId: 1 })
ConsultationBookingTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL — auto-delete expired docs

export const ConsultationBookingToken = model<IConsultationBookingToken>(
  'ConsultationBookingToken',
  ConsultationBookingTokenSchema,
)
