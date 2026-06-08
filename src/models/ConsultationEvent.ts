import { Document, model, Schema, Types } from 'mongoose'

export interface IConsultationEvent extends Document {
  orderId: Types.ObjectId
  customerId: Types.ObjectId
  bookingTokenId: Types.ObjectId
  title: string
  startTime: Date
  endTime: Date
  durationMinutes: number
  googleEventId: string
  meetLink: string
  emailSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ConsultationEventSchema = new Schema<IConsultationEvent>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    bookingTokenId: { type: Schema.Types.ObjectId, ref: 'ConsultationBookingToken', required: true },
    title: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 15 },
    googleEventId: { type: String, required: true },
    meetLink: { type: String, default: '' },
    emailSentAt: { type: Date },
  },
  { timestamps: true },
)

ConsultationEventSchema.index({ orderId: 1 })
ConsultationEventSchema.index({ customerId: 1, startTime: -1 })
ConsultationEventSchema.index({ startTime: 1, endTime: 1 })

export const ConsultationEvent = model<IConsultationEvent>('ConsultationEvent', ConsultationEventSchema)
