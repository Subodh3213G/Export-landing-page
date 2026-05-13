require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Testing email configuration...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("Verifying connection...");
    await transporter.verify();
    console.log("Connection verified successfully!");

    console.log("Attempting to send a test email...");
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.RECEIVER_EMAIL,
      subject: "Test Email from Node.js",
      text: "If you are reading this, the email configuration works!"
    });

    console.log("Test email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("FAILED to send email. Error details:");
    console.error(error);
  }
}

testEmail();
