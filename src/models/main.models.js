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

export async function getProductById(productId) {
    try {
        // fetch data product
        const textProduct = `
            SELECT id, name, description, quantity, price, rating, old_price, is_flash_sale
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
            SELECT id, name, add_price FROM product_variant WHERE product_id = $1
        `
        const rowsVariants = await db.query(textVariants, [productId])
        product.variants = rowsVariants.rows
 
        // fetch sizes
        const textSizes = `
            SELECT id, name, add_price FROM product_size WHERE product_id = $1
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
    const text=`
        SELECT users.full_name, reviews.messages, reviews.rating, users.picture
		FROM reviews
		INNER JOIN users ON reviews.user_id = users.id
    `

    try {
        const reviews = await db.query(text)
        return reviews.rows
    } catch(error) {
        throw new Error("Failed to get reviews data: ", error.message)
    }
    
}