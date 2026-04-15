import * as mainModels from '../models/main.models.js'
import { constants } from "node:http2"

export async function getAllProducts(req, res) {
    try {
        const dataProducts = await mainModels.getAllProducts()
        // console.log("data products: ", dataProducts)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "List data products",
            results: dataProducts
        })
    } catch (error) {
        console.error(error.message)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: "Failed to get data products"
        })
    }
}

export async function getProductById(req, res) {
    const {id} = req.params

    try {
        const product = await mainModels.getProductById(id)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Data product:",
            results: product
        })
    } catch (error) {
        console.error(error.message)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: "Failed to get the product"
        })
    }
}

export async function getReviews(req, res) {
    try {
        const reviews = await mainModels.getReviews()
        // console.log(reviews)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "List reviews data",
            results: reviews
        })
    } catch (error) {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: error.message
        })
    }
}