import { Document, model, Schema, Types } from 'mongoose'

export interface IInternalNote extends Document {
  userId: Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

const InternalNoteSchema = new Schema<IInternalNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

InternalNoteSchema.index({ userId: 1, updatedAt: -1 })

export const InternalNote = model<IInternalNote>('InternalNote', InternalNoteSchema)
