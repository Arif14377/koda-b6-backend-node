import jwt from 'jsonwebtoken'
import { constants } from 'node:http2'

export function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        console.error("Authorization required.")
        res.status(constants.HTTP_STATUS_UNAUTHORIZED)
        res.json({
            success: false,
            error: "Access is denied due to invalid credentials."
        })
        return
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.error("Invalid token format.")
        res.status(constants.HTTP_STATUS_UNAUTHORIZED)
        res.json({
            success: false,
            error: "Access is denied due to invalid credentials."
        })
        return
    }

    const tokenString = parts[1]

    try {
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET)
        req.userId = decoded.userId
        req.userRole = decoded.userRole
        next()
    } catch (error) {
        console.error("invalid or expired token")
        res.status(constants.HTTP_STATUS_UNAUTHORIZED)
        res.json({
            success: false,
            error: "Access is denied due to invalid credentials."
        })
    }
}

export function roleAccess(allowedRoles = []) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization']
        if (!authHeader) {
            next()
            return
        }

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            console.error("Invalid token format.")
            res.status(constants.HTTP_STATUS_UNAUTHORIZED)
            res.json({
                success: false,
                error: "Access is denied due to invalid credentials."
            })
            return
        }

        const tokenString = parts[1]

        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET)
        const userRole = decoded.userRole

        console.log("allowedRoles: ", allowedRoles)
        console.log("user role: ", userRole)

        if (typeof userRole === 'undefined') {
            res.status(constants.HTTP_STATUS_UNAUTHORIZED)
            res.json({
                success: false,
                error: "Access is denied due to invalid credentials."
            })
            return
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(constants.HTTP_STATUS_FORBIDDEN)
            res.json({
                success: false,
                error: "You do not have permission to access this resource."
            })
            return
        }

        next()
    }
}

export function rejectRole(disallowedRoles = []) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization']
        if (!authHeader) {
            next()
            return
        }

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            console.error("Invalid token format.")
            res.status(constants.HTTP_STATUS_UNAUTHORIZED)
            res.json({
                success: false,
                error: "Access is denied due to invalid credentials."
            })
            return
        }

        const tokenString = parts[1]

        try {
            const decoded = jwt.verify(tokenString, process.env.JWT_SECRET)
            const userRole = decoded.userRole

            if (disallowedRoles.includes(userRole)) {
                res.status(constants.HTTP_STATUS_FORBIDDEN)
                res.json({
                    success: false,
                    error: "You do not have permission to access this resource."
                })
                return
            }

            next()
        } catch (error) {
            console.error("invalid or expired token")
            res.status(constants.HTTP_STATUS_UNAUTHORIZED)
            res.json({
                success: false,
                error: "Access is denied due to invalid credentials."
            })
        }
    }
}
