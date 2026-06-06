import { Router } from 'express'
import * as PaymentLinkController from '../../controllers/paymentLink.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// Public: frontend payment page routes
router.get('/public/:token', PaymentLinkController.getPublicLink)
router.post('/public/:token/pay', PaymentLinkController.initCheckout)
router.post('/public/:token/verify', PaymentLinkController.verifyPayment)

// Admin routes
router.get('/', authenticate, authorize('admin'), PaymentLinkController.listPaymentLinks)
router.post('/', authenticate, authorize('admin'), PaymentLinkController.createPaymentLink)
router.get('/:id', authenticate, authorize('admin'), PaymentLinkController.getPaymentLink)
router.patch('/:id/cancel', authenticate, authorize('admin'), PaymentLinkController.cancelPaymentLink)

export default router
