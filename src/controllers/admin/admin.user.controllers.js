import * as adminModels from '../../models/admin/admin.users.models.js'
import { constants } from 'node:http2'
import { sendSuccess, sendServerError } from '../../lib/errorHandler.js'

export async function getAllUsers(req, res) {
    try {
        const users = await adminModels.getAllUsers()
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Successfully to get all users data", users)
    } catch (error) {
        return sendServerError(res, error)
    }
}