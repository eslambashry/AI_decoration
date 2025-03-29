import PDFDocument from 'pdfkit'
import { Buffer } from 'buffer'

function createInvoice(invoice, pathVar) {
  return new Promise((resolve, reject) => {
    try {
      // Create a buffer to store the PDF instead of writing to filesystem
      const buffers = [];
      let doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      // Collect PDF data chunks
      doc.on('data', buffers.push.bind(buffers));
      
      // Resolve with the complete PDF buffer when done
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      generateHeader(doc);
      generateCustomerInformation(doc, invoice);
      generateInvoiceTable(doc, invoice);
      generateFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateHeader(doc) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .fillColor('#09c')
    .fontSize(10)
    .text('Home Design', 200, 50, { align: 'right' })
    .text('Al Shohada Road', 200, 65, { align: 'right' })
    .text('Compass Bulding,FDBC2003', 200, 80, { align: 'right' })
    .text('Emirate of Ras Al Khaimah', 200, 95, { align: 'right' })
    .text('United Arab Emirates', 200, 110, { align: 'right' })
    .moveDown()
}


function generateCustomerInformation(doc, invoice) {
  doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160)

  generateHr(doc, 185)

  const customerInformationTop = 200

  doc
    .fontSize(10)
    .text('Order Code:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.orderCode, 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 30)
    .text(formatDate(new Date(invoice.date)), 150, customerInformationTop + 30)
    .font('Helvetica-Bold')
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font('Helvetica')
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    // .text(
    //   invoice.shipping.city +
    //     ', ' +
    //     invoice.shipping.state +
    //     ', ' +
    //     invoice.shipping.country,
    //   300,
    //   customerInformationTop + 30,
    // )
    .moveDown()

  generateHr(doc, 252)
}

function generateInvoiceTable(doc, invoice) {
  let i
  const invoiceTableTop = 330

  doc.font('Helvetica-Bold')
  generateTableRow(
    doc,
    invoiceTableTop,
    'Designs',
    'Unit Cost',
    'Plan',
    'Line Total',
  )
  generateHr(doc, invoiceTableTop + 20)
  doc.font('Helvetica')

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i]
    const position = invoiceTableTop + (i + 1) * 30
    generateTableRow(
      doc,
      position,
      item.title, // product title
      formatCurrency(item.price, invoice.currency),
      item.quantity, // product quantity
      formatCurrency(item.finalPrice, invoice.currency)
    )

    generateHr(doc, position + 20)
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    'Subtotal',
    '',
    formatCurrency(invoice.subTotal, invoice.currency)
  )

  const paidToDatePosition = subtotalPosition + 20
  generateTableRow(
    doc,
    paidToDatePosition,
    '',
    '',
    'Paid Amount',
    '',
    formatCurrency(invoice.paidAmount, invoice.currency)
  )

  doc.font('Helvetica')
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      'Thank you for your purchase. Enjoy your AI decoration designs!',
      50,
      780,
      { align: 'center', width: 500 },
    )
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal,
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: 'right' })
    .text(quantity, 370, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' })
}

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke()
}

function formatCurrency(amount, currencyCode) {
  const currencySymbols = {
    'USD': '$',
    'SAR': 'SAR',
    'AED': 'AED',
    // Add more currencies as needed
  };

  const symbol = currencySymbols[currencyCode] || currencyCode;
  
  // If the symbol is at the beginning (like $)
  if (['$', 'SAR', 'AED'].includes(symbol)) {
    return symbol + amount;
  }
  
  // If the symbol is at the end (like SAR)
  return amount + ' ' + symbol;
}


function formatDate(date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  return year + '/' + month + '/' + day
}

export default createInvoice
