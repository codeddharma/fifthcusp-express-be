import multer from 'multer'
import env from '../config/env'

export const uploadAny = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 50,
    fields: 200,
    fieldSize: 256 * 1024,
  },
}).any()

export const MAX_ORDER_UPLOAD_BYTES = env.MAX_ORDER_UPLOAD_MB * 1024 * 1024
