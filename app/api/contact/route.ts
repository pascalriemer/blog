import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Function to validate environment variables
function validateEnvVariables() {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`[CRITICAL ERROR] Missing required SMTP environment variables: ${missingVars.join(', ')}`);
    console.error(`Make sure to provide these values in your .env file or Docker environment variables.`);
    console.error(`For Docker Compose, run: cp .env.docker .env && nano .env  # Fill in values, then run docker-compose`);
    return false;
  }
  
  // Check for empty values
  const emptyVars = requiredVars.filter(varName => process.env[varName] === '');
  if (emptyVars.length > 0) {
    console.error(`[CRITICAL ERROR] The following SMTP environment variables are empty: ${emptyVars.join(', ')}`);
    console.error(`Empty values are not allowed. Please set actual values for these variables.`);
    return false;
  }
  
  return true;
}

// Get the configured recipient email from settings
function getRecipientEmail() {
  const SETTINGS_DIR = join(process.cwd(), 'content', 'settings');
  const CONTACT_SETTINGS_FILE = join(SETTINGS_DIR, 'contact.json');
  
  // Default to environment variable if settings file doesn't exist
  if (!existsSync(CONTACT_SETTINGS_FILE)) {
    return process.env.ADMIN_EMAIL || 'pascal@riemer.digital';
  }
  
  try {
    const settings = JSON.parse(readFileSync(CONTACT_SETTINGS_FILE, 'utf8'));
    return settings.contactEmail || process.env.ADMIN_EMAIL || 'pascal@riemer.digital';
  } catch (error) {
    console.error('Error reading contact settings:', error);
    return process.env.ADMIN_EMAIL || 'pascal@riemer.digital';
  }
}

// Create reusable transporter
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } catch (error) {
    console.error('[CRITICAL ERROR] Failed to create email transporter:', error);
    throw error;
  }
};

// Helper function to send an email (internal use only, not exported)
async function sendMailWithNodemailer(mailOptions) {
  if (!validateEnvVariables()) {
    throw new Error('SMTP environment variables not properly configured');
  }
  
  const transporter = createTransporter();
  await transporter.verify();
  return transporter.sendMail(mailOptions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, _honeypot } = body;

    // Anti-spam honeypot check
    if (_honeypot) {
      console.log('Honeypot field filled - rejecting as spam');
      // Return success to the bot but don't actually send the email
      return NextResponse.json(
        { success: true, message: 'Your message has been sent successfully!' },
        { status: 200 }
      );
    }

    // Validate the request
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate that we have all required environment variables
    if (!validateEnvVariables()) {
      console.error('[CRITICAL ERROR] Email sending is disabled due to missing or invalid SMTP configuration');
      return NextResponse.json(
        { error: 'Email sending is currently unavailable due to server configuration issues. Please contact the administrator.' },
        { status: 503 } // Service Unavailable
      );
    }

    // Create transporter
    const transporter = createTransporter();
    
    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('[CRITICAL ERROR] SMTP connection verification failed:', error);
      return NextResponse.json(
        { error: 'Failed to connect to email server. Please try again later or contact the administrator.' },
        { status: 500 }
      );
    }

    // Get the configured recipient email
    const recipientEmail = getRecipientEmail();
    console.log(`Sending contact form email to: ${recipientEmail}`);

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmail,
      subject: `Contact form message from ${name} (${email})`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Message from Your Blog</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #777; font-size: 12px; margin-top: 20px;">This message was sent from the contact form on your blog.</p>
        </div>
      `,
    });
    
    console.log(`Email sent successfully to ${recipientEmail}`);
    
    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully!' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('[ERROR] Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
} 