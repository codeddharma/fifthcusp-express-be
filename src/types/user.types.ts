import { Types } from 'mongoose'
import { Specialty } from '../constants/specialties'

export type UserRole = 'admin' | 'manager' | 'employee'

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  // Page/section-based specialties this employee can be assigned (e.g. 'astrology_calls',
  // 'tarot') — used to manually (and later automatically) route orders/calls to the right staff.
  specialties: Specialty[]
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
