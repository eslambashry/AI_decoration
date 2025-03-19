import nodemailer from 'nodemailer'

export async function sendEmailService({
  to,
  subject,
  message,
  attachments = [],
} = {}) {
  // configurations  
  const transporter = nodemailer.createTransport({
    host: 'localhost', // stmp.gmail.com
    port: 587, // 587 , 465
    secure: false, // false , true
    service: 'gmail', // optional
    auth: {
      // credentials
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const emailInfo = await transporter.sendMail({
    from: `"Home Designs 🏡"`,
    to: to ? to : '',
    subject: subject ? subject : 'Hello',
    html: message ? message : '',
    attachments,
  })
  if (emailInfo.accepted.length) {
    return true
  }
  return false
}