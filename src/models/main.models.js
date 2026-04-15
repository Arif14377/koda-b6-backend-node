import * as db from '../../db/index.js'
import redisClient from '../../db/redis.js'

const CACHE_TTL = 60 * 5 // 5 menit

export async function getAllProducts() {
    const cacheKey = 'products:all'

    // Ambil dari Redis dulu
    const cached = await redisClient.get(cacheKey)
    if (cached) {
        console.log('[Cache HIT] getAllProducts')
        return JSON.parse(cached)
    }

    // Redis kosong, ambil dari DB
    console.log('[Cache MISS] getAllProducts — fetch from DB')
    const text = `
        SELECT p.id, p.name, p.description, p.quantity, p.price, p.rating, p.old_price as "oldPrice", p.is_flash_sale,
            COALESCE((SELECT path FROM product_images WHERE product_id = p.id LIMIT 1), '') as image,
            COALESCE((SELECT string_agg(c.name, ',') FROM categories c JOIN product_category pc ON pc.category_id = c.id WHERE pc.product_id = p.id), '') as categories_list,
            COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name, 'addPrice', add_price)) FROM product_variant WHERE product_id = p.id), '[]') as variants,
            COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name, 'addPrice', add_price)) FROM product_size WHERE product_id = p.id), '[]') as sizes
        FROM products p;
    `

    const dataProducts = await db.query(text)
    const rows = dataProducts.rows

    // Simpan ke Redis
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(rows))

    return rows
}

export async function getProductById(productId) {
    try {
        // fetch data product
        const textProduct = `
            SELECT id, name, description, quantity, price, rating, old_price as "oldPrice", is_flash_sale
            FROM products
            WHERE id = $1
        `

        const rowsProduct = await db.query(textProduct, [productId])

        if (rowsProduct.rowCount === 0) {
            throw new Error("Produk tidak ditemukan.")
        }

        const product = rowsProduct.rows[0]

        // fetch images
        const textImages = `
            SELECT id, product_id, path FROM product_images WHERE product_id = $1
        `
        
        const rowsImages = await db.query(textImages, [productId])
        product.images = rowsImages.rows

         // fetch variants
        const textVariants = `
            SELECT id, name, add_price as "addPrice" FROM product_variant WHERE product_id = $1
        `
        const rowsVariants = await db.query(textVariants, [productId])
        product.variants = rowsVariants.rows
 
        // fetch sizes
        const textSizes = `
            SELECT id, name, add_price as "addPrice" FROM product_size WHERE product_id = $1
        `
        const rowsSizes = await db.query(textSizes, [productId])
        product.sizes = rowsSizes.rows

        // fetch categories
        const textCategories = `
            SELECT c.name 
            FROM categories c 
            JOIN product_category pc ON pc.category_id = c.id 
            WHERE pc.product_id = $1
        `

        const rowsCategories = await db.query(textCategories, [productId])
        product.categories = rowsCategories.rows

        return product
    } catch (error) {
        console.error("Error while get products data")
        throw new Error(error.message)
    }
}

export async function getReviews() {
    const cacheKey = 'reviews:all'

    // Ambil dari Redis dulu
    const cached = await redisClient.get(cacheKey)
    if (cached) {
        console.log('[Cache HIT] getReviews')
        return JSON.parse(cached)
    }

    // Redis kosong, ambil dari DB
    console.log('[Cache MISS] getReviews — fetch from DB')
    const text = `
        SELECT users.full_name, reviews.messages, reviews.rating, users.picture
        FROM reviews
        INNER JOIN users ON reviews.user_id = users.id
    `

    try {
        const reviews = await db.query(text)
        const rows = reviews.rows

        // Simpan ke Redis
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(rows))

        return rows
    } catch(error) {
        throw new Error("Failed to get reviews data: " + error.message)
    }
}
