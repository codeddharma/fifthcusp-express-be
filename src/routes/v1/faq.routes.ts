import { Router } from 'express'
import * as FaqController from '../../controllers/faq.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', FaqController.listFaqs)
router.get('/page/:page', FaqController.getFaqByPage)
router.get('/:id', FaqController.getFaq)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin'), FaqController.createFaq)
router.put('/:id', authenticate, authorize('admin'), FaqController.updateFaq)
router.delete('/:id', authenticate, authorize('admin'), FaqController.deleteFaq)

export default router
