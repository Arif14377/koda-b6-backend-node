import { Router } from 'express'
import * as authController from '../controllers/auth.controllers.js'

const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/forgot-password', authController.generateOTP)
authRouter.post('/forgot-password/verification-otp', authController.verificationOTP)
authRouter.patch('/forgot-password/change-password', authController.changePassword)

export default authRouter