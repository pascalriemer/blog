import { NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

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
    const { contactEmail } = body;
    
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
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contact settings updated successfully',
      ...settings
    });
  } catch (error) {
    console.error('Error updating contact settings:', error);
    return NextResponse.json({ error: 'Failed to update contact settings' }, { status: 500 });
  }
} 