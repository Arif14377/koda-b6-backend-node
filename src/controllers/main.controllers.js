import * as mainModels from '../models/main.models.js'
import { constants } from "node:http2"
import { sendSuccess, sendServerError } from '../lib/errorHandler.js'

export async function getAllProducts(req, res) {
    try {
        const dataProducts = await mainModels.getAllProducts()
        return sendSuccess(res, constants.HTTP_STATUS_OK, "List data products", dataProducts)
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function getProductById(req, res) {
    const {id} = req.params

    try {
        const product = await mainModels.getProductById(id)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Data product:", product)
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function getReviews(req, res) {
    try {
        const reviews = await mainModels.getReviews()
        return sendSuccess(res, constants.HTTP_STATUS_OK, "List reviews data", reviews)
    } catch (error) {
        return sendServerError(res, error)
    }
}