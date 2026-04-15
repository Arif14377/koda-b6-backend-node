import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/profile-pictures')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        // Generate filename with timestamp to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        const name = path.basename(file.originalname, ext)
        cb(null, `${req.userId}-${uniqueSuffix}${ext}`)
    }
})

// Filter file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false)
    }
}

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
})

// Add error handling middleware
export const uploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(413).json({
                success: false,
                error: 'File size exceeds 5MB limit'
            })
        }
        return res.status(400).json({
            success: false,
            error: err.message
        })
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        })
    }
    next()
}

export default upload
