import { Router } from 'express'
import * as RecurringOrderController from '../../controllers/recurringOrder.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// Admin routes
router.get('/', authenticate, authorize('admin'), RecurringOrderController.listRecurringOrders)
router.post('/', authenticate, authorize('admin'), RecurringOrderController.createRecurringOrder)
router.get('/:id', authenticate, authorize('admin'), RecurringOrderController.getRecurringOrder)
router.patch('/:id/status', authenticate, authorize('admin'), RecurringOrderController.updateRecurringOrderStatus)

export default router
