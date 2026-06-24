import { Router } from 'express'
import * as CalendarEventController from '../../controllers/calendarEvent.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', CalendarEventController.getManifestationCalendar)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.get('/manage', authenticate, authorize('admin', 'manager'), CalendarEventController.listCalendarEvents)
router.get('/manage/:id', authenticate, authorize('admin', 'manager'), CalendarEventController.getCalendarEvent)
router.post('/', authenticate, authorize('admin', 'manager'), CalendarEventController.createCalendarEvent)
router.put('/:id', authenticate, authorize('admin', 'manager'), CalendarEventController.updateCalendarEvent)
router.delete('/:id', authenticate, authorize('admin', 'manager'), CalendarEventController.deleteCalendarEvent)

export default router
