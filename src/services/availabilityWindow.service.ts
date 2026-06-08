import { AvailabilityWindow, IAvailabilityWindow } from '../models/AvailabilityWindow'
import { ApiError } from '../utils/ApiError'

interface CreateWindowInput {
  dayOfWeek: number
  startHour: number
  endHour: number
  isActive?: boolean
}

export async function createAvailabilityWindow(input: CreateWindowInput): Promise<IAvailabilityWindow> {
  if (input.endHour <= input.startHour) {
    throw new ApiError(400, 'endHour must be greater than startHour')
  }
  return AvailabilityWindow.create(input)
}

export async function listAvailabilityWindows(): Promise<IAvailabilityWindow[]> {
  return AvailabilityWindow.find().sort({ dayOfWeek: 1, startHour: 1 })
}

export async function updateAvailabilityWindow(
  id: string,
  input: Partial<CreateWindowInput>,
): Promise<IAvailabilityWindow> {
  const window = await AvailabilityWindow.findById(id)
  if (!window) throw new ApiError(404, 'Availability window not found')

  const startHour = input.startHour ?? window.startHour
  const endHour = input.endHour ?? window.endHour
  if (endHour <= startHour) throw new ApiError(400, 'endHour must be greater than startHour')

  Object.assign(window, input)
  return window.save()
}

export async function deleteAvailabilityWindow(id: string): Promise<void> {
  const result = await AvailabilityWindow.findByIdAndDelete(id)
  if (!result) throw new ApiError(404, 'Availability window not found')
}
