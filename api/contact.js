const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { firstName, lastName, email, company, subject, message } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create a transporter using standard SMTP (configured in .env)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${firstName} ${lastName}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`, // sender address
      to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER, // list of receivers
      replyTo: email,
      subject: `New Inquiry: ${subject || 'General Inquiry'} - ${company || 'Individual'}`,
      text: `
Name: ${firstName} ${lastName}
Email: ${email}
Company: ${company || 'N/A'}
Subject: ${subject}

Message:
${message}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #173124;">New Quote Inquiry Received</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;"><strong>Name:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;"><strong>Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;"><strong>Company:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;">${company || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;"><strong>Subject:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e4e2e1;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #f6f3f2; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    };

    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
