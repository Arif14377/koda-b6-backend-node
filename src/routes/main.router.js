import { Router } from "express";
import * as mainControllers from '../controllers/main.controllers.js'

const mainRouter = Router()

mainRouter.get('/products', mainControllers.getAllProducts)
// mainRouter.get('/reviews')

export default mainRouter
