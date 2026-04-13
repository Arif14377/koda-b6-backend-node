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