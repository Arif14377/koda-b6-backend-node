import * as authModels from '../models/auth.models.js'
import { constants } from "node:http2"
import { sendSuccess, sendBadRequest, sendUnauthorized, sendConflict, sendServerError } from '../lib/errorHandler.js'

export async function register(req, res) {
    const dataRegistration = req.body

    // Cek apakah format email benar
    if (!dataRegistration.email.includes("@")) {
        return sendBadRequest(res, "Format email salah")
    }

    // Cek apakah password dan confirm password sama
    if (dataRegistration.password !== dataRegistration.confirmPassword) {
        return sendBadRequest(res, "Password tidak sama.")
    }

    // Kalau oke, panggil models untuk simpan data
    const dataUser = {
        fullName: dataRegistration.fullName,
        email: dataRegistration.email,
        password: dataRegistration.password
    }

    try {
        const result = await authModels.register(dataUser)
        
        if (result.code == 201) {
            return sendSuccess(res, constants.HTTP_STATUS_CREATED, "Registrasi berhasil")
        }
    } catch(error) {
        return sendConflict(res, error.message)
    }
}

export async function login(req, res) {
    const dataLogin = req.body

    // cek format email
    if (!dataLogin.email.includes("@")) {
        return sendBadRequest(res, "Email tidak valid.")
    }

    // Kirim body request untuk dicek di logic models
    const result = await authModels.login(dataLogin)

    // jika result.code respon 404, user tidak ditemukan
    if (result.code == 404) {
        return sendUnauthorized(res, result.message)
    }

    // jika result.code respon 401, password salah
    if (result.code == 401) {
        return sendUnauthorized(res, result.message)
    }

    // Jika berhasil (result.code == 200), kembalikan data + token
    if (result.code == 200) {
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Login berhasil.", result.data)
    }
}

export async function generateOTP(req, res) {
    const {email} = req.body

    // cek format email
    if (!email.includes("@")) {
        return sendBadRequest(res, "Invalid email format.")
    }

    // buat otp
    const OTPGenerated = Math.floor(100000 + Math.random() * 900000).toString();
    if (!OTPGenerated) {
        return sendServerError(res, new Error("an error occurred while generating the OTP code."))
    }

    // save otp di database
    try {
        await authModels.saveOTP(email, OTPGenerated)
        console.log(OTPGenerated)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "OTP sent successfully (on console)")
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function verificationOTP(req, res) {
    const {email, otp} = req.body

    try {
        const OTPValid = await authModels.verificationOTP(email, parseInt(otp))

        if (OTPValid.ok) {
            return sendSuccess(res, constants.HTTP_STATUS_OK, OTPValid.message)
        }
    } catch (error) {
        return sendUnauthorized(res, error.message)
    }
}

export async function changePassword(req, res) {
    const {email, newPassword} = req.body

    try {
        const passwordChanged = await authModels.changePassword(email, newPassword)
        return sendSuccess(res, constants.HTTP_STATUS_CREATED, passwordChanged.message)
    } catch (error) {
        return sendServerError(res, error)
    }
}
