import * as db from '../../db/index.js'

export async function getAllProducts() {
    const text = `
        SELECT p.id, p.name, p.description, p.quantity, p.price, p.rating, p.old_price, p.is_flash_sale,
            COALESCE((SELECT path FROM product_images WHERE product_id = p.id LIMIT 1), '') as image,
            COALESCE((SELECT string_agg(c.name, ',') FROM categories c JOIN product_category pc ON pc.category_id = c.id WHERE pc.product_id = p.id), '') as categories_list,
            COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name, 'addPrice', add_price)) FROM product_variant WHERE product_id = p.id), '[]') as variants,
            COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name, 'addPrice', add_price)) FROM product_size WHERE product_id = p.id), '[]') as sizes
        FROM products p;
    `

    const dataProducts = await db.query(text)
    console.log(dataProducts)
    return dataProducts.rows
}
