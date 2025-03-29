import CustomError from "../../utilities/customError.js";
import { initializePayment, verifyPayment } from "../../utilities/payment.js";
import { sendEmailService } from "../../services/sendEmail.js";
import { emailTemplate } from "../../utilities/emailTemplate.js";
import catchError from "../../middleware/ErrorHandeling.js";
import createInvoice from "../../utilities/pdfbody.js";
import { userModel } from "../../../Database/models/user.model.js";
import { nanoid } from 'nanoid';
import { Payment } from "../../../Database/models/payment.model.js";
import slugify from 'slugify'; 

import fs from 'fs';

export const paymentPlans = {
  PLAN_1: {
    name: 'Trial - تجربة',
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
    name: 'Basic - الباقة الاساسية',
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
    name: 'Pro - باقة برو',
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
  if (!fs.existsSync('./Files')) {
    fs.mkdirSync('./Files', { recursive: true });
  }

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
  });
  
  // Save the payment document
  await payment.save();
  
  // Add the new payment to the paymentHistory array in the User document
  user.paymentHistory.push(payment._id);

  // Update the user document
  await user.save();

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
        price: planDetails.prices[currency],
        quantity: 1,
        finalPrice: planDetails.prices[currency]
      }
    ],
    subTotal: planDetails.prices[currency],
    paidAmount: planDetails.prices[currency],
    currency
  };

  const invoicePath = createInvoice(invoiceData, `${orderCode}_invoice.pdf`);
  
  // Send email with invoice
  const emailContent = emailTemplate({
    link: `${req.protocol}://${req.headers.host}/dashboard`,
    linkData: 'View Your Dashboard',
    subject: 'Payment Confirmation - DecorAI'
  });

  await sendEmailService({
    to: user.email,
    subject: 'Payment Confirmation - DecorAI',
    message: emailContent,
    attachments: [
      {
        filename: `invoice_${orderCode}.pdf`,
        path: invoicePath
      }
    ]
  });

  return res.status(200).json({
    success: true,
    message: 'Payment processed successfully',
    user: {
      email: user.email,
      totalDesignsAvailable: user.totalDesignsAvailable
    }
  });
});


export const handlePaymentCancel = catchError(async (req, res, next) => {
  return res.status(200).json({
    success: false,
    message: 'Payment was cancelled'
  });
});
