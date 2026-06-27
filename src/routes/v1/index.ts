import { Router, Request, Response } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import pageContentRoutes from './pageContent.routes'
import serviceRoutes from './service.routes'
import faqRoutes from './faq.routes'
import testimonialRoutes from './testimonial.routes'
import jobOpeningRoutes from './jobOpening.routes'
import blogRoutes from './blog.routes'
import orderRoutes from './order.routes'
import customerRoutes from './customer.routes'
import pageMetaRoutes from './pageMeta.routes'
import couponRoutes from './coupon.routes'
import paymentLinkRoutes from './paymentLink.routes'
import recurringOrderRoutes from './recurringOrder.routes'
import availabilityWindowRoutes from './availabilityWindow.routes'
import consultationBookingRoutes from './consultationBooking.routes'
import consultationEventRoutes from './consultationEvent.routes'
import remedyEventRoutes from './remedyEvent.routes'
import manifestationCalendarRoutes from './manifestationCalendar.routes'
import disclaimerBannerRoutes from './disclaimerBanner.routes'

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
router.use('/orders', orderRoutes)
router.use('/customers', customerRoutes)
router.use('/page-meta', pageMetaRoutes)
router.use('/coupons', couponRoutes)
router.use('/payment-links', paymentLinkRoutes)
router.use('/recurring-orders', recurringOrderRoutes)
router.use('/availability-windows', availabilityWindowRoutes)
router.use('/consultation-booking', consultationBookingRoutes)
router.use('/consultation-events', consultationEventRoutes)
router.use('/remedy-events', remedyEventRoutes)
router.use('/manifestation-calendar', manifestationCalendarRoutes)
router.use('/disclaimer-banner', disclaimerBannerRoutes)

export default router
