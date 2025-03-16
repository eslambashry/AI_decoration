
# Backend API for Decor8AI Virtual Staging Platform


This is the backend API for the Decor8AI Virtual Staging platform. It provides features like image uploads, user authentication, payment gateway integration, and invoicing automation. The backend is built using Node.js, with various packages for security, image processing, and API integration.



## Features

- Image Uploads: Users can upload room images to be processed by the Decor8AI API.
- Before & After Sliders: Allows users to view original and staged images side by side.
- User Authentication: JWT-based authentication for secure login and user management.
- Payment Integration: Supports payment gateways like TAP, Tabby, Tamara, and STC Pay.
- Auto Invoicing: Generates and emails invoices automatically to users.
- User & Admin Dashboards: Separate dashboards for users to manage their images and for admins to manage users and payments.


## Installation

Prerequisites
- Node.js
- MongoDB (for database)
- Decor8AI API key (for image processing)
- Payment gateway API keys (for payment integration)

Clone the repository
```bash
    git clone https://github.com/your-repo/decor8ai-backend.git
    cd decor8ai-backend
```

Install Dependencies
```bash
    npm install
```

Environment Configuration
```bash
MONGO_URI=your_mongo_db_uri
JWT_SECRET=your_jwt_secret
DECOR8AI_API_KEY=your_decor8ai_api_key
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
TAP_API_KEY=your_tap_api_key
TABBY_API_KEY=your_tabby_api_key
TAMARA_API_KEY=your_tamara_api_key
STC_PAY_API_KEY=your_stc_pay_api_key

``` 

Run the Server
```bash
    nodemon
```
## API Reference

#### login

```http
  POST /auth/login
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | Required. The email address of the user.
 |
| `password`|      `string`|  Required. The password address of the user.
|                                       |

This format shows the parameters for the login endpoint as table data, where email and password are required fields for the login request. You can follow this same structure for any additional endpoints you add.


## Tech Stack

**Client:** React, Redux, TailwindCSS

**Server:** Node, Express

Technologies Used
- Node.js: Backend framework
- Express: Web framework for Node.js
- Mongoose: MongoDB ODM for database management
- JWT (JSON Web Tokens): For user authentication and secure session management
- Nodemailer: For sending emails (e.g., invoices)
- PDFKit: For generating PDF invoices
- Multer: For handling image uploads
- ImageKit: For image management and processing
- bcryptjs: For hashing user passwords
- axios: For making HTTP requests to third-party APIs (e.g., Decor8AI API)