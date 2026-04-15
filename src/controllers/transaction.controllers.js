import * as transactionModels from '../models/transaction.models.js'
import { constants } from 'node:http2'

export async function getHistory(req, res) {
    const userId = req.userId

    try {
        const history = await transactionModels.getHistoryByUserId(userId)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Successfully to get transaction history.",
            results: history
        })
    } catch (error) {
        console.error(error.message)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: "There was an error on the server."
        })
    }
}

export async function getDetail(req, res) {
    const userId = req.userId
    const { id } = req.params

    try {
        const transaction = await transactionModels.getTransactionById(parseInt(id), userId)

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Successfully to get transaction detail.",
            results: transaction
        })
    } catch (error) {
        console.error(error.message)
        res.status(constants.HTTP_STATUS_NOT_FOUND)
        res.json({
            success: false,
            error: error.message
        })
    }
}

export async function getDeliveryMethods(req, res) {
    try {
        const methods = await transactionModels.getDeliveryMethods()

        res.status(constants.HTTP_STATUS_OK)
        res.json({
            success: true,
            message: "Successfully to get shipping method.",
            results: methods
        })
    } catch (error) {
        console.error(error.message)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: "There was an error on the server."
        })
    }
}

export async function checkout(req, res) {
    const userId = req.userId
    const trxData = req.body

    if (!trxData.delivery_method || !trxData.full_name || !trxData.email || !trxData.address || !trxData.sub_total || !trxData.tax || !trxData.total || !trxData.payment_method) {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
        res.json({
            success: false,
            error: "Input tidak valid"
        })
        return
    }

    try {
        await transactionModels.checkout(userId, trxData)

        res.status(constants.HTTP_STATUS_CREATED)
        res.json({
            success: true,
            message: "Checkout berhasil."
        })
    } catch (error) {
        console.error(error.message)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        res.json({
            success: false,
            error: "Ada kesalahan pada server."
        })
    }
}
