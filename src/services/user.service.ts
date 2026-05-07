import { User } from '../models/User'
import { ApiError } from '../utils/ApiError'
import { UserRole } from '../types/user.types'

interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  createdBy: string
}

interface UpdateUserInput {
  name?: string
  role?: UserRole
  isActive?: boolean
}

export async function createUser(input: CreateUserInput) {
  const existing = await User.findOne({ email: input.email })
  if (existing) throw new ApiError(409, 'Email already in use')

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash: input.password,
    role: input.role,
    createdBy: input.createdBy,
  })
  return user
}

export async function listUsers(page: number, limit: number) {
  const skip = (page - 1) * limit
  const [users, total] = await Promise.all([
    User.find().select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ])
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getUserById(id: string) {
  const user = await User.findById(id).select('-passwordHash')
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await User.findByIdAndUpdate(id, input, { new: true, runValidators: true }).select(
    '-passwordHash',
  )
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function deleteUser(id: string, requesterId: string) {
  if (id === requesterId) throw new ApiError(400, 'Cannot delete your own account')
  const user = await User.findByIdAndDelete(id)
  if (!user) throw new ApiError(404, 'User not found')
}
