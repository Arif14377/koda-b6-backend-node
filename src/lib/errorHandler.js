import { constants } from 'node:http2'

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {*} results - Data to return (optional)
 */
export function sendSuccess(res, statusCode = constants.HTTP_STATUS_OK, message, results = null) {
    const response = {
        success: true,
        message
    }

    if (results !== null && results !== undefined) {
        response.results = results
    }

    return res.status(statusCode).json(response)
}

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error message
 */
export function sendError(res, statusCode = constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, error) {
    return res.status(statusCode).json({
        success: false,
        error
    })
}

/**
 * Bad request error (400)
 */
export function sendBadRequest(res, error) {
    return sendError(res, constants.HTTP_STATUS_BAD_REQUEST, error)
}

/**
 * Unauthorized error (401)
 */
export function sendUnauthorized(res, error) {
    return sendError(res, constants.HTTP_STATUS_UNAUTHORIZED, error)
}

/**
 * Not found error (404)
 */
export function sendNotFound(res, error) {
    return sendError(res, constants.HTTP_STATUS_NOT_FOUND, error)
}

/**
 * Conflict error (409)
 */
export function sendConflict(res, error) {
    return sendError(res, constants.HTTP_STATUS_CONFLICT, error)
}

/**
 * Internal server error (500)
 */
export function sendServerError(res, error) {
    console.error('Server Error:', error)
    return sendError(res, constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, error.message || 'Internal server error')
}

/**
 * Validation error (400)
 */
export function sendValidationError(res, error) {
    return sendBadRequest(res, error)
}

/**
 * Try-catch wrapper untuk async controller functions
 * @param {Function} fn - Async controller function
 * @returns {Function} Wrapped function dengan error handling
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
