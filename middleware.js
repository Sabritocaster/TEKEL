import { NextResponse } from 'next/server';

export function middleware(req) {
  const pathname = req.nextUrl.pathname;

  const hasSession =
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token');

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (!hasSession && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/:path*',
    '/stock-movements/:path*',
    '/reports/:path*',
    '/audit-logs/:path*',
    '/login',
  ],
};
