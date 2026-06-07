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

// For admin output file uploads — stores to disk in a temp location
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, require('os').tmpdir()),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})

export const uploadSingle = multer({
  storage: diskStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
}).single('file')
