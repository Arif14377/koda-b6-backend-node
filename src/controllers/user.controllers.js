import * as userModels from '../models/user.models.js'
import { constants } from "node:http2"

export async function updateProfile(req, res) {
    const userId = req.userId
    const { fullName, phone, address } = req.body

    // Validation
    if (!fullName && !phone && !address) {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
        res.json({
            success: false,
            error: "At least one field is required to update (fullName, phone, address)."
        })
        return
    }

    try {
        const updatedProfile = await userModels.updateProfile(userId, {
            fullName,
            phone,
            address
        })

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Profile updated successfully.",
            results: updatedProfile
        })
    } catch (error) {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: error.message
        })
    }
}

export async function uploadProfilePicture(req, res) {
    const userId = req.userId

    try {
        if (!req.file) {
            res.status(constants.HTTP_STATUS_BAD_REQUEST)
            res.json({
                success: false,
                error: "No file uploaded. Make sure to send file with field name 'picture' and Content-Type 'multipart/form-data'"
            })
            return
        }

        // Get the file path relative to the public folder
        const picturePath = `/uploads/profile-pictures/${req.file.filename}`

        // Update profile picture in database
        const updatedProfile = await userModels.uploadProfilePicture(userId, picturePath)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Profile picture uploaded successfully.",
            results: updatedProfile
        })
    } catch (error) {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: error.message
        })
    }
}

export async function getProfile(req, res) {
    const userId = req.userId

    try {
        const profile = await userModels.getProfile(userId)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Profile fetched successfully.",
            results: profile
        })
    } catch (error) {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: error.message
        })
    }
}
