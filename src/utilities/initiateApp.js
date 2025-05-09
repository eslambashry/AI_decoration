import morgan from 'morgan'
import { DB_connection } from '../../Database/connection.js'
import { globalResponse } from '../middleware/ErrorHandeling.js'
import blogRouter from '../modules/blog/blog.router.js'
import contactRouter from '../modules/contactUs/contactUs.router.js'
import * as routers from '../modules/index.routes.js'
import cors from 'cors'

export const initiateApp = (app, express) => {
    const port = process.env.PORT 

    app.use(cors());


    // app.use(cors({
    //     origin: ['https://roomo.ai'], // السماح فقط لـ roomo.ai
    //     credentials: true, // لو بتستخدم كوكيز أو headers مخصصة
    //   }));

      app.use(morgan('dev'));
      
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
        /* Overall Body Style */
        body {
            background-color: #121212; /* Dark background */
            color: #E0E0E0; /* Light grey text for readability */
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        /* Main Heading Style */
        h1 {
            color: #4CAF50; /* Green */
            font-size: 3.5em;
            margin-top: 40px;
        }

        /* Subheading Style */
        h2 {
            color: #A5D6A7; /* Lighter green */
            font-size: 2.2em;
            margin-top: 20px;
        }

        /* Routes Section */
        h3 {
            color: #81C784; /* Soft green */
            font-size: 2em;
            margin-top: 30px;
        }

        .route-list {
            font-size: 1.1em;
            color: #B0BEC5; /* Light blue-grey */
            line-height: 1.8;
            margin-bottom: 40px;
        }

        /* Route Item Styling */
        .route-item {
            margin: 10px 0;
        }

        /* Clickable GET Routes */
        .route-item a {
            color: #64B5F6; /* Soft blue for links */
            text-decoration: none;
            font-weight: bold;
        }

        .route-item a:hover {
            color: #0288D1; /* Darker blue on hover */
        }

        /* Styling for GET routes to indicate they're clickable */
        .route-item.get-route {
            cursor: pointer;
            transition: color 0.3s ease;
        }

        /* Clickable Route Hover Effect */
        .route-item.get-route:hover {
            color: #0288D1;
        }

        /* Route Item with URL Styling */
        .route-item span {
            color: #FFEB3B; /* Yellow for POST and PUT methods */
        }
        .dashboard{
        color:red;
        font-size: 20px;
        text-decoration: underline;
        cursor: pointer;
        }
        .dashboard:hover{
        color:blue;
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
        <div class="route-item get-route"><a href="/auth/payment-history" id="auth-payment-history">payment-history => <span>GET</span> => /auth/payment-history</a></div>
        <div class="route-item get-route"><a href="/auth/payment-history/:transactionId" id="auth-payment-history-transaction">payment-history/:transactionId => <span>GET</span> => /auth/payment-history/:transactionId</a></div>
        <div class="route-item get-route"><a href="/auth/getAllUser" id="auth-getAllUser">getAllUser => <span>GET</span> => /auth/getAllUser</a></div>
        <div class="route-item get-route"><a href="/auth/confirm/:token" id="auth-confirm-token">confirm/:token => <span>GET</span> => /auth/confirm/:token</a></div>
        <div class="route-item">forgetPassword => <span>POST</span> => /auth/forgetPassword</div>
        <div class="route-item">resetPassword/:token => <span>POST</span> => /auth/resetPassword/:token</div>
        <div class="route-item get-route"><a href="/auth/getOneUser/:id" id="auth-getOneUser">getOneUser => <span>GET</span> => /auth/getOneUser/:id</a></div>
        <div class="route-item">logOut => <span>POST</span> => /auth/logout</div>
        
        <hr/> 
        <div class='dashboard'>* Dasboard *</div>
        <div class="route-item">updateUser/:id => <span>POST</span> => /auth/updateUser/:id</div>
        <div class="route-item">deleteUser/:id => <span>DELETE</span> => /auth/deleteUser/:id</div>
        <div class="route-item get-route"><a href="/auth/getUsers" id="auth-getUsers">getUsers => <span>GET</span> => /auth/getUsers</a></div>
        <div class="route-item get-route"><a href="/auth/getSingle/:id" id="auth-getUsers">getSingle => <span>GET</span> => /auth/getSingle/:id</a></div>
        <div class="route-item">getDashboardData => <span>GET</span> => /payment/dashboard/getPaymentsData</div>
        </div>

    <h3>/payment</h3>
    <div class="route-list">
        <div class="route-item">payment => <span>POST</span> => /payment/payment</div>
    </div>

    <h3>/decoration</h3>
    <div class="route-list">
        <div class="route-item">createWithImage => <span>POST</span> => /decoration/createWithImage</div>
        <div class="route-item">createwithoutImage => <span>POST</span> => /decoration/createwithoutImage</div>
        <div class="route-item get-route"><a href="/decoration/getDesignByUserId" id="decoration-design">getDesignByUserId => <span>GET</span> => /decoration/getDesignByUserId</a></div>

    </div>

    <h3>/blog</h3>
    <div class="route-list">
        <div class="route-item">create => <span>POST</span> => /blog/create</div>
        <div class="route-item get-route"><a href="/blog/getallblogs" id="blog-getAll">getallblogs => <span>GET</span> => /blog/getallblogs</a></div>
        <div class="route-item get-route"><a href="/blog/getarblogs" id="blog-getAll">get arabic blogs/ => <span>GET</span> => /blog/getarblogs</a></div>
        <div class="route-item get-route"><a href="/blog/getenblogs" id="blog-getAll">get english blogs/ => <span>GET</span> => /blog/getenblogs</a></div>
        <div class="route-item get-route"><a href="/blog/getOne/:id" id="blog-getOne">getOne => <span>GET</span> => /blog/getOne/:id</a></div>
        <div class="route-item">update => <span>PUT</span> => /blog/update/:id</div>
        <div class="route-item">delete => <span>DELETE</span> => /blog/delete/:id</div>
    </div>

    <h3>/contact</h3>
    <div class="route-list">
        <div class="route-item">create => <span>POST</span> => /contact/create</div>
    </div>

<script>
    // Example of handling the GET routes to update the current page route
    document.querySelectorAll('.get-route a').forEach(route => {
        route.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            
            // Construct the full URL by appending the clicked route to 'http://localhost:9090/'
            const newUrl = '${req.protocol}://${req.headers.host}' + this.getAttribute('href');
            
            // Update the browser's location to the new URL
            window.location.href = newUrl;
        });
    });
</script>

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