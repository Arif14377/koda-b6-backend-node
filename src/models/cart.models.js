import * as db from '../../db/index.js'

export async function getCartByUserId(userId) {
    const text = `
        SELECT 
            c.id, c.product_id, p.name as "productName", c.quantity, 
            (p.price + COALESCE(ps.add_price, 0) + COALESCE(pv.add_price, 0)) as price,
            COALESCE((SELECT path FROM product_images WHERE product_id = p.id LIMIT 1), '') as image,
            ps.name as size, pv.name as variant,
            c.size_id, c.variant_id,
            (c.quantity * (p.price + COALESCE(ps.add_price, 0) + COALESCE(pv.add_price, 0))) as total
        FROM cart c
        JOIN products p ON c.product_id = p.id
        LEFT JOIN product_size ps ON c.size_id = ps.id
        LEFT JOIN product_variant pv ON c.variant_id = pv.id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
    `

    try {
        const result = await db.query(text, [userId])
        return result.rows
    } catch (error) {
        throw new Error("Failed to get cart data: " + error.message)
    }
}

export async function addToCart(userId, cartData) {
    // cek jika sudah ada item di keranjang dengan size dan variant yang sama
    const checkQuery = `
        SELECT id, quantity FROM cart 
        WHERE user_id = $1 AND product_id = $2 
        AND (size_id IS NOT DISTINCT FROM $3)
        AND (variant_id IS NOT DISTINCT FROM $4)
    `

    try {
        const existing = await db.query(checkQuery, [
            userId,
            cartData.productId,
            cartData.sizeId || null,
            cartData.variantId || null
        ])

        if (existing.rowCount > 0) {
            // Update quantity
            const newQty = existing.rows[0].quantity + cartData.quantity
            const updateQuery = `UPDATE cart SET quantity = $1 WHERE id = $2`
            await db.query(updateQuery, [newQty, existing.rows[0].id])
        } else {
            // Insert new item
            const insertQuery = `
                INSERT INTO cart (user_id, product_id, quantity, size_id, variant_id)
                VALUES ($1, $2, $3, $4, $5)
            `
            await db.query(insertQuery, [
                userId,
                cartData.productId,
                cartData.quantity,
                cartData.sizeId || null,
                cartData.variantId || null
            ])
        }
    } catch (error) {
        throw new Error("Failed to add product to cart: " + error.message)
    }
}

export async function updateQuantity(cartId, userId, quantity) {
    const text = `UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3`

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
    const text = `DELETE FROM cart WHERE id = $1 AND user_id = $2`

    try {
        const result = await db.query(text, [cartId, userId])
        if (result.rowCount === 0) {
            throw new Error("Cart item not found.")
        }
    } catch (error) {
        throw new Error("Failed to remove item from cart: " + error.message)
    }
}

export async function clearCart(userId) {
    const text = `DELETE FROM cart WHERE user_id = $1`

    try {
        await db.query(text, [userId])
    } catch (error) {
        throw new Error("Failed to empty cart: " + error.message)
    }
}
