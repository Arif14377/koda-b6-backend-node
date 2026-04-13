import * as db from '../../db/index.js'

export async function getCartByUserId(userId) {
    const text = `
        SELECT
            c.id,
            c.product_id,
            p.name,
            c.quantity,
            p.price,
            COALESCE((SELECT path FROM product_images WHERE product_id = p.id LIMIT 1), '') as image,
            ps.name as size,
            pv.name as variant,
            c.size_id,
            c.variant_id,
            (p.price * c.quantity) as total
        FROM cart c
        JOIN products p ON c.product_id = p.id
        LEFT JOIN product_size ps ON c.size_id = ps.id
        LEFT JOIN product_variant pv ON c.variant_id = pv.id
        WHERE c.user_id = $1
    `

    try {
        const result = await db.query(text, [userId])
        return result.rows
    } catch (error) {
        throw new Error("Gagal mengambil data cart: " + error.message)
    }
}