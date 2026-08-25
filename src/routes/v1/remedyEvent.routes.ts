import { Router } from 'express'
import * as RemedyEventController from '../../controllers/remedyEvent.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.get('/', authenticate, authorize('admin', 'manager', 'employee'), RemedyEventController.adminListRemedyEvents)
router.post('/', authenticate, authorize('admin', 'manager', 'employee'), RemedyEventController.adminCreateRemedyEvent)
// Employees may edit only their own remedies — enforced in the service, not by authorize().
router.patch('/:id', authenticate, authorize('admin', 'manager', 'employee'), RemedyEventController.adminUpdateRemedyEvent)
router.delete('/:id', authenticate, authorize('admin', 'manager'), RemedyEventController.adminDeleteRemedyEvent)

export default router
