import { Router } from 'express'
import * as OrderController from '../../controllers/order.controller'
import { uploadAny, uploadSingle } from '../../middleware/uploadMulter'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public (customer-facing) ─────────────────────────────────────────────────
router.post('/', uploadAny, OrderController.createOrder)
router.post('/:orderNumber/verify', OrderController.verifyPayment)
router.post('/:orderNumber/payment-abandoned', OrderController.markPaymentAbandoned)
router.get('/:orderNumber/status', OrderController.getOrderStatus)
router.post('/feedback', OrderController.submitFeedback)

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/list', authenticate, authorize('admin'), OrderController.adminListOrders)
router.get('/admin/deadlines', authenticate, authorize('admin'), OrderController.adminGetDeadlines)
router.post('/admin/purge-files', authenticate, authorize('admin'), OrderController.adminPurgeOrderFiles)
router.post('/admin/bulk-feedback-email', authenticate, authorize('admin'), OrderController.adminBulkFeedbackEmail)
router.get('/admin/:id', authenticate, authorize('admin'), OrderController.adminGetOrder)
router.patch('/admin/:id/status', authenticate, authorize('admin'), OrderController.adminUpdateOrderStatus)
router.get('/admin/:id/files/:fieldKey', authenticate, authorize('admin'), OrderController.adminDownloadOrderFile)
router.post('/admin/:id/output-files', authenticate, authorize('admin'), uploadSingle, OrderController.adminUploadOutputFile)
router.post('/admin/:id/send-completion-email', authenticate, authorize('admin'), OrderController.adminSendCompletionEmail)

export default router
