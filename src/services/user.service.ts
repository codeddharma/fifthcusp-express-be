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

// ─── Seed test users (idempotent) ─────────────────────────────────────────────

interface SeedUserSpec {
  name: string
  email: string
  password: string
  role: UserRole
}

const TEST_USERS: SeedUserSpec[] = [
  { name: 'Test Admin', email: 'admin@fifthcusp.test', password: 'Admin@12345', role: 'admin' },
  { name: 'Test Manager', email: 'manager@fifthcusp.test', password: 'Manager@12345', role: 'manager' },
  { name: 'Test Employee', email: 'employee@fifthcusp.test', password: 'Employee@12345', role: 'employee' },
]

export async function seedUsers(): Promise<void> {
  // Ensure the admin exists first so we can record it as createdBy on the others
  const adminSpec = TEST_USERS.find((u) => u.role === 'admin')!
  let admin = await User.findOne({ email: adminSpec.email })
  if (!admin) {
    admin = await User.create({
      name: adminSpec.name,
      email: adminSpec.email,
      passwordHash: adminSpec.password,
      role: adminSpec.role,
    })
    console.log(`Seeded test user: ${adminSpec.email} / ${adminSpec.password} (${adminSpec.role})`)
  } else {
    console.log(`Test user already exists: ${adminSpec.email} (${adminSpec.role}) — skipped`)
  }

  for (const spec of TEST_USERS.filter((u) => u.role !== 'admin')) {
    const existing = await User.findOne({ email: spec.email })
    if (existing) {
      console.log(`Test user already exists: ${spec.email} (${spec.role}) — skipped`)
      continue
    }
    await User.create({
      name: spec.name,
      email: spec.email,
      passwordHash: spec.password,
      role: spec.role,
      createdBy: admin._id,
    })
    console.log(`Seeded test user: ${spec.email} / ${spec.password} (${spec.role})`)
  }
}
