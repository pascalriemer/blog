import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate the request
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, you would send an email here using:
    // - Nodemailer with SMTP
    // - SendGrid API
    // - Amazon SES
    // - or another email sending service
    
    // For educational/setup purposes, here's how you would implement this with Nodemailer:
    /*
    // Example implementation with Nodemailer (would require appropriate npm packages)
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'contact@yourblog.com',
      to: 'pascal@riemer.digital',
      subject: `Contact form message from ${name} (${email})`,
      text: message,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    */
    
    // For now, let's log the message for testing
    console.log('Contact form submission:', { name, email, message });
    
    // Simulate a delay like a real email sending would have
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(
      { success: true, message: 'Message sent successfully!' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 