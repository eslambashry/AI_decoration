import { DB_connection } from '../../Database/connection.js'
import { globalResponse } from '../middleware/ErrorHandeling.js'
import blogRouter from '../modules/blog/blog.router.js'
import contactRouter from '../modules/contactUs/contactUs.router.js'
import * as routers from '../modules/index.routes.js'
import cors from 'cors'

export const initiateApp = (app, express) => {
    const port = process.env.PORT 

app.use(cors())

app.use(express.json())
DB_connection()

app.get('/', (req,res)=>res.send('Backend Running successfully 🍌'))  

app.use('/auth',routers.authRouters)
app.use('/payment',routers.paymentRoutes)
app.use('/decoration',routers.decorationRoutes)
app.use('/blog',blogRouter)
app.use('/contact',contactRouter)



app.use('*',(req,res,next) => res.status(404).json({message: '404 not found URL'}))

app.use(globalResponse)

// cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// })

app.listen(port, () => console.log(`Application 👂 on port ${port}`)) 

}