import { Router } from 'express'
import * as CustomerController from '../../controllers/customer.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.get('/', authenticate, authorize('admin'), CustomerController.listCustomers)
router.get('/:id', authenticate, authorize('admin'), CustomerController.getCustomer)
router.patch('/:id', authenticate, authorize('admin'), CustomerController.updateCustomer)

export default router
