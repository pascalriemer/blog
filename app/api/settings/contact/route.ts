import { NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'ab41095dc2874128a50a3c93fb3a032c56781234567890abcdef0123456789ab';
const SETTINGS_DIR = join(process.cwd(), 'content', 'settings');
const CONTACT_SETTINGS_FILE = join(SETTINGS_DIR, 'contact.json');

// Ensure settings directory exists
if (!existsSync(SETTINGS_DIR)) {
  mkdirSync(SETTINGS_DIR, { recursive: true });
}

// Initialize settings file if it doesn't exist
if (!existsSync(CONTACT_SETTINGS_FILE)) {
  writeFileSync(
    CONTACT_SETTINGS_FILE,
    JSON.stringify({ 
      contactEmail: process.env.ADMIN_EMAIL || 'pascal@riemer.digital',
      updatedAt: new Date().toISOString()
    }, null, 2),
    'utf8'
  );
}

// Function to validate environment variables for sending test email
function validateEnvVariables() {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`[CRITICAL ERROR] Missing required SMTP environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  // Check for empty values
  const emptyVars = requiredVars.filter(varName => process.env[varName] === '');
  if (emptyVars.length > 0) {
    console.error(`[CRITICAL ERROR] The following SMTP environment variables are empty: ${emptyVars.join(', ')}`);
    return false;
  }
  
  return true;
}

// Create reusable transporter for sending test email
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

// Get settings
export async function GET() {
  try {
    // Check authentication
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Read settings
    const settings = JSON.parse(readFileSync(CONTACT_SETTINGS_FILE, 'utf8'));
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error getting contact settings:', error);
    return NextResponse.json({ error: 'Failed to get contact settings' }, { status: 500 });
  }
}

// Update settings
export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const body = await request.json();
    const { contactEmail, sendTestEmail } = body;
    
    if (!contactEmail) {
      return NextResponse.json({ error: 'Contact email is required' }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Update settings
    const settings = {
      contactEmail,
      updatedAt: new Date().toISOString()
    };
    
    writeFileSync(CONTACT_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    
    // Send test email if requested
    if (sendTestEmail) {
      // Validate SMTP settings
      if (!validateEnvVariables()) {
        return NextResponse.json({ 
          success: true, 
          message: 'Contact settings updated successfully, but could not send test email due to missing SMTP configuration.',
          testEmailSent: false,
          ...settings
        });
      }
      
      try {
        // Create transporter and send test email
        const transporter = createTransporter();
        await transporter.verify();
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: contactEmail,
          subject: 'Test Email - Contact Form Configuration',
          text: 'This is a test email to confirm your contact form configuration is working correctly.',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Contact Form Test Email</h2>
              <p>This is a test email to confirm your contact form configuration is working correctly.</p>
              <p>You are receiving this email because you set <strong>${contactEmail}</strong> as the recipient for contact form submissions.</p>
              <p style="margin-top: 30px; color: #666; font-size: 12px;">This is an automated message from your blog's admin panel.</p>
            </div>
          `,
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Contact settings updated and test email sent successfully.',
          testEmailSent: true,
          ...settings
        });
      } catch (error) {
        console.error('Error sending test email:', error);
        return NextResponse.json({ 
          success: true, 
          message: 'Contact settings updated successfully, but test email could not be sent.',
          testEmailSent: false,
          testEmailError: error instanceof Error ? error.message : 'Unknown error',
          ...settings
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contact settings updated successfully.',
      ...settings
    });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    return NextResponse.json({ error: 'Failed to update contact settings' }, { status: 500 });
  }
} 