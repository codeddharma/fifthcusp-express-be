import { Document, model, Schema, Types } from 'mongoose'

export interface ICustomerActivityEntry {
  at: Date
  type: string // 'order_placed' | 'payment_completed' | 'consultation_scheduled' | 'remedy_scheduled'
  message: string
  refModel?: string
  refId?: Types.ObjectId
  meta?: Record<string, unknown>
}

export interface ICustomer extends Document {
  customerId: string
  email: string
  name: string
  phone: string
  notes?: string
  birthDate?: Date
  anniversaryDate?: Date
  orders: Types.ObjectId[]
  activityLog: ICustomerActivityEntry[]
  createdAt: Date
  updatedAt: Date
}

const CustomerActivityEntrySchema = new Schema<ICustomerActivityEntry>(
  {
    at: { type: Date, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    refModel: { type: String },
    refId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed },
  },
  { _id: false },
)

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    birthDate: { type: Date },
    anniversaryDate: { type: Date },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order', default: [] }],
    activityLog: { type: [CustomerActivityEntrySchema], default: [] },
  },
  { timestamps: true },
)

CustomerSchema.index({ email: 1 }, { unique: true })
CustomerSchema.index({ phone: 1 })
CustomerSchema.index({ customerId: 1 }, { unique: true, sparse: true })

// Auto-generate CUST-XXXXX id before insert
CustomerSchema.pre('save', async function (next) {
  if (this.isNew && !this.customerId) {
    const last = await Customer.findOne({}, { customerId: 1 }).sort({ customerId: -1 }).lean()
    let seq = 1
    if (last?.customerId) {
      const match = last.customerId.match(/^CUST-(\d+)$/)
      if (match) seq = parseInt(match[1], 10) + 1
    }
    this.customerId = `CUST-${String(seq).padStart(5, '0')}`
  }
  next()
})

export const Customer = model<ICustomer>('Customer', CustomerSchema)
