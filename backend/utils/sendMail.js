import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Validate email configuration
const validateEmailConfig = () => {
  const required = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Email service not configured. Missing: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

const isConfigured = validateEmailConfig();

// Create transporter only if configured
let transporter = null;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });

  // Verify connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service connection failed:', error.message);
    } else {
      console.log('✅ Email service ready');
    }
  });
}

export const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn('⚠️  Email not sent - service not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const msg = {
      from: `"${process.env.MAIL_FROM_NAME || 'Rent Management'}" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(msg);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
};

// Helper function to send rent reminder
export const sendRentReminder = async (tenant, rentDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Rent Payment Reminder</h2>
      <p>Dear ${tenant.name},</p>
      <p>This is a friendly reminder that your rent payment is due.</p>
      
      <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${rentDetails.amount}</p>
        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(rentDetails.dueDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Month:</strong> ${rentDetails.month}</p>
      </div>
      
      <p>Please make the payment at your earliest convenience to avoid late fees.</p>
      <p>Thank you,<br/>Rent Management Team</p>
    </div>
  `;

  return sendMail({
    to: tenant.email,
    subject: `Rent Payment Reminder - ${rentDetails.month}`,
    html
  });
};

// Helper function to send payment confirmation
export const sendPaymentConfirmation = async (tenant, payment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">✅ Payment Received</h2>
      <p>Dear ${tenant.name},</p>
      <p>We have successfully received your rent payment.</p>
      
      <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${payment.amount}</p>
        <p style="margin: 5px 0;"><strong>Payment Date:</strong> ${new Date(payment.paidOn).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Method:</strong> ${payment.method}</p>
        <p style="margin: 5px 0;"><strong>Month:</strong> ${payment.month}</p>
      </div>
      
      <p>Thank you for your payment!</p>
      <p>Best regards,<br/>Rent Management Team</p>
    </div>
  `;

  return sendMail({
    to: tenant.email,
    subject: `Payment Confirmation - ${payment.month}`,
    html
  });
};

// Helper function for welcome email
export const sendWelcomeEmail = async (tenant) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Welcome to Rent Management!</h2>
      <p>Dear ${tenant.name},</p>
      <p>Your tenant account has been successfully created.</p>
      
      <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Room Number:</strong> ${tenant.roomNumber || 'To be assigned'}</p>
        <p style="margin: 5px 0;"><strong>Monthly Rent:</strong> ₹${tenant.rentAmount || 'To be set'}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${tenant.email}</p>
      </div>
      
      <p>You can now log in to view your rent payments, file complaints, and more.</p>
      <p>Welcome aboard!<br/>Rent Management Team</p>
    </div>
  `;

  return sendMail({
    to: tenant.email,
    subject: 'Welcome to Rent Management System',
    html
  });
};
