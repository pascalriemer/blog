import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ab41095dc2874128a50a3c93fb3a032c56781234567890abcdef0123456789ab';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Allow password reset routes
  if (path.startsWith('/admin/reset-password') || path.startsWith('/admin/forgot-password')) {
    return NextResponse.next();
  }
  
  // Protect admin routes
  if (path.startsWith('/admin')) {
    // Skip login route
    if (path === '/admin/login') {
      return NextResponse.next();
    }
    
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 