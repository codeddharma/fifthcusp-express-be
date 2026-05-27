import fs from 'fs/promises'
import { createReadStream } from 'fs'
import path from 'path'
import zlib from 'zlib'
import { Readable } from 'stream'
import sharp from 'sharp'
import env from '../config/env'
import { ApiError } from '../utils/ApiError'
import { HttpStatus } from '../utils/httpStatus'
import { FileCompression, IOrderFile } from '../models/Order'
import { IFileUploadField } from '../models/Service'

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'])

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

function getExtFromMime(mime: string, fallback: string): string {
  if (mime === 'application/pdf') return 'pdf'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/heic' || mime === 'image/heif') return 'heic'
  return fallback || 'bin'
}

export function orderDirAbsolute(orderNumber: string): string {
  return path.resolve(env.UPLOAD_DIR, 'orders', orderNumber)
}

export interface ProcessedFile {
  buffer: Buffer
  storedName: string
  compression: FileCompression
}

async function processBuffer(file: Express.Multer.File): Promise<ProcessedFile> {
  const baseExt = (file.originalname.split('.').pop() ?? '').toLowerCase()
  const safeOriginal = sanitizeName(file.originalname.replace(/\.[^.]*$/, ''))

  if (IMAGE_MIME.has(file.mimetype)) {
    const webp = await sharp(file.buffer)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer()
    return { buffer: webp, storedName: `${safeOriginal}.webp`, compression: 'sharp-webp' }
  }

  if (file.mimetype === 'application/pdf') {
    if (file.buffer.byteLength > 500 * 1024) {
      const gz = zlib.gzipSync(file.buffer, { level: 9 })
      if (gz.byteLength <= file.buffer.byteLength * 0.8) {
        return { buffer: gz, storedName: `${safeOriginal}.pdf.gz`, compression: 'gzip' }
      }
    }
    return { buffer: file.buffer, storedName: `${safeOriginal}.pdf`, compression: 'none' }
  }

  const gz = zlib.gzipSync(file.buffer, { level: 9 })
  const ext = getExtFromMime(file.mimetype, baseExt)
  if (gz.byteLength < file.buffer.byteLength) {
    return { buffer: gz, storedName: `${safeOriginal}.${ext}.gz`, compression: 'gzip' }
  }
  return { buffer: file.buffer, storedName: `${safeOriginal}.${ext}`, compression: 'none' }
}

export function validateFilesAgainstService(
  files: Express.Multer.File[],
  fileUploadFields: IFileUploadField[],
  addOnFileFields: Map<string, IFileUploadField[]>,
  selectedAddOnKeys: Set<string>,
): void {
  const baseByKey = new Map(fileUploadFields.map((f) => [f.fieldKey, f]))

  // Group files by multer fieldname; convention: "<fieldKey>" or "addon__<addOnKey>__<fieldKey>"
  const byField = new Map<string, Express.Multer.File[]>()
  let totalBytes = 0
  for (const f of files) {
    totalBytes += f.size
    const list = byField.get(f.fieldname) ?? []
    list.push(f)
    byField.set(f.fieldname, list)
  }
  if (totalBytes > env.MAX_ORDER_UPLOAD_MB * 1024 * 1024) {
    throw new ApiError(413, `Total upload exceeds ${env.MAX_ORDER_UPLOAD_MB} MB`)
  }

  const resolveField = (fieldname: string): { def: IFileUploadField | undefined; addOnKey?: string } => {
    if (fieldname.startsWith('addon__')) {
      const [, addOnKey, fieldKey] = fieldname.split('__')
      if (!selectedAddOnKeys.has(addOnKey)) return { def: undefined, addOnKey }
      const def = (addOnFileFields.get(addOnKey) ?? []).find((d) => d.fieldKey === fieldKey)
      return { def, addOnKey }
    }
    return { def: baseByKey.get(fieldname) }
  }

  for (const [fieldname, group] of byField.entries()) {
    const { def } = resolveField(fieldname)
    if (!def) {
      throw new ApiError(HttpStatus.BAD_REQUEST, `Unexpected file field: ${fieldname}`)
    }
    if (group.length > def.maxFiles) {
      throw new ApiError(HttpStatus.BAD_REQUEST, `${def.label}: max ${def.maxFiles} file(s) allowed`)
    }
    for (const file of group) {
      const ext = (file.originalname.split('.').pop() ?? '').toLowerCase()
      if (!def.acceptedTypes.includes(ext)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, `${def.label}: file type .${ext} not accepted`)
      }
      if (file.size > def.maxFileSizeMB * 1024 * 1024) {
        throw new ApiError(HttpStatus.BAD_REQUEST, `${def.label}: file exceeds ${def.maxFileSizeMB} MB`)
      }
    }
  }

  // Required-field check
  const requiredBase = fileUploadFields.filter((f) => f.isRequired)
  for (const r of requiredBase) {
    if (!byField.has(r.fieldKey)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, `${r.label} is required`)
    }
  }
  for (const addOnKey of selectedAddOnKeys) {
    const fields = addOnFileFields.get(addOnKey) ?? []
    for (const r of fields.filter((f) => f.isRequired)) {
      const fieldname = `addon__${addOnKey}__${r.fieldKey}`
      if (!byField.has(fieldname)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, `${r.label} is required`)
      }
    }
  }
}

export async function persistOrderFiles(orderNumber: string, files: Express.Multer.File[]): Promise<IOrderFile[]> {
  if (files.length === 0) return []
  const dir = orderDirAbsolute(orderNumber)
  await fs.mkdir(dir, { recursive: true })

  const out: IOrderFile[] = []
  for (const file of files) {
    const processed = await processBuffer(file)
    const isAddOn = file.fieldname.startsWith('addon__')
    let fieldKey = file.fieldname
    let addOnKey: string | undefined
    if (isAddOn) {
      const parts = file.fieldname.split('__')
      addOnKey = parts[1]
      fieldKey = parts[2]
    }
    const prefix = isAddOn ? `${addOnKey}__${fieldKey}__` : `${fieldKey}__`
    const filename = `${prefix}${processed.storedName}`
    const abs = path.join(dir, filename)
    await fs.writeFile(abs, processed.buffer)
    out.push({
      fieldKey,
      addOnKey,
      originalName: file.originalname,
      storedName: filename,
      mimeType: file.mimetype,
      originalSizeBytes: file.size,
      storedSizeBytes: processed.buffer.byteLength,
      compression: processed.compression,
      path: path.relative(path.resolve(env.UPLOAD_DIR), abs),
      uploadedAt: new Date(),
    })
  }
  return out
}

export function fileReadStream(relPath: string, compression: FileCompression): Readable {
  const abs = path.resolve(env.UPLOAD_DIR, relPath)
  const raw = createReadStream(abs)
  if (compression === 'gzip') return raw.pipe(zlib.createGunzip())
  return raw
}

export async function purgeOrderDir(orderNumber: string): Promise<void> {
  const dir = orderDirAbsolute(orderNumber)
  await fs.rm(dir, { recursive: true, force: true })
}
