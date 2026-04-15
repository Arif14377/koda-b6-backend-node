import { Router } from 'express'
import * as userController from '../controllers/user.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import upload, { uploadErrorHandler } from '../config/multer.config.js'

const userRouter = Router()

// Protected routes - require authentication
userRouter.get('/profile', authMiddleware, userController.getProfile)
userRouter.patch('/profile', authMiddleware, userController.updateProfile)
userRouter.post('/profile/picture', authMiddleware, upload.single('picture'), uploadErrorHandler, userController.uploadProfilePicture)

export default userRouter
