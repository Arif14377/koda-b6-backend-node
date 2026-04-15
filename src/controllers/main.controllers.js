import * as mainModels from '../models/main.models.js'

export async function getAllProducts(req, res) {
    try {
        const dataProducts = await mainModels.getAllProducts()
        // console.log("data products: ", dataProducts)

        res.statuCode = 200
        res.json({
            success: true,
            message: "List data products",
            results: dataProducts
        })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({
            success: false,
            error: "Failed to get data products"
        })
    }
}

export async function getProductById(req, res) {
    const {id} = req.params

    try {
        const product = await mainModels.getProductById(id)

        res.statusCode = 200
        res.json({
            success: true,
            message: "Data product:",
            results: product
        })
    } catch (error) {
        console.error(error.message)
        res.statuCode = 500
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

        res.statuCode = 200
        res.json({
            success: true,
            message: "List reviews data",
            results: reviews
        })
    } catch (error) {
        res.statusCode = 500
        res.json({
            success: false,
            error: error.message
        })
    }
}