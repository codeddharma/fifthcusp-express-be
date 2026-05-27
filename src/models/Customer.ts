import { Document, model, Schema, Types } from 'mongoose'

export interface ICustomer extends Document {
  email: string
  name: string
  phone: string
  notes?: string
  orders: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order', default: [] }],
  },
  { timestamps: true },
)

CustomerSchema.index({ email: 1 }, { unique: true })
CustomerSchema.index({ phone: 1 })

export const Customer = model<ICustomer>('Customer', CustomerSchema)
