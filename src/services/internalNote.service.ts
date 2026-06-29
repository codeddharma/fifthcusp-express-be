import { Types } from 'mongoose'
import { InternalNote, IInternalNote } from '../models/InternalNote'
import { ApiError } from '../utils/ApiError'

export async function listMyNotes(userId: Types.ObjectId): Promise<IInternalNote[]> {
  return InternalNote.find({ userId }).sort({ updatedAt: -1 })
}

export async function createNote(userId: Types.ObjectId, content: string): Promise<IInternalNote> {
  return InternalNote.create({ userId, content })
}

export async function updateNote(id: string, userId: Types.ObjectId, content: string): Promise<IInternalNote> {
  const note = await InternalNote.findOne({ _id: id, userId })
  if (!note) throw new ApiError(404, 'Note not found')
  note.content = content
  return note.save()
}

export async function deleteNote(id: string, userId: Types.ObjectId): Promise<void> {
  const result = await InternalNote.findOneAndDelete({ _id: id, userId })
  if (!result) throw new ApiError(404, 'Note not found')
}
