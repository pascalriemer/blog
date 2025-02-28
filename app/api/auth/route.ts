import { NextResponse } from 'next/server';
import { sign, verify } from 'jsonwebtoken';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

// Helper to hash password with the same algorithm as our setup script
function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
}

// Environment variables with defaults (same as in .env.docker)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'c73af9b33462f0ec13447ac89c70f9b72cb34ea95459d8979e19da83d188e8024db4d9d13a40c583a6489eb16af7cb57a66e0e73d51be31098b2459a33add77d';
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || 'c5eb0c1abcdef098765432109876fedcba';
const JWT_SECRET = process.env.JWT_SECRET || 'ab41095dc2874128a50a3c93fb3a032c56781234567890abcdef0123456789ab';

// Email sending helper function (similar to the one in contact/route.ts)
async function sendEmail(options: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Send email
  return transporter.sendMail(options);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, password, token, newPassword } = body;
    
    // Handle different authentication actions
    switch (action) {
      case 'login':
        return handleLogin(username, password);
      
      case 'reset-request':
        return handleResetRequest(username);
        
      case 'reset-password':
        return handleResetPassword(token, newPassword);
        
      case 'change-password':
        return handleChangePassword(username, password, newPassword);
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

async function handleLogin(username: string, password: string) {
  if (username !== ADMIN_USERNAME) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  const hashedPassword = hashPassword(password, ADMIN_PASSWORD_SALT);
  
  if (hashedPassword !== ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Create JWT token
  const token = sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  
  // Set HTTP-only cookie
  cookies().set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  
  return NextResponse.json({ 
    success: true,
    message: 'Authentication successful',
    user: { username, role: 'admin' }
  });
}

async function handleResetRequest(username: string) {
  // Verify it's the admin username
  if (username !== ADMIN_USERNAME) {
    // Don't leak information - always return success
    return NextResponse.json({ 
      success: true,
      message: 'If the account exists, a password reset email has been sent' 
    });
  }
  
  // Generate reset token (valid for 1 hour)
  const resetToken = sign({ username, purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
  
  // In a production system, we would store this token in a database
  // For this implementation, we'll use the token directly in the reset link
  
  // Get the email configuration
  const smtpFrom = process.env.SMTP_FROM;
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password/${resetToken}`;
  
  // Send email with reset link using our email sending function
  try {
    await sendEmail({
      from: smtpFrom || 'noreply@example.com',
      to: 'pascal@riemer.digital', // Sends to blog owner - in a real system, this would be the user's email
      subject: 'Password Reset Request',
      text: `You requested a password reset for your blog admin account. Click this link to reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Blog Admin Password Reset</h2>
          <p>You requested a password reset for your blog admin account.</p>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4a7bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'If the account exists, a password reset email has been sent' 
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}

async function handleResetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  try {
    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { username: string, purpose: string };
    
    if (decoded.purpose !== 'reset' || decoded.username !== ADMIN_USERNAME) {
      throw new Error('Invalid reset token');
    }
    
    // Generate new password hash
    const hashedPassword = hashPassword(newPassword, ADMIN_PASSWORD_SALT);
    
    // In a real application, we would update the password in the database
    // For this implementation, we'll log the new hash that should be updated in .env
    console.log('New password hash generated:', hashedPassword);
    console.log('Update your .env file with this new ADMIN_PASSWORD_HASH value');
    
    return NextResponse.json({ 
      success: true,
      message: 'Password updated successfully. The admin will need to update the .env file with the new hash.' 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
  }
}

async function handleChangePassword(username: string, currentPassword: string, newPassword: string) {
  // Verify current username and password
  if (username !== ADMIN_USERNAME) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  const hashedCurrentPassword = hashPassword(currentPassword, ADMIN_PASSWORD_SALT);
  
  if (hashedCurrentPassword !== ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Generate new password hash
  const hashedNewPassword = hashPassword(newPassword, ADMIN_PASSWORD_SALT);
  
  // In a real application, we would update the password in the database
  // For this implementation, we'll log the new hash that should be updated in .env
  console.log('New password hash generated:', hashedNewPassword);
  console.log('Update your .env file with this new ADMIN_PASSWORD_HASH value');
  
  return NextResponse.json({ 
    success: true,
    message: 'Password updated successfully. Update your .env file with the new password hash.',
    passwordHash: hashedNewPassword
  });
} 