import { Request, Response } from 'express'
import { z } from 'zod'
import * as InternalNoteService from '../services/internalNote.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const noteSchema = z.object({
  content: z.string().min(1),
})

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await InternalNoteService.listMyNotes(req.user!._id)
  sendSuccess(res, HttpMessage.OK, notes, HttpStatus.OK)
})

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const input = noteSchema.parse(req.body)
  const note = await InternalNoteService.createNote(req.user!._id, input.content)
  sendSuccess(res, HttpMessage.CREATED, note, HttpStatus.CREATED)
})

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const input = noteSchema.parse(req.body)
  const note = await InternalNoteService.updateNote(req.params.id, req.user!._id, input.content)
  sendSuccess(res, HttpMessage.UPDATED, note, HttpStatus.OK)
})

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  await InternalNoteService.deleteNote(req.params.id, req.user!._id)
  sendSuccess(res, 'Deleted successfully', null, HttpStatus.OK)
})
