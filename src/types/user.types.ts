import { Types } from 'mongoose'
import { ServiceType } from '../models/Service'

export type UserRole = 'admin' | 'manager' | 'employee'

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  // Service types this employee can be assigned (e.g. 'consultation', 'numerology') —
  // used to manually (and later automatically) route orders/calls to the right staff.
  specialties: ServiceType[]
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
