import { Router } from "express";
import * as mainControllers from '../controllers/main.controllers.js'

const mainRouter = Router()

mainRouter.get('/products', mainControllers.getAllProducts)
mainRouter.get('/reviews', mainControllers.getReviews)
mainRouter.get('/products/:id', mainControllers.getProductById)

export default mainRouter
