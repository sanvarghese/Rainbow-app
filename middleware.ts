import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login', 
    '/auth/signup', 
    '/auth/forgot-password', 
    '/auth/reset-password',
    '/become-a-seller'
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If not authenticated and trying to access protected routes
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If authenticated user tries to access auth pages, redirect appropriately
  if (isAuthenticated && isPublicRoute && pathname !== '/become-a-seller') {
    // Merchants go to dashboard, normal users go to home
    const redirectUrl = userRole === 'Merchant' ? '/dashboard' : '/';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Prevent normal users from accessing merchant routes
  if (isAuthenticated && userRole !== 'Merchant') {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/merchant')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Merchant-only API routes
  if (pathname.startsWith('/api/merchant') && userRole !== 'Merchant') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Allow merchants to access become-a-seller page (for re-registration if needed)
  if (pathname === '/become-a-seller' && userRole === 'Merchant') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|images|css|js).*)'],
};