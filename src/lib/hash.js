import argon2 from 'argon2'

export async function generateHash(password) {
    try{
        const hash = await argon2.hash(password)
        return hash
    } catch(error) {
        console.error(`Kesalahan saat generate hash password: ${error.message}`)
        return error.message
    }
}

export async function verifyHash(hash, password) {
    try{
        if (await argon2.verify(hash, password)){
            return true
        }
    }catch(error) {
        console.error(`Kesalahan saat memverifikasi password dengan hash password: ${error.message}`)
        return false
    }
}