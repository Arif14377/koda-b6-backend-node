import cors from 'cors'

const corsOptions = {
    // origin: 'http://68.183.226.223:20101'
    origin: 'http://localhost:5173'
}

export default cors(corsOptions)