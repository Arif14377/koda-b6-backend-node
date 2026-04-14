import { Pool } from 'pg'
import * as db from '../../db/index.js'

const pool = new Pool()

export async function getHistoryByUserId(userId) {
    const text = `
        SELECT t.id, t.user_id, t.trx_code, t.delivery_method, t.full_name, t.email, t.address, t.sub_total, t.tax, t.total, t.date, t.status, t.payment_method,
            COALESCE((
                SELECT pi.path 
                FROM transaction_product tp 
                JOIN product_images pi ON tp.product_id = pi.product_id 
                WHERE tp.transaction_id = t.id 
                ORDER BY tp.id ASC 
                LIMIT 1
            ), '') as image
        FROM transactions t WHERE t.user_id = $1 ORDER BY t.date DESC
    `

    try {
        const result = await db.query(text, [userId])
        return result.rows
    } catch (error) {
        throw new Error("Failed to get history transaction: " + error.message)
    }
}

export async function getDeliveryMethods() {
    const text = `SELECT id, name, price FROM delivery_methods ORDER BY id ASC`

    try {
        const result = await db.query(text)
        return result.rows
    } catch (error) {
        throw new Error("Failed to get shipping method: " + error.message)
    }
}

export async function getTransactionById(id, userId) {
    const textTrx = `
        SELECT t.id, t.user_id, t.trx_code, t.delivery_method, t.full_name, t.email, t.address, t.sub_total, t.tax, t.total, t.date, t.status, t.payment_method,
            COALESCE((
                SELECT pi.path 
                FROM transaction_product tp 
                JOIN product_images pi ON tp.product_id = pi.product_id 
                WHERE tp.transaction_id = t.id 
                ORDER BY tp.id ASC 
                LIMIT 1
            ), '') as image
        FROM transactions t WHERE t.id = $1 AND t.user_id = $2
    `

    const textItems = `
        SELECT tp.id, tp.product_id, tp.transaction_id, tp.quantity, tp.size_id, tp.variant_id, tp.price, p.name as product_name, 
            COALESCE((SELECT path FROM product_images WHERE product_id = p.id LIMIT 1), '') as image,
            ps.name as size_name, pv.name as variant_name
        FROM transaction_product tp
        JOIN products p ON tp.product_id = p.id
        LEFT JOIN product_size ps ON tp.size_id = ps.id
        LEFT JOIN product_variant pv ON tp.variant_id = pv.id
        WHERE tp.transaction_id = $1
    `

    try {
        const trxResult = await db.query(textTrx, [id, userId])
        if (trxResult.rowCount === 0) {
            throw new Error("Transaction not found.")
        }

        const transaction = trxResult.rows[0]
        const itemsResult = await db.query(textItems, [transaction.id])
        transaction.items = itemsResult.rows

        return transaction
    } catch (error) {
        throw new Error(error.message)
    }
}

export async function checkout(userId, trxData) {
    const client = await pool.connect()

    try {
        // 1. Get cart items
        const cartQuery = `
            SELECT 
                c.id, c.product_id, p.name, c.quantity, 
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
        const cartResult = await client.query(cartQuery, [userId])
        if (cartResult.rowCount === 0) {
            throw new Error("cart is empty")
        }
        const cartItems = cartResult.rows

        // 2. Begin transaction
        await client.query('BEGIN')

        // 3. Create transaction record
        const trxCode = `TRX-${Math.floor(Date.now() / 1000)}`
        const insertTrxQuery = `
            INSERT INTO transactions (user_id, trx_code, delivery_method, full_name, email, address, sub_total, tax, total, status, payment_method, date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP) RETURNING id
        `
        const trxResult = await client.query(insertTrxQuery, [
            userId,
            trxCode,
            trxData.delivery_method,
            trxData.full_name,
            trxData.email,
            trxData.address,
            trxData.sub_total,
            trxData.tax,
            trxData.total,
            'Pending',
            trxData.payment_method
        ])
        const trxId = trxResult.rows[0].id

        // 4. Create transaction products
        const insertItemQuery = `
            INSERT INTO transaction_product (product_id, transaction_id, quantity, size_id, variant_id, price) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `
        for (const item of cartItems) {
            await client.query(insertItemQuery, [
                item.product_id,
                trxId,
                item.quantity,
                item.size_id,
                item.variant_id,
                item.price
            ])
        }

        // 5. Clear cart
        await client.query('DELETE FROM cart WHERE user_id = $1', [userId])

        // 6. Commit
        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw new Error(error.message)
    } finally {
        client.release()
    }
}
