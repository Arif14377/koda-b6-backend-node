import { Router } from "express";
import * as cartControllers from '../controllers/cart.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const cartRouter = Router()

cartRouter.use(authMiddleware)

cartRouter.get('/', cartControllers.getCart)
cartRouter.post('/', cartControllers.addToCart)

export default cartRouter