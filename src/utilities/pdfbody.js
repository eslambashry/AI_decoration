import fs from 'fs'
import PDFDocument from 'pdfkit'
import path from 'path'
import axios from 'axios' // You'll need to install this: npm install axios

async function createInvoice(invoice, pathVar) {
  let doc = new PDFDocument({ size: 'A4', margin: 50 })

  // Create the directory if it doesn't exist
  const dirPath = path.resolve('./Files');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  await generateHeader(doc)
  generateCustomerInformation(doc, invoice)
  generateInvoiceTable(doc, invoice)
  generateFooter(doc)

  doc.end()
  doc.pipe(fs.createWriteStream(path.resolve(`./Files/${pathVar}`)))
 
  return path.resolve(`./Files/${pathVar}`)
}

async function generateHeader(doc) {
  try {
    // Fetch the image from the URL
    const response = await axios.get('https://ik.imagekit.io/xztnqpqpz/Roomo/Blogs/2vn3b/logo_1ZxKJpMde.PNG', {
      responseType: 'arraybuffer'
    });
    
    // Use the image data directly
    doc.image(response.data, 50, 45, { width: 100 });
  } catch (error) {
    console.error('Error loading logo:', error);
    // Continue without the logo if there's an error
  }

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
      formatCurrency(item.price), // product price
      item.quantity, // product quantity
      formatCurrency(item.finalPrice), // product final price
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
    formatCurrency(invoice.subTotal), // orderSubTotal
  )

  const paidToDatePosition = subtotalPosition + 20
  generateTableRow(
    doc,
    paidToDatePosition,
    '',
    '',
    'Paid Amount',
    '',
    formatCurrency(invoice.paidAmount), // orderPaidAmount
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

function formatCurrency(cents) {
  return cents + ' SAR'
}

function formatDate(date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  return year + '/' + month + '/' + day
}

export default createInvoice
