import { Router } from 'express'
import * as AvailabilityWindowController from '../../controllers/availabilityWindow.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.get('/', authenticate, authorize('admin', 'manager', 'employee'), AvailabilityWindowController.listWindows)
router.post('/', authenticate, authorize('admin', 'manager', 'employee'), AvailabilityWindowController.createWindow)
router.patch('/:id', authenticate, authorize('admin', 'manager', 'employee'), AvailabilityWindowController.updateWindow)
router.delete('/:id', authenticate, authorize('admin', 'manager', 'employee'), AvailabilityWindowController.deleteWindow)

export default router
