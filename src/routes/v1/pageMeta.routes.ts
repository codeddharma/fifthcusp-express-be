import { Router } from 'express'
import * as PageMetaController from '../../controllers/pageMeta.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// Public: fetch meta for a single page
router.get('/public', PageMetaController.getByPath)

// Admin: full CRUD
router.get('/', authenticate, authorize('admin'), PageMetaController.listPageMeta)
router.post('/', authenticate, authorize('admin'), PageMetaController.createPageMeta)
router.put('/:id', authenticate, authorize('admin'), PageMetaController.updatePageMeta)
router.delete('/:id', authenticate, authorize('admin'), PageMetaController.deletePageMeta)

export default router
