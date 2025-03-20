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

app.get('/', (req,res)=>res.send(
    `
    <h1> Welcome to the Home Page </h1>
    <h2> You can access the following routes: </h2>
    <h3> /auth </h3>
            signUp => POST => /auth/signUp <br>
            login => POST => /auth/login <br>
            loginGmail => POST => /auth/loginGmail <br>
            payment-history => GET => /auth/payment-history <br>
            payment-history/:transactionId => GET => /auth/payment-history/:transactionId <br>
            getAllUser => GET => /auth/getAllUser <br>
            confirm/:token => GET => /auth/confirm/:token <br>
            forgetPassword => POST => /auth/forgetPassword <br>
            resetPassword/:token => POST => /auth/resetPassword/:token <br>
            getUsers => GET => /auth/getUsers <br>
            getOneUser => GET => /auth/getOneUser/:id <br>
    <h3> /payment </h3>
            payment => POST => /payment/payment <br>
            payment-history => GET => /payment/payment-history <br>
    <h3> /decoration </h3>
            createWithImage => POST => /decoration/createWithImage <br>
            createwithoutImage => POST => /decoration/createwithoutImage <br>
            getDesignByUserId => GET => /decoration/getDesignByUserId <br>
    <h3> /blog </h3>
            create => POST => /blog/create <br>
            getAll => GET => /blog/getAll <br>
            getOne => GET => /blog/getOne/:id <br>
            update => PUT => /blog/update/:id <br>
            delete => DELETE => /blog/delete/:id <br>
    <h3> /contact </h3>
            create => POST => /contact/create <br>

    `
))  

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