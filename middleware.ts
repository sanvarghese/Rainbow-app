// import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { auth } from './auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/become-a-seller'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect dashboard and merchant routes
  if (!isAuthenticated && (pathname.startsWith('/dashboard') || pathname.startsWith('/api/merchant'))) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Merchant-only routes
  if (pathname.startsWith('/api/merchant') && userRole !== 'Merchant') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};