import CustomError from "../../utilities/customError.js";
import { calculatePaymentMetrics, getAccountBalance, initializePayment, verifyPayment } from "../../utilities/payment.js";
import { sendEmailService } from "../../services/sendEmail.js";
import { emailTemplate } from "../../utilities/emailTemplate.js";
import catchError from "../../middleware/ErrorHandeling.js";
import createInvoice from "../../utilities/pdfbody.js";
import { userModel } from "../../../Database/models/user.model.js";
import { nanoid } from 'nanoid';
import { Payment } from "../../../Database/models/payment.model.js";
import slugify from 'slugify'; 

import fs from 'fs';
import { uploadToImageKit } from "../../utilities/imageKitConfigration.js";

export const paymentPlans = {
  PLAN_1: {
    name: 'Trial',
    maxDesigns: 5, // 3 designs + 2 designs free
    prices: {
      USD: 9.06,
      SAR: 34.00, // Approximate conversion
      AED: 33.30  // Approximate conversion
    },
    costPerDesign: 1.81,
    description: '3 designs + 2 designs free',
    features: [
      'Access to all rooms and styles (No color)',
      '3 months storage',
      'Download high quality'
    ],
    storageMonths: 3
  },
  PLAN_2: {
    name: 'Basic',
    maxDesigns: 30, // 25 designs + 5 designs free
    prices: {
      USD: 26.66,
      SAR: 100.00, // Approximate conversion
      AED: 98.00   // Approximate conversion
    },
    costPerDesign: 0.89,
    description: '25 designs + 5 designs free',
    features: [
      'Access to all rooms and styles',
      '6 months storage',
      'Download high quality'
    ],
    storageMonths: 6
  },
  PLAN_3: {
    name: 'Pro',
    maxDesigns: 50, // 40 designs + 10 designs free
    prices: {
      USD: 37.33,
      SAR: 140.00, // Approximate conversion
      AED: 137.00  // Approximate conversion
    },
    costPerDesign: 0.75,
    description: '40 designs + 10 designs free',
    features: [
      'Access to all rooms and styles',
      '6 months storage',
      'Download high quality'
    ],
    storageMonths: 6
  }
};

export const processPayment = catchError(async (req, res, next) => {
  const { planId, currency = 'USD' } = req.body;
  const planDetails = paymentPlans[planId];
  
  if (!planDetails) {
    return next(new CustomError('Invalid plan ID', 400));
  }

  // Validate currency
  if (!['USD', 'SAR', 'AED'].includes(currency)) {
    return next(new CustomError('Invalid currency. Supported currencies: USD, SAR, AED', 400));
  }

  // Ensure directory exists
  // if (!fs.existsSync('./Files')) {
  //   fs.mkdirSync('./Files', { recursive: true });
  // }

  const user = await userModel.findById(req.authUser._id);
  if (!user) {
    return next(new CustomError('User not found', 404));
  }
  

  const slugifiedUsername = slugify(user.username, {
    lower: true,      // Convert to lowercase
    strict: true,     // Strip special characters
    replacement: '-'  // Replace spaces with hyphens
  });
  
  const orderCode = `${slugifiedUsername}_${nanoid(3)}`;  
  // Get price for selected currency
  const amount = planDetails.prices[currency];
  
  // Create line items for Stripe
  const line_items = [
    {
      price_data: {
        currency: currency,
        product_data: {
          name: planDetails.name,
          description: planDetails.description,
        },
        unit_amount: Math.round(amount * 100), // Convert to cents
      },
      quantity: 1,
    },
  ];
  const baseUrl = `${req.protocol}://${req.headers.host}`;

  // Initialize payment with Stripe
  const paymentSession = await initializePayment({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    metadata: {
      userId: user._id.toString(),
      planId,
      orderCode,
      currency
    },
    success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/payment/cancel`,
    line_items,
  });

  return res.status(200).json({ 
    message: 'Payment session created successfully',
    paymentSession 
  });
});



export const handlePaymentSuccess = catchError(async (req, res, next) => {
  const { session_id } = req.query;
  
  if (!session_id) {
    return next(new CustomError('Session ID is required', 400));
  }

  // Verify payment with Stripe
  const { success, session } = await verifyPayment(session_id);
  
  if (!success) {
    return next(new CustomError('Payment verification failed', 400));
  }

  const { userId, planId, orderCode, currency = 'USD' } = session.metadata;
  const planDetails = paymentPlans[planId];

  // Update user's available designs
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new CustomError('User not found', 404));
  }

  user.totalDesignsAvailable += planDetails.maxDesigns;
  


  // Generate invoice
  const invoiceData = {
    orderCode,
    date: new Date(),
    shipping: {
      name: user.username || user.email,
      address: user.address || 'N/A',
      city: user.city || 'N/A',
      state: user.state || 'N/A',
      country: user.country || 'N/A',
    },
    items: [
      {
        title: planDetails.name,
        description: planDetails.description,
        price: planDetails.prices[currency],
        quantity: 1,
        finalPrice: planDetails.prices[currency]
      }
    ],
    subTotal: planDetails.prices[currency],
    paidAmount: planDetails.prices[currency],
    currency
  };

  // const invoicePath = createInvoice(invoiceData, `${orderCode}_invoice.pdf`);
  
     // Generate invoice (ensure it returns a Buffer, not a file path)
     const invoiceBuffer = await createInvoice(invoiceData, `${orderCode}_invoice.pdf`); // Await here to get the actual PDF Buffer

     // Upload the PDF to ImageKit
     const uploadedFile = await uploadToImageKit(invoiceBuffer, `${orderCode}_invoice.pdf`);
     console.log(uploadedFile);
     // The uploaded file URL (public URL)
     const pdfUrl = uploadedFile.url;
// console.log(pdfUrl);

  // Send email with invoice
  const emailContent = emailTemplate({
    link: `${pdfUrl}`,
    linkData: 'View Invoice',
    subject: 'Payment Confirmation - DecorAI'
  });

  await sendEmailService({
    to: user.email,
    subject: 'Payment Confirmation - DecorAI',
    message: emailContent,
    attachments: [
      {
        filename: `invoice_${orderCode}.pdf`,
        path: pdfUrl // The URL of the uploaded PDF on ImageKit
      }
    ]
  });


    // Create a new Payment document
    const payment = new Payment({
      userId: user._id,
      planId,
      currency,
      amount: planDetails.prices[currency],
      transactionId: session_id,
      paymentMethod: 'stripe',
      status: 'completed',
      designsCount: planDetails.maxDesigns,
      storageMonths: planDetails.storageMonths,
      pdfUrl: {
        secure_url: uploadedFile.url,
        public_id: uploadedFile.fileId,
      },
    });
    
    // Save the payment document
    await payment.save();
    
    // Add the new payment to the paymentHistory array in the User document
    user.paymentHistory.push(payment._id);
  
    // Update the user document
    await user.save();

    
  return res.status(200).json({
    success: true,
    message: 'Payment processed successfully',
    user: {
      email: user.email,
      totalDesignsAvailable: user.totalDesignsAvailable,
      pdfUrl: pdfUrl
    }
  });
});


export const handlePaymentCancel = catchError(async (req, res, next) => {
  return res.status(200).json({
    success: false,
    message: 'Payment was cancelled'
  });
});


export const getDashboardData = catchError(async (req, res, next) => {
    try {
        // Extract query parameters
        const { startDate, endDate } = req.query;

        // Convert dates to timestamps if provided
        const parsedStartDate = startDate ? new Date(startDate).getTime() : null;
        const parsedEndDate = endDate ? new Date(endDate).getTime() : null;

        // Fetch account balance
        const balance = await getAccountBalance();

        // Calculate payment metrics
        const paymentMetrics = await calculatePaymentMetrics({
            startDate: parsedStartDate,
            endDate: parsedEndDate,
        });

        // Combine all data into a single response
        return res.status(200).json({
            success: true,
            message: 'Dashboard data fetched successfully',
            data: {
                balance: {
                    available: balance.availableBalance,
                    pending: balance.pendingBalance,
                },
                payments: {
                    groupedPayments: paymentMetrics.groupedPayments,
                    totalPaymentsInUSD: paymentMetrics.totalPaymentsInUSD,
                },
            },
        });
    } catch (error) {
        return next(new CustomError('Failed to fetch dashboard data', 500));
    }
});