import cors from 'cors'

const corsOptions = {
    origin: 'http://localhost'
}

export default cors(corsOptions)