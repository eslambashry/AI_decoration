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

// Function to fetch account balance
export const getAccountBalance = async () => {
    try {
        const balance = await stripe.balance.retrieve();

        // Extract available and pending balances
        const availableBalance = balance.available.reduce((total, entry) => {
            return total + entry.amount;
        }, 0);

        const pendingBalance = balance.pending.reduce((total, entry) => {
            return total + entry.amount;
        }, 0);

        return {
            availableBalance: availableBalance / 100, // Convert to currency units
            pendingBalance: pendingBalance / 100,     // Convert to currency units
        };
    } catch (error) {
        console.error('Error fetching account balance:', error);
        throw new Error('Failed to fetch account balance');
    }
};

// Function to calculate payment metrics with currency grouping
export const calculatePaymentMetrics = async ({ startDate, endDate } = {}) => {
    try {
        const paymentIntents = await stripe.paymentIntents.list({
            created: {
                gte: startDate ? Math.floor(startDate / 1000) : undefined,
                lte: endDate ? Math.floor(endDate / 1000) : undefined,
            },
            limit: 100, // Adjust as needed
        });

        // Filter only successful payments
        const successfulPayments = paymentIntents.data.filter(intent => intent.status === 'succeeded');

        // Group payments by currency and calculate totals
        const groupedPayments = {};
        let totalPaymentsInUSD = 0;

        successfulPayments.forEach(intent => {
            const currency = intent.currency.toUpperCase();
            const amount = intent.amount_received / 100; // Convert to currency units

            if (!groupedPayments[currency]) {
                groupedPayments[currency] = {
                    totalAmount: 0,
                    totalCount: 0,
                };
            }

            groupedPayments[currency].totalAmount += amount;
            groupedPayments[currency].totalCount += 1;

            // Convert to USD (example exchange rates)
            const exchangeRate = getExchangeRate(currency); // Custom function to get exchange rate
            totalPaymentsInUSD += amount * exchangeRate;
        });

        return {
            groupedPayments,
            totalPaymentsInUSD: totalPaymentsInUSD.toFixed(2), // Total payments in USD
        };
    } catch (error) {
        console.error('Error calculating payment metrics:', error);
        throw new Error('Failed to calculate payment metrics');
    }
};

// Helper function to get exchange rates (example values)
function getExchangeRate(currency) {
    const exchangeRates = {
        USD: 1,         // Base currency
        AED: 0.27,      // 1 AED = 0.27 USD
        SAR: 0.27,      // 1 SAR = 0.27 USD
        EUR: 1.1,       // 1 EUR = 1.1 USD
        GBP: 1.25,      // 1 GBP = 1.25 USD
    };

    return exchangeRates[currency] || 1; // Default to 1 if currency not found
}
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