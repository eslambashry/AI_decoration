import PDFDocument from 'pdfkit'
import { sendEmailService } from '../services/sendEmail.js'

// Modified function that returns a buffer instead of saving to filesystem
function createInvoice(invoice) {
  return new Promise((resolve, reject) => {
    let doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    
    // Collect PDF data in memory
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    doc.end();
  });
}

// In your function that handles the invoice generation and email sending
async function sendInvoiceEmail(user, invoice) {
  try {
    // Generate the PDF as a buffer
    const pdfBuffer = await createInvoice(invoice);
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Your Invoice</h2>
        <p>Dear ${user.username},</p>
        <p>Thank you for your purchase. Please find your invoice attached to this email.</p>
        <p>Order Code: ${invoice.orderCode}</p>
        <p>Amount: ${formatCurrency(invoice.paidAmount)}</p>
        <p>Date: ${formatDate(new Date(invoice.date))}</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Home Design Team</p>
      </div>
    `;
    
    // Send email with PDF attachment
    const emailSent = await sendEmailService({
      to: user.email,
      subject: "Your Invoice from Home Design",
      message: emailContent,
      attachments: [
        {
          filename: `invoice_${invoice.orderCode}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    
    return emailSent;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error;
  }
}

// Helper functions
function formatCurrency(cents) {
  return cents + ' SAR';
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return year + '/' + month + '/' + day;
}

export { createInvoice, sendInvoiceEmail };
