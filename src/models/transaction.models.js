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