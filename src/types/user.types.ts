import { Types } from 'mongoose'

export type UserRole = 'admin' | 'manager' | 'employee'

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
