import CustomError from "../../utilities/customError.js";
import { initializePayment, verifyPayment } from "../../utilities/payment.js";
import { sendEmailService } from "../../services/sendEmail.js";
import createInvoice from "../../utilities/pdfKit.js";
import { emailTemplate } from "../../utilities/emailTemplate.js";
import catchError from "../../middleware/ErrorHandeling.js";
import { userModel } from "../../../Database/models/user.model.js";
import { nanoid } from 'nanoid';
import { Payment } from "../../../Database/models/payment.model.js";

import fs from 'fs';
import path from 'path';

export const paymentPlans = {
  PLAN_1: {
    name: '20 Design Package',
    maxDesigns: 20,
    amount: 9.99,
    description: 'Pay per design (Max 20 designs)'
  },
  PLAN_2: {
    name: '50 Designs Package',
    maxDesigns: 50,
    amount: 199,
    description: '50 Designs Bundle'
  },
  PLAN_3: {
    name: '100 Designs Package',
    maxDesigns: 100,
    amount: 299,
    description: '100 Designs Bundle'
  }
};

export const processPayment = catchError(async (req, res, next) => {
  const { planId } = req.body;
  const planDetails = paymentPlans[planId];
  
  if (!planDetails) {
    return next(new CustomError('Invalid plan ID', 400));
  }

  // Ensure directory exists
  if (!fs.existsSync('./Files')) {
    fs.mkdirSync('./Files', { recursive: true });
  }

  const user = await userModel.findById(req.authUser._id);
  if (!user) {
    return next(new CustomError('User not found', 404));
  }

  const orderCode = `${user.username}_${nanoid(3)}`
  
  // Create line items for Stripe
  const line_items = [
    {
      price_data: {
        currency: 'SAR',
        product_data: {
          name: planDetails.name,
          description: planDetails.description,
        },
        unit_amount: Math.round(planDetails.amount * 100), // Convert to cents
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

  const { userId, planId, orderCode } = session.metadata;
  const planDetails = paymentPlans[planId];

  // Update user's available designs
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new CustomError('User not found', 404));
  }

  user.totalDesignsAvailable += planDetails.maxDesigns;
  // Create a new Payment document instead of embedding it
  const payment = new Payment({
    userId: user._id,
    planId,
    amount: planDetails.amount,
    transactionId: session_id,
    paymentMethod: 'stripe',
    status: 'completed',
    designsCount: planDetails.maxDesigns
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
        price: planDetails.amount,
        quantity: 1,
        finalPrice: planDetails.amount
      }
    ],
    subTotal: planDetails.amount,
    paidAmount: planDetails.amount
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
