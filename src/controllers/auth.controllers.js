import * as authModels from '../models/auth.models.js'
import {constants} from "node:http2"

export async function register(req, res) {
    const dataRegistration = req.body

    // Cek apakah format email benar
    if (!dataRegistration.email.includes("@")) {
        res
            .status(constants.HTTP_STATUS_BAD_REQUEST)
            .json({
                success: false,
                error: "Format email salah",
            })

        return
    }

    // Cek apakah password dan confirm password sama
    if (dataRegistration.password !== dataRegistration.confirmPassword) {
        res
            .status(constants.HTTP_STATUS_BAD_REQUEST)
            .json({
                success: false,
                error: "Password tidak sama."
            })

        return
    }

    // Kalau oke, panggil models untuk simpan data
    const dataUser = {
        fullName: dataRegistration.fullName,
        email: dataRegistration.email,
        password: dataRegistration.password
    }

    const result = await authModels.register(dataUser)

    if (result.code == 200) {
        res
            .status(constants.HTTP_STATUS_OK)
            .json({
                success: true,
                message: "Registrasi berhasil"
            })
    }
}