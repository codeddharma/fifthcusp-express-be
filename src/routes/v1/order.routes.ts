import { Router } from 'express'
import * as OrderController from '../../controllers/order.controller'
import { uploadAny } from '../../middleware/uploadMulter'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public (customer-facing) ─────────────────────────────────────────────────
router.post('/', uploadAny, OrderController.createOrder)
router.post('/:orderNumber/verify', OrderController.verifyPayment)
router.get('/:orderNumber/status', OrderController.getOrderStatus)

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/list', authenticate, authorize('admin'), OrderController.adminListOrders)
router.post('/admin/purge-files', authenticate, authorize('admin'), OrderController.adminPurgeOrderFiles)
router.get('/admin/:id', authenticate, authorize('admin'), OrderController.adminGetOrder)
router.patch('/admin/:id/status', authenticate, authorize('admin'), OrderController.adminUpdateOrderStatus)
router.get('/admin/:id/files/:fieldKey', authenticate, authorize('admin'), OrderController.adminDownloadOrderFile)

export default router
