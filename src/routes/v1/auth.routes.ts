import { Router } from 'express'
import * as AuthController from '../../controllers/auth.controller'
import { authenticate } from '../../middleware/authenticate'
import { authRateLimiter } from '../../middleware/rateLimiter'

const router = Router()

router.post('/login', authRateLimiter, AuthController.login)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)
router.get('/me', authenticate, AuthController.me)
router.put('/change-password', authenticate, AuthController.changePassword)

export default router
