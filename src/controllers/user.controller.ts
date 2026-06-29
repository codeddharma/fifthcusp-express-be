import { Request, Response } from 'express'
import { z } from 'zod'
import * as UserService from '../services/user.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { SERVICE_TYPES, ServiceType } from '../models/Service'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'employee']),
  specialties: z.array(z.enum(SERVICE_TYPES as [ServiceType, ...ServiceType[]])).optional(),
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'manager', 'employee']).optional(),
  isActive: z.boolean().optional(),
  specialties: z.array(z.enum(SERVICE_TYPES as [ServiceType, ...ServiceType[]])).optional(),
})

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const input = createUserSchema.parse(req.body)
  const user = await UserService.createUser({ ...input, createdBy: req.user!._id.toString() })
  sendSuccess(res, 'User created successfully', user, 201)
})

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
  const result = await UserService.listUsers(page, limit)
  sendSuccess(res, 'Users fetched', result.users, 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  })
})

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.params.id)
  sendSuccess(res, 'User fetched', user)
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const input = updateUserSchema.parse(req.body)
  const user = await UserService.updateUser(req.params.id, input)
  sendSuccess(res, 'User updated', user)
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await UserService.deleteUser(req.params.id, req.user!._id.toString())
  sendSuccess(res, 'User deleted')
})
