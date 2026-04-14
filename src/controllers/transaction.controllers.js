import * as transactionModels from '../models/transaction.models.js'

export async function getHistory(req, res) {
        const userId = req.userId

    try {
        const history = await transactionModels.getHistoryByUserId(userId)

        res.statusCode = 200
        res.json({
            success: true,
            message: "Successfully to get transaction history.",
            results: history
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

// export async function getDetail() {

// }

export async function getDeliveryMethods(req, res) {
    try {
        const methods = await transactionModels.getDeliveryMethods()

        res.statusCode = 200
        res.json({
            success: true,
            message: "Successfully to get shipping method.",
            results: methods
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


// export async function checkout() {

// }