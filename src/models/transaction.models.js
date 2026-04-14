import * as db from '../../db/index.js'

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
    const text = `SELECT id, name, price FROM delivery_methods ORDER BY id`

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