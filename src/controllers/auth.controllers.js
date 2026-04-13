import * as authModels from '../models/auth.models.js'

export async function register(req, res) {
    const dataRegistration = req.body
    console.log("dataRegister: ", dataRegistration)

    // Cek apakah format email benar
    if (!dataRegistration.email.includes("@")) {
        res.statusCode = 400
        res.json({
            success: false,
            error: "Format email salah",
        })
        return
    }

    // Cek apakah password dan confirm password sama
    if (dataRegistration.password !== dataRegistration.confirmPassword) {
        res.statusCode = 400
        res.json({
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

    try {
        const result = await authModels.register(dataUser)
        console.log(result)
        
        if (result.code == 200) {
            res.statusCode = 200
            res.json({
                success: true,
                message: "Registrasi berhasil"
            })
        }
    } catch(error) {
        res.statusCode = 409
        res.json({
            success: false,
            error: error.message
        })
    }

}

export async function login(req, res) {
    const dataLogin = req.body

    // cek format email
    if (!dataLogin.email.includes("@")) {
        res.statusCode = 400
        res.json({
            success: false,
            error: "Email tidak valid."
        })
        return
    }

    // Kirim body request untuk dicek di logic models
    const result = await authModels.login(dataLogin)

    // jika result.code respon 404, user tidak ditemukan
    if (result.code == 404) {
        res.statusCode = 401
        res.json({
            success: false,
            error: result.message
        })
        return
    }

    // jika result.code respon 401, password salah
    if (result.code == 401) {
        res.statusCode = 401
        res.json({
            success: false,
            error: result.message
        })
        return
    }

    // Jika berhasil (result.code == 200), kembalikan data + token
    if (result.code == 200) {
        res.statusCode = 200
        res.json({
            success: true,
            message: "Login berhasil.",
            results: result.data
        })
    }
}

export async function generateOTP(req, res) {
    const {email} = req.body

    // cek format email
    if (!email.includes("@")) {
        res.statusCode = 400
        res.json({
            success: false,
            error: "Invalid email format."
        })
        return
    }

    // buat otp
    const OTPGenerated = Math.floor(100000 + Math.random() *900000).toString();
    if (!OTPGenerated) {
        res.statusCode = 500
        res.json({
            success: false,
            error: "an error occurred while generating the OTP code."
        })
        return
    }

    // save otp di database
    try {
        await authModels.saveOTP(email, OTPGenerated)

        console.log(OTPGenerated)
        res.statusCode = 200
        res.json({
            success: true,
            message: "OTP sent successfully (on console)"
        })
    } catch (error) {
        console.error(error.message)

        res.statusCode = 500
        res.json({
            success: false,
            error: error.message
        })
    }

}

export async function verificationOTP(req, res) {
    const {email, otp} = req.body

    try {
        console.log("from body controllers: ", otp)
        const OTPValid = await authModels.verificationOTP(email, parseInt(otp))

        if (OTPValid.ok) {
            res.statusCode = 200
            res.json({
                success: true,
                message: OTPValid.message
            })
        }
    } catch (error) {
        res.statusCode = 401
        res.json({
            success: false,
            error: error.message
        })
    }
    
}

export async function changePassword(req, res) {
    const {email, newPassword} = req.body

    try {
        const passwordChanged = await authModels.changePassword(email, newPassword)

        res.statusCode = 200
        res.json({
            success: true,
            message: passwordChanged.message
        })

    } catch {

        res.statusCode = 500
        res.json({
            success: false,
            error: passwordChanged.message
        })
    }

}
