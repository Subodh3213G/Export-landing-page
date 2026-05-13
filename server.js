require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Serve static files from the current directory
app.use(express.static(__dirname));

// Explicit fallback for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// The API endpoint for the contact form
app.post('/api/contact', async (req, res) => {
  console.log("📥 Received contact form submission!");
  console.log("Data received:", req.body);
  
  const { firstName, lastName, email, company, subject, message } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !message) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ message: 'Missing required fields' });
  }

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

    const mailOptions = {
      from: `"${firstName} ${lastName}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `New Inquiry: ${subject || 'General Inquiry'} - ${company || 'Individual'}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nSubject: ${subject}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`✅ Local dev server running perfectly!`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser.`);
  console.log(`==========================================\n`);
});
