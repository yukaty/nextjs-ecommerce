import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AUTH_TOKEN } from '@/lib/auth';

// List of pages that require authentication
const authPages = [
  '/account', // My Account page
  '/account/edit', // Member edit page
  '/account/orders', // Order history page
  '/account/password', // Password change page
  '/account/favorites', // Favorites page
  '/order-confirm', // Order confirmation page
];

// Admin-only pages list
const adminPages = [
  '/admin/products', // Admin product list page
  '/admin/products/register', // Admin product registration page
  '/admin/inquiries', // Admin inquiry list page
];

// Middleware executed when receiving requests
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current URL path matches any protected pages
  const isProtected = [...authPages, ...adminPages].some((path) =>
    pathname.startsWith(path)
  );

  // Allow request if it's not a protected page
  if (!isProtected) return NextResponse.next();

  // Get token from cookies
  const token = request.cookies.get(AUTH_TOKEN)?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  // Get user information and verify token
  const user = await verifyToken(token);
  if (!user) {
    return redirectToLogin(request);
  }

  // For admin page requests, check if user has admin privileges
  if (adminPages.some((path) => pathname.startsWith(path))) {
    if (!user.isAdmin) {
      return redirectToLogin(request);
    }
  }

  // All checks passed: allow request
  return NextResponse.next();
}

// Redirect to login page
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

