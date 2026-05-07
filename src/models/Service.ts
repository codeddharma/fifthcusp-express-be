import { Document, model, Schema } from 'mongoose'

export type ServiceType = 'basic' | 'advanced' | 'numerology' | 'consultation' | 'reports_basic' | 'reports_advanced'

export interface IService extends Document {
  title: string
  subtitle: string
  description: string
  price: number
  type: ServiceType
  pages: string[]
  isInSale: boolean
  saleTitle?: string
  hasSaleBanner: boolean
  discountPercentage: number
  isActiveService: boolean
  createdAt: Date
  updatedAt: Date
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['basic', 'advanced', 'numerology', 'consultation', 'reports_basic', 'reports_advanced'], required: true },
    pages: { type: [String], required: true },
    isInSale: { type: Boolean, default: false },
    saleTitle: { type: String, trim: true },
    hasSaleBanner: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    isActiveService: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Service = model<IService>('Service', ServiceSchema)
