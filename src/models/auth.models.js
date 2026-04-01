import * as db from '../../db/index.js'
import * as hash from '../lib/hash.js'
import crypto from "crypto"

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