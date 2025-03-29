import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeInvoice = async (customer, items, metadata = {}) => {
  try {
    // Make sure customer exists in Stripe or create them
    let stripeCustomer;
    
    if (customer.stripeCustomerId) {
      stripeCustomer = customer.stripeCustomerId;
    } else {
      // Create a new customer in Stripe
      const newCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        metadata: {
          userId: customer._id
        }
      });
      stripeCustomer = newCustomer.id;
    }
    
    // Create an invoice item for each product
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: stripeCustomer,
        amount: Math.round(item.finalPrice * 100), // Stripe uses cents
        currency: 'usd', // or your preferred currency
        description: item.title,
      });
    }
    
    // Create and finalize the invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomer,
      auto_advance: true, // auto-finalize and send the invoice
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: {
        orderCode: metadata.orderCode,
        ...metadata
      }
    });
    
    // Send the invoice by email
    await stripe.invoices.sendInvoice(invoice.id);
    
    return {
      invoiceId: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf
    };
  } catch (error) {
    console.error('Error creating Stripe invoice:', error);
    throw error;
  }
};

export const getStripeInvoice = async (invoiceId) => {
  try {
    return await stripe.invoices.retrieve(invoiceId);
  } catch (error) {
    console.error('Error retrieving Stripe invoice:', error);
    throw error;
  }
};
