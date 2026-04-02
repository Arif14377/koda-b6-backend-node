import * as db from '../../db/index.js'
import * as hash from '../lib/hash.js'
import crypto from "crypto"
import jwt from 'jsonwebtoken'

export async function register(dataUser) {
    // cek db apakah email sudah terdaftar
    const textQuery1 = `
        SELECT email FROM users WHERE email = $1
    `

    const res = await db.query(textQuery1, [dataUser.email] )
    console.log(res)

    // Jika sudah terdaftar, throw error
    if (res.rowCount == 1) {
        throw new Error("Email sudah terdaftar.")
    }

    // Jika belum terdaftar, hash password
    const hashPassword = await hash.generateHash(dataUser.password)
    console.log("hashPassword: ", hashPassword)

    // simpan data user ke db
    const textQuery2 = `
        INSERT INTO users(id, full_name, email, password)
        VALUES($1, $2, $3, $4)
    `
    const userId = crypto.randomUUID()
    await db.query(textQuery2, [userId, dataUser.fullName, dataUser.email, hashPassword])
    
    const results = {
        message: "Registrasi berhasil",
        code: 200
    }
    
    return results
}

export async function login(dataLogin) {
    // cari email apakah terdaftar, jika tidak -> return 401 unauthorized
    const text = `
        SELECT
        id,
        full_name,
        email,
        password,
        address,
        phone,
        picture,
        role_id
        FROM users
        WHERE email = $1
    `
    const result = await db.query(text, [dataLogin.email])
    if (result.rowCount !== 1) {
        return {
            message: "Invalid email or password1",
            code: 401
        }
    }
    
    // cek password, jika salah -> return 401 unauthorized

    const data = result.rows[0]

    const isPasswordTrue = await hash.verifyHash(data.password, dataLogin.password)

    if (!isPasswordTrue) {
        return {
            message: "Invalid email or password2",
            code: 401
        }
    }

    // jika benar -> return 200 + data
    if (isPasswordTrue) {
        // create jwt
        const token = jwt.sign({userId: data.id}, process.env.JWT_SECRET, {expiresIn: '1h'})

        return {
            message: "Successfully loged in.",
            code: 200,
            data: {...data, token}
        }
    }
}

export async function generateOTP(email) {
    const OTPGenerated = Math.floor(100000 + Math.random() *900000).toString();
    if (!OTPGenerated) {
        return {
            success: false,
            message: "an error occurred while generating the OTP code."
        }
    }
    
    let isOTPSaved;
    if (OTPGenerated) {
        const text1 = `
            SELECT email from forgot_password WHERE email = $1
        `
        const isEmailExist = await db.query(text1, [email])

        if (isEmailExist.rowCount) {
            const text2 = `
                UPDATE forgot_password SET code = $1 WHERE email = $2
            `
            isOTPSaved = await db.query(text2, [OTPGenerated, email])
            
        } else {
            const text2 = `
                INSERT INTO forgot_password(email, code) VALUES($1, $2)
            `
            isOTPSaved = await db.query(text2, [email, OTPGenerated])

        }
    }

    if (!isOTPSaved) {
        return {
            success: false,
            message: "an error occurred while generating the OTP code"
        }
    }

    console.log(OTPGenerated)
    
    return {
        success: true,
        message: "OTP code successfully sent to email."
    }
}

export async function verificationOTP(email, otp) {
    const text = `
        SELECT email, code FROM forgot_password WHERE email = $1
    `
    const forgotUser = await db.query(text, [email])

    if (forgotUser.rowCount == 0) {
        return {
            ok: false,
            message: "OTP is not valid"
        }
    }

    if (forgotUser.rows[0].code !== otp) {
        return {
            ok: false,
            message: "OTP is not valid."
        }
    }

    return {
        ok: true,
        message: "OTP successfully verified."
    }
}