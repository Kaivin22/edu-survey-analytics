const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_PORT == 465 || !process.env.SMTP_PORT), 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 15000, 
  greetingTimeout: 15000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, text, html) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    console.log(`[Email] Sending email to ${to} using Resend API...`);
    try {
      // If SMTP_FROM is set, we use it, otherwise default to onboarding@resend.dev
      const fromEmail = process.env.SMTP_FROM || 'ĐBCL - Đại học Kiến trúc Đà Nẵng <onboarding@resend.dev>';
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          html: html || text,
          text: text
        })
      });

      const resData = await response.json();
      if (response.ok) {
        console.log(`[Email Sent via Resend] Success to ${to}, ID: ${resData.id}`);
        return true;
      } else {
        console.error(`[Email Failed via Resend] Error:`, resData);
      }
    } catch (error) {
      console.error(`[Email Error via Resend] Fetch error:`, error.message);
    }
  }

  // Fallback to Nodemailer SMTP
  console.log(`[Email] Falling back to Nodemailer SMTP for ${to}...`);
  const fromName = process.env.SMTP_FROM || '"Hệ thống Khảo sát Trường Học" <no-reply@edu-survey.vn>';
  const mailOptions = {
    from: fromName,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent via SMTP] Success to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email Failed via SMTP] Error sending to ${to}:`, error.message);
    return false;
  }
};

module.exports = {
  transporter,
  sendEmail
};
