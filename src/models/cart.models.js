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
        throw new Error("Failed to get cart data: " + error.message)
    }
}

export async function addToCart(userId, cartData) {
    const text = `
        INSERT INTO cart(user_id, product_id, quantity, size_id, variant_id)
        VALUES($1, $2, $3, $4, $5)
    `

    try {
        await db.query(text, [
            userId,
            cartData.productId,
            cartData.quantity,
            cartData.sizeId || null,
            cartData.variantId || null
        ])
    } catch (error) {
        throw new Error("Failed to add product to cart: " + error.message)
    }
}

export async function updateQuantity(cartId, userId, quantity) {
    const text = `
        UPDATE cart SET quantity = $1
        WHERE id = $2 AND user_id = $3
    `

    try {
        const result = await db.query(text, [quantity, cartId, userId])
        if (result.rowCount === 0) {
            throw new Error("Cart item not found.")
        }
    } catch (error) {
        throw new Error("Failed to update: " + error.message)
    }
}

export async function removeFromCart(cartId, userId) {
    const text = `
        DELETE FROM cart WHERE id = $1 AND user_id = $2
    `

    try {
        const result = await db.query(text, [cartId, userId])
        if (result.rowCount === 0) {
            throw new Error("Cart item not found.")
        }
    } catch (error) {
        throw new Error("Failed to remove item from cart: " + error.message)
    }
}