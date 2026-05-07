import { Schema, model, Document, Types } from 'mongoose' // Types used in IRefreshTokenDocument

export interface IRefreshTokenDocument extends Document {
  userId: Types.ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}

const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

// Auto-delete expired tokens via MongoDB TTL index
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RefreshToken = model<IRefreshTokenDocument>('RefreshToken', refreshTokenSchema)
