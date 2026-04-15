import * as userModels from '../models/user.models.js'
import { constants } from "node:http2"
import { sendSuccess, sendBadRequest, sendServerError } from '../lib/errorHandler.js'

export async function updateProfile(req, res) {
    const userId = req.userId
    const { fullName, phone, address } = req.body

    // Validation
    if (!fullName && !phone && !address) {
        return sendBadRequest(res, "At least one field is required to update (fullName, phone, address).")
    }

    try {
        const updatedProfile = await userModels.updateProfile(userId, {
            fullName,
            phone,
            address
        })

        return sendSuccess(res, constants.HTTP_STATUS_OK, "Profile updated successfully.", updatedProfile)
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function uploadProfilePicture(req, res) {
    const userId = req.userId

    try {
        if (!req.file) {
            return sendBadRequest(res, "No file uploaded. Make sure to send file with field name 'picture' and Content-Type 'multipart/form-data'")
        }

        // Get the file path relative to the public folder
        const picturePath = `/uploads/profile-pictures/${req.file.filename}`

        // Update profile picture in database
        const updatedProfile = await userModels.uploadProfilePicture(userId, picturePath)

        return sendSuccess(res, constants.HTTP_STATUS_OK, "Profile picture uploaded successfully.", updatedProfile)
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function getProfile(req, res) {
    const userId = req.userId

    try {
        const profile = await userModels.getProfile(userId)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Profile fetched successfully.", profile)
    } catch (error) {
        return sendServerError(res, error)
    }
}
