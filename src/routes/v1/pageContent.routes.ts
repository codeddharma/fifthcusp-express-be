import { Router } from 'express'
import * as PageContentController from '../../controllers/pageContent.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public — no auth required ────────────────────────────────────────────────
router.get('/:page', PageContentController.getPublishedPage)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.use(authenticate)

// Page-level CRUD
router.get('/', authorize('admin', 'manager'), PageContentController.listPages)
router.post('/', authorize('admin', 'manager'), PageContentController.createPage)
router.get('/admin/:page', authorize('admin', 'manager'), PageContentController.getPage)
router.put('/admin/:page', authorize('admin', 'manager'), PageContentController.updatePageMeta)
router.delete('/admin/:page', authorize('admin'), PageContentController.deletePage)

// Section-level CRUD
router.put('/admin/:page/sections/:key', authorize('admin', 'manager'), PageContentController.upsertSection)
router.delete(
  '/admin/:page/sections/:key',
  authorize('admin', 'manager'),
  PageContentController.deleteSection,
)
router.patch(
  '/admin/:page/sections/reorder',
  authorize('admin', 'manager'),
  PageContentController.reorderSections,
)

export default router
