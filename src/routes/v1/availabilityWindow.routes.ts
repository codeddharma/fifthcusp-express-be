import { Router } from 'express'
import * as AvailabilityWindowController from '../../controllers/availabilityWindow.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.get('/', authenticate, authorize('admin', 'manager'), AvailabilityWindowController.listWindows)
router.post('/', authenticate, authorize('admin', 'manager'), AvailabilityWindowController.createWindow)
router.patch('/:id', authenticate, authorize('admin', 'manager'), AvailabilityWindowController.updateWindow)
router.delete('/:id', authenticate, authorize('admin', 'manager'), AvailabilityWindowController.deleteWindow)

export default router
