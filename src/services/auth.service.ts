import { User } from '../models/User'
import { RefreshToken } from '../models/RefreshToken'
import { ApiError } from '../utils/ApiError'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils'
import env from '../config/env'

function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1)
  const value = parseInt(expiry.slice(0, -1), 10)
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return value * (map[unit] ?? 1000)
}

function refreshExpiresAt(): Date {
  return new Date(Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRES_IN))
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email, isActive: true })
  if (!user) throw new ApiError(401, 'Invalid email or password')

  const valid = await user.comparePassword(password)
  if (!valid) throw new ApiError(401, 'Invalid email or password')

  const payload = { userId: user._id.toString(), role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt: refreshExpiresAt() })

  return { accessToken, refreshToken, user }
}

export async function refreshAccessToken(token: string) {
  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  const stored = await RefreshToken.findOne({ token })
  if (!stored) throw new ApiError(401, 'Refresh token not recognised')

  const accessToken = generateAccessToken({ userId: payload.userId, role: payload.role })
  return { accessToken }
}

export async function logoutUser(token: string) {
  await RefreshToken.deleteOne({ token })
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')

  const valid = await user.comparePassword(currentPassword)
  if (!valid) throw new ApiError(400, 'Current password is incorrect')

  user.passwordHash = newPassword
  await user.save()

  // Invalidate all refresh tokens on password change
  await RefreshToken.deleteMany({ userId })
}
