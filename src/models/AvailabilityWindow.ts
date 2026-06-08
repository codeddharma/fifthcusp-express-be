import { Document, model, Schema } from 'mongoose'

export interface IAvailabilityWindow extends Document {
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startHour: number // 0–23
  endHour: number   // 1–24, must be > startHour
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AvailabilityWindowSchema = new Schema<IAvailabilityWindow>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startHour: { type: Number, required: true, min: 0, max: 23 },
    endHour: { type: Number, required: true, min: 1, max: 24 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

AvailabilityWindowSchema.index({ dayOfWeek: 1, isActive: 1 })

export const AvailabilityWindow = model<IAvailabilityWindow>('AvailabilityWindow', AvailabilityWindowSchema)
