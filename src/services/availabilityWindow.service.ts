import { Types } from 'mongoose'
import { AvailabilityWindow, IAvailabilityWindow } from '../models/AvailabilityWindow'
import { ApiError } from '../utils/ApiError'

interface CreateWindowInput {
  dayOfWeek: number
  startHour: number
  endHour: number
  isActive?: boolean
}

// `userId` set = an employee managing their own slot; undefined = the legacy
// global/manager-defined slot (admin/manager view, unchanged behavior).
export async function createAvailabilityWindow(
  input: CreateWindowInput,
  userId?: Types.ObjectId,
): Promise<IAvailabilityWindow> {
  if (input.endHour <= input.startHour) {
    throw new ApiError(400, 'endHour must be greater than startHour')
  }
  return AvailabilityWindow.create({ ...input, userId })
}

export async function listAvailabilityWindows(userId?: Types.ObjectId): Promise<IAvailabilityWindow[]> {
  const filter = userId ? { userId } : { userId: { $exists: false } }
  return AvailabilityWindow.find(filter).sort({ dayOfWeek: 1, startHour: 1 })
}

export async function updateAvailabilityWindow(
  id: string,
  input: Partial<CreateWindowInput>,
  userId?: Types.ObjectId,
): Promise<IAvailabilityWindow> {
  const window = await AvailabilityWindow.findById(id)
  if (!window) throw new ApiError(404, 'Availability window not found')
  if (userId && String(window.userId) !== String(userId)) {
    throw new ApiError(403, 'You can only edit your own availability')
  }

  const startHour = input.startHour ?? window.startHour
  const endHour = input.endHour ?? window.endHour
  if (endHour <= startHour) throw new ApiError(400, 'endHour must be greater than startHour')

  Object.assign(window, input)
  return window.save()
}

export async function deleteAvailabilityWindow(id: string, userId?: Types.ObjectId): Promise<void> {
  const window = await AvailabilityWindow.findById(id)
  if (!window) throw new ApiError(404, 'Availability window not found')
  if (userId && String(window.userId) !== String(userId)) {
    throw new ApiError(403, 'You can only delete your own availability')
  }
  await window.deleteOne()
}
