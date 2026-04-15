import express from 'express'
import 'dotenv/config'
import authRouter from './src/routes/auth.router.js'
import userRouter from './src/routes/user.router.js'
import mainRouter from './src/routes/main.router.js'
import cartRouter from './src/routes/cart.router.js'
import transactionRouter from './src/routes/transaction.router.js'
import corsMiddleware from './src/middleware/cors.js'
import { getDeliveryMethods } from './src/controllers/transaction.controllers.js'
import adminUserRouter from './src/routes/admin/admin.user.router.js'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = process.env.PORT

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(corsMiddleware)
app.use(express.json())

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// grouping routes
app.use('/', mainRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/cart', cartRouter)
app.use('/history', transactionRouter)
app.get('/delivery-methods', getDeliveryMethods)

// router admin
app.use('/admin', adminUserRouter)

// test
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, ()=>{
    console.log(`App listening on port ${port}`)
})