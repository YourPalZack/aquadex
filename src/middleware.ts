import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/contact-us',
  '/for-fishkeepers',
  '/for-brands-stores',
  '/for-breeders-sellers',
  '/sitemap',
];

// Define routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Allow public routes
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next();
  }
  
  // Check authentication status
  const useMockData = process.env.USE_MOCK_DATA !== 'false';
  let isAuthenticated = false;
  
  if (useMockData) {
    // In mock mode, always authenticated with demo user
    isAuthenticated = true;
  } else {
    // Check Supabase session from cookie
    const supabaseToken = request.cookies.get('sb-access-token');
    isAuthenticated = !!supabaseToken;
  }
  
  // If on auth route and already authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If on protected route and not authenticated, redirect to signin
  if (!isPublicRoute && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
