import { Router } from 'express'
import * as ServiceController from '../../controllers/service.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', ServiceController.listServices)
router.get('/:id', ServiceController.getService)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin'), ServiceController.createService)
router.put('/:id', authenticate, authorize('admin'), ServiceController.updateService)
router.delete('/:id', authenticate, authorize('admin'), ServiceController.deleteService)

export default router
