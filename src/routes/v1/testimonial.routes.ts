import { Router } from 'express'
import * as TestimonialController from '../../controllers/testimonial.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', TestimonialController.listTestimonials)
router.get('/service/:serviceName', TestimonialController.listApprovedByService)
router.get('/:id', TestimonialController.getTestimonial)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin'), TestimonialController.createTestimonial)
router.put('/:id', authenticate, authorize('admin'), TestimonialController.updateTestimonial)
router.patch('/:id/approve', authenticate, authorize('admin'), TestimonialController.approveTestimonial)
router.patch('/:id/reject', authenticate, authorize('admin'), TestimonialController.rejectTestimonial)
router.delete('/:id', authenticate, authorize('admin'), TestimonialController.deleteTestimonial)

export default router
