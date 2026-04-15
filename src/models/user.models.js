import * as db from '../../db/index.js'

export async function updateProfile(userId, data) {
    try {
        // Build dynamic UPDATE query based on provided fields
        const fields = []
        const values = []
        let paramIndex = 1

        if (data.fullName) {
            fields.push(`full_name = $${paramIndex}`)
            values.push(data.fullName)
            paramIndex++
        }
        
        if (data.phone) {
            fields.push(`phone = $${paramIndex}`)
            values.push(data.phone)
            paramIndex++
        }
        
        if (data.address) {
            fields.push(`address = $${paramIndex}`)
            values.push(data.address)
            paramIndex++
        }

        if (fields.length === 0) {
            throw new Error("No fields to update.")
        }

        // Add user ID as the last parameter
        values.push(userId)
        const userIdParamIndex = paramIndex

        const updateQuery = `
            UPDATE users 
            SET ${fields.join(', ')}
            WHERE id = $${userIdParamIndex}
            RETURNING id, full_name, email, phone, address, picture, role_id
        `

        const result = await db.query(updateQuery, values)

        if (result.rowCount === 0) {
            throw new Error("User not found.")
        }

        const userData = result.rows[0]
        return {
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            picture: userData.picture,
            roleId: userData.role_id
        }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export async function uploadProfilePicture(userId, picturePath) {
    try {
        const text = `
            UPDATE users 
            SET picture = $1 
            WHERE id = $2
            RETURNING id, full_name, email, phone, address, picture, role_id
        `

        const result = await db.query(text, [picturePath, userId])

        if (result.rowCount === 0) {
            throw new Error("User not found.")
        }

        const userData = result.rows[0]
        return {
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            picture: userData.picture,
            roleId: userData.role_id
        }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export async function getProfile(userId) {
    try {
        const text = `
            SELECT 
                id, 
                full_name, 
                email, 
                phone, 
                address, 
                picture, 
                role_id,
                created_at
            FROM users
            WHERE id = $1
        `

        const result = await db.query(text, [userId])

        if (result.rowCount === 0) {
            throw new Error("User not found.")
        }

        const userData = result.rows[0]
        return {
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            picture: userData.picture,
            roleId: userData.role_id,
            createdAt: userData.created_at
        }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}
