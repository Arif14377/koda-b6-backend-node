import * as db from '../../../db/index.js'

export async function getAllUsers() {
    const text = `SELECT id, full_name, email, role_id, address, phone, picture, created_at FROM users`

    try {
        const res = await db.query(text)
        const users = res.rows
        return users
    } catch (error) {
        throw new Error("Failed to get users data: ", error.message)
    }
}