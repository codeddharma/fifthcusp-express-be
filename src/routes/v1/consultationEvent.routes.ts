import { Router } from 'express'
import * as ConsultationEventController from '../../controllers/consultationEvent.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.get('/', authenticate, authorize('admin', 'manager', 'employee'), ConsultationEventController.adminListConsultationEvents)
router.delete('/:id', authenticate, authorize('admin', 'manager'), ConsultationEventController.adminDeleteConsultationEvent)

export default router
