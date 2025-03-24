import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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





// async function getPaymentData() {
//   try {
//     const paymentIntents = await stripe.paymentIntents.list({
//         limit: 100, // Limit the number
//     });
//     console.log(paymentIntents.data.length);
    
//     paymentIntents.data.forEach(intent => {
//       console.log(`Payment ID: ${intent.id}`);
//       console.log(`Amount: ${intent.amount_received}`);
//       console.log(`Status: ${intent.status}`);
      
//     });
//   } catch (error) {
//     console.error('Error retrieving payment data:', error);
//   }
// }

// getPaymentData();


// async function getPaymentsByDateRange(startDate, endDate) {
//     try {
//       const paymentIntents = await stripe.paymentIntents.list({
//         created: {
//           gte: Math.floor(startDate / 1000), // Convert to Unix timestamp
//           lte: Math.floor(endDate / 1000), // Convert to Unix timestamp
//         },
//         limit: 10, // Limit the number of results
//       });
  
//       paymentIntents.data.forEach(intent => {
//         console.log(`Payment ID: ${intent.id}`);
//         console.log(`Amount: ${intent.amount_received}`);
//         console.log(`Status: ${intent.status}`);
//       });
//     } catch (error) {
//       console.error('Error retrieving payment data:', error);
//     }
//   }
  
//   const startDate = new Date('2025-01-01').getTime();
//   const endDate = new Date('2025-03-01').getTime();
//   getPaymentsByDateRange(startDate, endDate); 