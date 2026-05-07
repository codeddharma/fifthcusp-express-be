import { Request, Response } from 'express'
import { z } from 'zod'
import * as AuthService from '../services/auth.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { ApiError } from '../utils/ApiError'
import { User } from '../models/User'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body)
  const result = await AuthService.loginUser(email, password)
  sendSuccess(res, 'Login successful', result)
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (!refreshToken) throw new ApiError(400, 'refreshToken is required')
  const result = await AuthService.refreshAccessToken(refreshToken)
  sendSuccess(res, 'Token refreshed', result)
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (!refreshToken) throw new ApiError(400, 'refreshToken is required')
  await AuthService.logoutUser(refreshToken)
  sendSuccess(res, 'Logged out successfully')
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).select('-passwordHash')
  if (!user) throw new ApiError(404, 'User not found')
  sendSuccess(res, 'Profile fetched', user)
})

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
  await AuthService.changePassword(req.user!._id.toString(), currentPassword, newPassword)
  sendSuccess(res, 'Password changed successfully')
})
