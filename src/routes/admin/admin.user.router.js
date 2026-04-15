import { Router } from "express";
import * as adminUserController from '../../controllers/admin/admin.user.controllers.js'
import { roleAccess } from "../../middleware/auth.middleware.js";

const adminUserRouter = Router()

adminUserRouter.get('/users', roleAccess([1]), adminUserController.getAllUsers)

export default adminUserRouter