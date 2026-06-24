import { Document, model, Schema } from 'mongoose'

export type CalendarEventType =
  | 'grahan'
  | 'solar-eclipse'
  | 'lunar-eclipse'
  | 'full-moon'
  | 'new-moon'
  | 'festival'
  | 'other'

export const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  'grahan',
  'solar-eclipse',
  'lunar-eclipse',
  'full-moon',
  'new-moon',
  'festival',
  'other',
]

export interface ICalendarEvent extends Document {
  title: string
  eventType: CalendarEventType
  date: Date
  description?: string
  isActive: boolean
  createdBy?: Schema.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true, trim: true },
    eventType: { type: String, enum: CALENDAR_EVENT_TYPES, default: 'other' },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

CalendarEventSchema.index({ date: 1, isActive: 1 })

CalendarEventSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.createdBy
    return ret
  },
})

export const CalendarEvent = model<ICalendarEvent>('CalendarEvent', CalendarEventSchema)
