import { Router, Request, Response } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import pageContentRoutes from './pageContent.routes'
import serviceRoutes from './service.routes'
import faqRoutes from './faq.routes'
import testimonialRoutes from './testimonial.routes'
import jobOpeningRoutes from './jobOpening.routes'
import blogRoutes from './blog.routes'

const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'OK', data: null })
})

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/content', pageContentRoutes)
router.use('/services', serviceRoutes)
router.use('/faqs', faqRoutes)
router.use('/testimonials', testimonialRoutes)
router.use('/careers', jobOpeningRoutes)
router.use('/blogs', blogRoutes)

export default router
