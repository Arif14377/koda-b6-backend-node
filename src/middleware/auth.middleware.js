import jwt from 'jsonwebtoken'

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