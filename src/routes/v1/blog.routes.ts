import { Router } from 'express'
import * as BlogController from '../../controllers/blog.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', BlogController.listBlogs)
router.get('/slug/:slug', BlogController.getBlogBySlug)
router.get('/:id', BlogController.getBlog)

// ─── Admin — auth + role guard ────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin'), BlogController.createBlog)
router.put('/:id', authenticate, authorize('admin'), BlogController.updateBlog)
router.patch('/:id/publish', authenticate, authorize('admin'), BlogController.publishBlog)
router.patch('/:id/unpublish', authenticate, authorize('admin'), BlogController.unpublishBlog)
router.delete('/:id', authenticate, authorize('admin'), BlogController.deleteBlog)

export default router
