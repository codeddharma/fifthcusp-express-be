import { Types } from 'mongoose'

export function generateOrderNumber(serviceId: Types.ObjectId | string): string {
  const sid = serviceId.toString().slice(-6).toUpperCase()
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ORD-${sid}-${ts}${rand}`
}
