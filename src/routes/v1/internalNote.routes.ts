import { Router } from 'express'
import * as InternalNoteController from '../../controllers/internalNote.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// Every note is implicitly scoped to req.user — there is no cross-user access,
// so all three roles share the same routes.
router.get('/', authenticate, authorize('admin', 'manager', 'employee'), InternalNoteController.listNotes)
router.post('/', authenticate, authorize('admin', 'manager', 'employee'), InternalNoteController.createNote)
router.patch('/:id', authenticate, authorize('admin', 'manager', 'employee'), InternalNoteController.updateNote)
router.delete('/:id', authenticate, authorize('admin', 'manager', 'employee'), InternalNoteController.deleteNote)

export default router
