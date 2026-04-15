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
    // console.log(res)

    // Jika sudah terdaftar, throw error
    if (res.rowCount == 1) {
        throw new Error("Email sudah terdaftar.")
    }

    // Jika belum terdaftar, hash password
    const hashPassword = await hash.generateHash(dataUser.password)
    // console.log("hashPassword: ", hashPassword)

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
    // console.log(data)
    const dataResponse = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
    }

    const isPasswordTrue = await hash.verifyHash(data.password, dataLogin.password)

    if (!isPasswordTrue) {
        return {
            message: "Invalid email or password2",
            code: 401
        }
    }

    // jika benar -> re        // const dataResponse = turn 200 + data
    if (isPasswordTrue) {
        // create jwt
        const token = jwt.sign({userId: data.id}, process.env.JWT_SECRET, {expiresIn: '1h'})

        return {
            message: "Successfully loged in.",
            code: 200,
            data: {...dataResponse, token}
        }
    }
}

export async function saveOTP(email, otp) {
    const text1 = `
        SELECT email from forgot_password WHERE email = $1
    `
    const emailExists = await db.query(text1, [email])
    // console.log(emailExists)

    if (emailExists.rowCount == 0) {
        try{
            const text = `INSERT INTO forgot_password(email, code) VALUES($1, $2)` 
            await db.query(text, [email, otp])
            return
        } catch (error) {
            throw new Error("Failed to save forgot_password", error.message)
        }
    }

    if (emailExists.rowCount != 0) {
        try{
            const text = `UPDATE forgot_password SET code = $1 WHERE email = $2`
            await db.query(text, [otp, email])
        } catch (error) {
            throw new Error("Failed to save forgot_password", error.message)
        }
    }
}

export async function verificationOTP(email, otp) {
    const text = `
        SELECT email, code FROM forgot_password WHERE email = $1
    `

    // coba cari email dan code otp
    try {
        const forgotUser = await db.query(text, [email])
        if (forgotUser.rowCount == 0) {
            throw new Error("Email not found.")
        }

        // jika otp tidak sesuai
        // console.log("from table: ", forgotUser.rows[0].code)
        // console.log("from body: ", otp)
        if (forgotUser.rows[0].code !== otp) {
            throw new Error("Invalid OTP code.")
        }

        // jika otp sesuai
        if (forgotUser.rows[0].code === otp) {
            return {
                ok: true,
                message: "OTP successfully verified."
            }
        }

    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export async function changePassword(email, newPassword) {
    try{
        // console.log("tipe new password: ", typeof(newPassword))
        const hashPassword = await hash.generateHash(newPassword)

        const text = `
            UPDATE users SET password = $1 WHERE email = $2
        `
        await db.query(text, [hashPassword, email])

        return {
            ok: true,
            message: "Successfully changed password"
        }

    } catch(error) {
        console.error(error.message)
    }
}