import { Document, model, Schema, Types } from 'mongoose'

export interface IAvailabilityWindow extends Document {
  // Unset = the legacy global/manager-defined slot; set = that employee's personal slot.
  userId?: Types.ObjectId
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startHour: number // 0–23
  endHour: number   // 1–24, must be > startHour
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AvailabilityWindowSchema = new Schema<IAvailabilityWindow>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startHour: { type: Number, required: true, min: 0, max: 23 },
    endHour: { type: Number, required: true, min: 1, max: 24 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

AvailabilityWindowSchema.index({ userId: 1, dayOfWeek: 1, isActive: 1 })

export const AvailabilityWindow = model<IAvailabilityWindow>('AvailabilityWindow', AvailabilityWindowSchema)
