import * as db from '../../db/index.js'
import * as hash from '../lib/hash.js'

export async function register(bodyRequest) {
    // cek db apakah email sudah terdaftar
    const textQuery1 = `
        SELECT email FROM users WHERE email = $1
    `

    const res = await db.query(textQuery1, bodyRequest.email )

    // Jika sudah terdaftar, throw error
    if (res.rowCount == 0) {
        throw new Error("Email sudah terdaftar.")
    }

    // Jika belum terdaftar, hash password
    const hashPassword = hash.generateHash(bodyRequest.password)

    // simpan data user ke db
    const textQuery2 = `
        INSERT INTO users(full_name, email, password)
        VALUES('$1', '$2', '$3')
    `

    await db.query(textQuery2, bodyRequest.fullName, bodyRequest.email, bodyRequest.password)
    
    const results = {
        message: "Registrasi berhasil",
        code: 200
    }
    
    return results
}