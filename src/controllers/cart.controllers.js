import * as cartModels from '../models/cart.models.js'

export async function getCart(req, res) {
    const userId = req.userId

    try {
        const cart = await cartModels.getCartByUserId(userId)

        res.statusCode = 200
        res.json({
            success: true,
            message: "Cart data successfully retrieved..",
            results: cart
        })
    } catch (error) {
        console.error(error.message)
        res.statusCode = 500
        res.json({
            success: false,
            error: "There was an error on the server."
        })
    }
}

export async function addToCart(req, res) {
    const userId = req.userId
    const cartData = req.body

    if (!cartData.productId || !cartData.quantity) {
        res.statusCode = 400
        res.json({
            success: false,
            error: "product id and quantity is required."
        })
        return
    }

    try {
        await cartModels.addToCart(userId, cartData)

        res.statusCode = 201
        res.json({
            success: true,
            message: "Product successfully added to cart."
        })
    } catch (error) {
        console.error(error.message)
        res.statusCode = 500
        res.json({
            success: false,
            error: "There was an error on the server."
        })
    }
}

export async function updateQuantity(req, res) {
    const userId = req.userId
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity) {
        res.statusCode = 400
        res.json({
            success: false,
            error: "Quantity is required."
        })
        return
    }

    try {
        await cartModels.updateQuantity(parseInt(id), userId, quantity)

        res.statusCode = 200
        res.json({
            success: true,
            message: "Successfully update quantity."
        })
    } catch (error) {
        console.error(error.message)
        res.statusCode = 500
        res.json({
            success: false,
            error: "There was an error on the server."
        })
    }
}

export async function removeFromCart(req, res) {
    const userId = req.userId
    const { id } = req.params

    try {
        await cartModels.removeFromCart(parseInt(id), userId)

        res.statusCode = 200
        res.json({
            success: true,
            message: "Item successfully removed from cart."
        })
    } catch (error) {
        console.error(error.message)
        res.statusCode = 500
        res.json({
            success: false,
            error: "There was an error on server."
        })
    }
}