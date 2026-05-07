import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { IUser } from '../types/user.types'

export interface IUserDocument extends IUser, Document {
  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  next()
})

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash)
}

// Never return passwordHash in JSON output
userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.passwordHash = undefined
    return ret
  },
})

export const User = model<IUserDocument>('User', userSchema)
