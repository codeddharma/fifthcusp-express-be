import { z, ZodTypeAny } from 'zod'
import { IFormInput } from '../models/Service'

function buildFieldSchema(field: IFormInput): ZodTypeAny {
  const v = field.validation ?? {}

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'password': {
      let s = z.string()
      if (v.minLength !== undefined) s = s.min(v.minLength)
      if (v.maxLength !== undefined) s = s.max(v.maxLength)
      if (v.pattern) s = s.regex(new RegExp(v.pattern))
      return field.isRequired ? s.min(1) : s.optional().or(z.literal(''))
    }
    case 'email': {
      const s = z.string().email()
      return field.isRequired ? s : s.optional().or(z.literal(''))
    }
    case 'phonenumber': {
      const s = z.string().min(7).max(20)
      return field.isRequired ? s : s.optional().or(z.literal(''))
    }
    case 'date': {
      const base = field.isRequired ? z.string().min(1) : z.string()
      let s: ZodTypeAny = base
      if (v.minDate && v.minDate !== 'today') s = s.refine((d) => typeof d !== 'string' || d >= v.minDate!, { message: `must be on/after ${v.minDate}` })
      if (v.maxDate && v.maxDate !== 'today') s = s.refine((d) => typeof d !== 'string' || d <= v.maxDate!, { message: `must be on/before ${v.maxDate}` })
      if (v.maxDate === 'today') {
        const today = new Date().toISOString().slice(0, 10)
        s = s.refine((d) => typeof d !== 'string' || d <= today, { message: 'must be on/before today' })
      }
      if (v.minDate === 'today') {
        const today = new Date().toISOString().slice(0, 10)
        s = s.refine((d) => typeof d !== 'string' || d >= today, { message: 'must be on/after today' })
      }
      return field.isRequired ? s : s.optional().or(z.literal(''))
    }
    case 'number': {
      let s = z.coerce.number()
      if (v.min !== undefined) s = s.min(v.min)
      if (v.max !== undefined) s = s.max(v.max)
      return field.isRequired ? s : s.optional()
    }
    case 'checkbox': {
      const s = z.coerce.boolean()
      return field.isRequired ? s : s.optional()
    }
    case 'dropdown':
    case 'radio': {
      const opts = field.options && field.options.length > 0 ? field.options : ['']
      const s = z.enum(opts as [string, ...string[]])
      return field.isRequired ? s : s.optional().or(z.literal(''))
    }
    case 'multiSelect': {
      const opts = field.options && field.options.length > 0 ? field.options : ['']
      const s = z.array(z.enum(opts as [string, ...string[]]))
      return field.isRequired ? s.min(1) : s.optional()
    }
    default:
      return z.unknown()
  }
}

export function buildFormSchema(formInputs: IFormInput[]): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {}
  for (const f of formInputs) {
    shape[f.fieldKey] = buildFieldSchema(f)
  }
  return z.object(shape)
}
