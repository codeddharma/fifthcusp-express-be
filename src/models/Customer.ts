import { Document, model, Schema, Types } from 'mongoose'

export interface ICustomer extends Document {
  customerId: string
  email: string
  name: string
  phone: string
  notes?: string
  birthDate?: Date
  anniversaryDate?: Date
  orders: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

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
