import { Document, model, Schema } from 'mongoose'

export interface IDisclaimerBanner extends Document {
  text: string
  isActive: boolean
  backgroundColor: string
  textColor: string
  createdAt: Date
  updatedAt: Date
}

const DisclaimerBannerSchema = new Schema<IDisclaimerBanner>(
  {
    text: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    backgroundColor: { type: String, default: '#d4af37', trim: true },
    textColor: { type: String, default: '#1a0033', trim: true },
  },
  { timestamps: true },
)

export const DisclaimerBanner = model<IDisclaimerBanner>('DisclaimerBanner', DisclaimerBannerSchema)
