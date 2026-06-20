const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  // Direct Google SMTP IPv4 to bypass IPv6 routing issues on Render
  host: process.env.SMTP_HOST || '74.125.68.108',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 15000, 
  greetingTimeout: 15000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com' 
  }
});

const sendEmail = async (to, subject, text, html) => {
  const fromName = process.env.SMTP_FROM || 'Hệ thống Khảo sát Trường Học <no-reply@edu-survey.vn>';
  const mailOptions = {
    from: fromName,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Success to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email Failed] Error sending to ${to}:`, error.message);
    return false;
  }
};

module.exports = {
  transporter,
  sendEmail
};
