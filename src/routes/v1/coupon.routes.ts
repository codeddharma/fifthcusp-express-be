import { Router } from 'express'
import * as CouponController from '../../controllers/coupon.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

// Public: validate a coupon before checkout
router.post('/validate', CouponController.validateCoupon)

// Admin: manage coupons
router.get('/', authenticate, authorize('admin'), CouponController.listCoupons)
router.post('/', authenticate, authorize('admin'), CouponController.createCoupon)
router.patch('/:id', authenticate, authorize('admin'), CouponController.updateCoupon)
router.delete('/:id', authenticate, authorize('admin'), CouponController.deleteCoupon)

export default router
