import { Router } from 'express'
import * as RemedyEventController from '../../controllers/remedyEvent.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.get('/', authenticate, authorize('admin', 'manager', 'employee'), RemedyEventController.adminListRemedyEvents)
router.post('/', authenticate, authorize('admin', 'manager', 'employee'), RemedyEventController.adminCreateRemedyEvent)
router.delete('/:id', authenticate, authorize('admin', 'manager'), RemedyEventController.adminDeleteRemedyEvent)

export default router
