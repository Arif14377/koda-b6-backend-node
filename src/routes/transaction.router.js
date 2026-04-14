import { Router } from 'express'
import * as transactionControllers from '../controllers/transaction.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const transactionRouter = Router()

// transactionRouter.get('/delivery-methods', transactionControllers.getDeliveryMethods)

transactionRouter.use(authMiddleware)

transactionRouter.get('/', transactionControllers.getHistory)
// transactionRouter.get('/:id', transactionControllers.getDetail)
// transactionRouter.post('/', transactionControllers.checkout)

export default transactionRouter
