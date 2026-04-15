import * as adminModels from '../../models/admin/admin.users.models.js'
import { constants } from 'node:http2'

export async function getAllUsers(req, res) {
    try {
        const users = await adminModels.getAllUsers()
        console.log("users: ", users)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Successfully to get all users data",
            results: users
        })
    } catch (error) {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            message: error.message
        })
    }

}