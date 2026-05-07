import { Router } from 'express'
import * as UserController from '../../controllers/user.controller'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'

const router = Router()

router.use(authenticate)

router.post('/', authorize('admin'), UserController.createUser)
router.get('/', authorize('admin', 'manager'), UserController.listUsers)
router.get('/:id', authorize('admin', 'manager'), UserController.getUser)
router.put('/:id', authorize('admin'), UserController.updateUser)
router.delete('/:id', authorize('admin'), UserController.deleteUser)

export default router
