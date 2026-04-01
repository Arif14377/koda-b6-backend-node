import { Router } from 'express'
import * as authController from '../controllers/auth.controllers.js'

const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/forgot-password', authController.generateOTP)
authRouter.post('/forgot-password/verifikasi-otp', authController.verifikasiOTP)
authRouter.post('/forgot-password/changePassword', authController.changePassword)

export default authRouter