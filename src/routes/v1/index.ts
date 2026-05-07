import { Router, Request, Response } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import pageContentRoutes from './pageContent.routes'
import serviceRoutes from './service.routes'
import faqRoutes from './faq.routes'

const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'OK', data: null })
})

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/content', pageContentRoutes)
router.use('/services', serviceRoutes)
router.use('/faqs', faqRoutes)

export default router
