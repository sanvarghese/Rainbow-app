import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';
import NextAuth from 'next-auth';
// import { auth } from './auth';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role ?? null;

  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/become-a-seller'
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(
      new URL('/auth/login', req.url)
    );
  }

  if (
    isAuthenticated &&
    isPublicRoute &&
    pathname !== '/become-a-seller'
  ) {
    return NextResponse.redirect(
      new URL(
        userRole === 'merchant'
          ? '/dashboard'
          : '/',
        req.url
      )
    );
  }

  if (
    isAuthenticated &&
    userRole !== 'merchant' &&
    (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/merchant-preview')
    )
  ) {
    return NextResponse.redirect(
      new URL('/', req.url)
    );
  }

  if (
    pathname.startsWith('/api/merchant') &&
    userRole !== 'merchant'
  ) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  if (
    pathname === '/become-a-seller' &&
    userRole === 'merchant'
  ) {
    return NextResponse.redirect(
      new URL('/dashboard', req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|css|js).*)'
  ]
};