import { Router } from 'express'
import * as JobOpeningController from '../../controllers/jobOpening.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', JobOpeningController.listJobOpenings)
router.get('/:id', JobOpeningController.getJobOpening)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin'), JobOpeningController.createJobOpening)
router.put('/:id', authenticate, authorize('admin'), JobOpeningController.updateJobOpening)
router.patch('/:id/close', authenticate, authorize('admin'), JobOpeningController.closeJobOpening)
router.delete('/:id', authenticate, authorize('admin'), JobOpeningController.deleteJobOpening)

export default router
