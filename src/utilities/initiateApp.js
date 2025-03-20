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
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Page</title>
    <style>
        body {
            background-color: black;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            padding: 0;
        }

        h1 {
            color: #FFD700; /* Gold color */
            font-size: 3em;
            margin-top: 50px;
        }

        h2 {
            color: #32CD32; /* LimeGreen color */
            font-size: 2.5em;
            margin-top: 30px;
        }

        h3 {
            color: #FF4500; /* OrangeRed color */
            font-size: 2em;
            margin-top: 20px;
        }

        .route-list {
            color: #ADD8E6; /* LightBlue color */
            font-size: 1.2em;
            margin: 10px 0;
        }

        .route-list br {
            margin-bottom: 10px;
        }

        .route-item {
            color: #FFFF00; /* Yellow color */
        }

        .route-item span {
            color: #00FFFF; /* Cyan color */
        }

        .route-item a {
            text-decoration: none;
            color: #FFD700; /* Gold color */
            font-weight: bold;
        }

        .route-item a:hover {
            color: #FF6347; /* Tomato color */
        }
    </style>
</head>
<body>

    <h1>Welcome to the Home Page</h1>
    <h2>You can access the following routes:</h2>

    <h3>/auth</h3>
    <div class="route-list">
        <div class="route-item">signUp => <span>POST</span> => /auth/signUp</div>
        <div class="route-item">login => <span>POST</span> => /auth/login</div>
        <div class="route-item">loginGmail => <span>POST</span> => /auth/loginGmail</div>
        <div class="route-item">payment-history => <span>GET</span> => /auth/payment-history</div>
        <div class="route-item">payment-history/:transactionId => <span>GET</span> => /auth/payment-history/:transactionId</div>
        <div class="route-item">getAllUser => <span>GET</span> => /auth/getAllUser</div>
        <div class="route-item">confirm/:token => <span>GET</span> => /auth/confirm/:token</div>
        <div class="route-item">forgetPassword => <span>POST</span> => /auth/forgetPassword</div>
        <div class="route-item">resetPassword/:token => <span>POST</span> => /auth/resetPassword/:token</div>
        <div class="route-item">getUsers => <span>GET</span> => /auth/getUsers</div>
        <div class="route-item">getOneUser => <span>GET</span> => /auth/getOneUser/:id</div>
    </div>

    <h3>/payment</h3>
    <div class="route-list">
        <div class="route-item">payment => <span>POST</span> => /payment/payment</div>
        <div class="route-item">payment-history => <span>GET</span> => /payment/payment-history</div>
    </div>

    <h3>/decoration</h3>
    <div class="route-list">
        <div class="route-item">createWithImage => <span>POST</span> => /decoration/createWithImage</div>
        <div class="route-item">createwithoutImage => <span>POST</span> => /decoration/createwithoutImage</div>
        <div class="route-item">getDesignByUserId => <span>GET</span> => /decoration/getDesignByUserId</div>
    </div>

    <h3>/blog</h3>
    <div class="route-list">
        <div class="route-item">create => <span>POST</span> => /blog/create</div>
        <div class="route-item">getAll => <span>GET</span> => /blog/getAll</div>
        <div class="route-item">getOne => <span>GET</span> => /blog/getOne/:id</div>
        <div class="route-item">update => <span>PUT</span> => /blog/update/:id</div>
        <div class="route-item">delete => <span>DELETE</span> => /blog/delete/:id</div>
    </div>

    <h3>/contact</h3>
    <div class="route-list">
        <div class="route-item">create => <span>POST</span> => /contact/create</div>
    </div>

</body>
</html>
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