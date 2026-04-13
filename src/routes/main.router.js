import { Router } from "express";

const mainRouter = Router()

mainRouter.get('/recommended-product')
mainRouter.get('/reviews')

export default mainRouter