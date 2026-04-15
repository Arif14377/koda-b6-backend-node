import * as transactionModels from '../models/transaction.models.js'
import { constants } from 'node:http2'
import { sendSuccess, sendBadRequest, sendServerError, sendNotFound } from '../lib/errorHandler.js'

export async function getHistory(req, res) {
    const userId = req.userId

    try {
        const history = await transactionModels.getHistoryByUserId(userId)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Successfully to get transaction history.", history)
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function getDetail(req, res) {
    const userId = req.userId
    const { id } = req.params

    try {
        const transaction = await transactionModels.getTransactionById(parseInt(id), userId)
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Successfully to get transaction detail.", transaction)
    } catch (error) {
        return sendNotFound(res, error.message)
    }
}

export async function getDeliveryMethods(req, res) {
    try {
        const methods = await transactionModels.getDeliveryMethods()
        return sendSuccess(res, constants.HTTP_STATUS_OK, "Successfully to get shipping method.", methods)
    } catch (error) {
        return sendServerError(res, error)
    }
}

export async function checkout(req, res) {
    const userId = req.userId
    const trxData = req.body

    if (!trxData.delivery_method || !trxData.full_name || !trxData.email || !trxData.address || !trxData.sub_total || !trxData.tax || !trxData.total || !trxData.payment_method) {
        return sendBadRequest(res, "Input tidak valid")
    }

    try {
        await transactionModels.checkout(userId, trxData)
        return sendSuccess(res, constants.HTTP_STATUS_CREATED, "Checkout berhasil.")
    } catch (error) {
        return sendServerError(res, error)
    }
}
