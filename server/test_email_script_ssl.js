require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'rodge.tonacao@gmail.com',
  subject: 'Test Email - Northomes Pensionne',
  text: 'This is a test email using port 465.'
};

console.log('Sending test email to rodge.tonacao@gmail.com using port 465...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Test email failed:', error);
  } else {
    console.log('Test email sent successfully:', info.response);
  }
});
