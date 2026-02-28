import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Use Node.js runtime for middleware (required for jsonwebtoken)
export const runtime = 'nodejs';

const publicRoutes = ['/login', '/api/health', '/api/auth/login', '/api/auth/logout'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow admin routes - they will check auth internally
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow API routes - they will check auth internally
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check auth token for protected routes
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Simple JWT validation (base64 decode to get payload)
  // This avoids using jsonwebtoken in edge runtime
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Decode payload (base64url)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
