import { Router } from 'express'
import * as ConsultationEventController from '../../controllers/consultationEvent.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.get('/', authenticate, authorize('admin', 'manager', 'employee'), ConsultationEventController.adminListConsultationEvents)
router.patch('/:id/reschedule', authenticate, authorize('admin', 'manager'), ConsultationEventController.adminRescheduleConsultationEvent)
router.delete('/:id', authenticate, authorize('admin', 'manager'), ConsultationEventController.adminDeleteConsultationEvent)

export default router
