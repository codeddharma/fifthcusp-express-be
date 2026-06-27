import { Router } from 'express'
import * as DisclaimerBannerController from '../../controllers/disclaimerBanner.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', DisclaimerBannerController.getDisclaimerBanner)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.put('/', authenticate, authorize('admin', 'manager'), DisclaimerBannerController.updateDisclaimerBanner)

export default router
