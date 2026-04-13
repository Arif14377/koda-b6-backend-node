import * as mainModels from '../models/main.models.js'

export async function getAllProducts(req, res) {
    try {
        const dataProducts = await mainModels.getAllProducts()
        console.log("data products: ", dataProducts)

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
