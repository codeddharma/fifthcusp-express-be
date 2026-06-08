import { Router } from 'express'
import * as ConsultationBookingController from '../../controllers/consultationBooking.controller'

const router = Router()

// Public — protected only by booking token
router.get('/:token', ConsultationBookingController.getBookingInfo)
router.get('/:token/slots', ConsultationBookingController.getAvailableSlots)
router.post('/:token/book', ConsultationBookingController.bookSlot)

export default router
