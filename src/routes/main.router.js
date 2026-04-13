import { Router } from "express";
import * as mainControllers from '../controllers/main.controllers.js'

const mainRouter = Router()

mainRouter.get('/products', mainControllers.getAllProducts)
mainRouter.get('/reviews', mainControllers.getReviews)

export default mainRouter
