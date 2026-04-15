import * as cartModels from '../models/cart.models.js'
import { constants } from "node:http2"
import { sendSuccess, sendBadRequest, sendServerError } from '../lib/errorHandler.js'

export async function getCart(req, res) {
    const userId = req.userId

    try {
        const cart = await cartModels.getCartByUserId(userId)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Cart data successfully retrieved.", cart)
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function addToCart(req, res) {
    const userId = req.userId
    const cartData = req.body

    if (!cartData.productId || !cartData.quantity) {
        return sendBadRequest(res, "product id and quantity is required.")
    }

    try {
        await cartModels.addToCart(userId, cartData)
        return sendSuccess(res, constants.HTTP_STATUS_CREATED, "Product successfully added to cart.")
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function updateQuantity(req, res) {
    const userId = req.userId
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity) {
        return sendBadRequest(res, "Quantity is required.")
    }

    try {
        await cartModels.updateQuantity(parseInt(id), userId, quantity)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Successfully update quantity.")
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function removeFromCart(req, res) {
    const userId = req.userId
    const { id } = req.params

    try {
        await cartModels.removeFromCart(parseInt(id), userId)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Item successfully removed from cart.")
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function clearCart(req, res) {
    const userId = req.userId

    try {
        await cartModels.clearCart(userId)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Cart successfully emptied.")
    } catch (error) {
        return sendServerError(res, error)
    }
}