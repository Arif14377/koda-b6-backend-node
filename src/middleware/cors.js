import cors from 'cors'

const corsOptions = {
    origin: 'http://68.183.226.223:20101'
}

export default cors(corsOptions)