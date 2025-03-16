import Stripe from "stripe";
import { nanoid } from 'nanoid';

export const initializePayment = async({
    payment_method_types=['card'],
    mode='payment',
    customer_email = '',
    metadata = {},
    success_url,
    cancel_url,
    discounts = [],
    line_items=[]
}) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentData = await stripe.checkout.sessions.create({
        payment_method_types,
        mode,
        customer_email,
        metadata,
        success_url,
        cancel_url,
        discounts,
        line_items
    });
    
    return paymentData;
};

export const verifyPayment = async (sessionId) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
        success: session.payment_status === 'paid',
        session
    };
};
