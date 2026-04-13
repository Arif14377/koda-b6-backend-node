import express from 'express'
import 'dotenv/config'
import authRouter from './src/routes/auth.router.js'
import mainRouter from './src/routes/main.router.js'

const app = express()
const port = process.env.PORT

app.use(express.json())

// grouping routes
app.use('/', mainRouter)
app.use('/auth', authRouter)

// test
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, ()=>{
    console.log(`App listening on port ${port}`)
})