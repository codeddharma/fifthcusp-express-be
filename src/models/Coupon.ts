import { Document, model, Schema, Types } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  description?: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  minOrderAmount: number
  maxUses: number
  usedCount: number
  validFrom?: Date
  expiresAt?: Date
  isActive: boolean
  applicableCustomerIds: Types.ObjectId[]
  applicableServiceIds: Types.ObjectId[]
  isBirthdayOffer: boolean
  isAnniversaryOffer: boolean
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    applicableCustomerIds: [{ type: Schema.Types.ObjectId, ref: 'Customer' }],
    applicableServiceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    isBirthdayOffer: { type: Boolean, default: false },
    isAnniversaryOffer: { type: Boolean, default: false },
  },
  { timestamps: true },
)

CouponSchema.index({ code: 1 }, { unique: true })
CouponSchema.index({ isActive: 1, expiresAt: 1 })

export const Coupon = model<ICoupon>('Coupon', CouponSchema)
