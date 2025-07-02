import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/about', '/changelogs'];

// Define protected routes that require authentication
const protectedRoutes = ['/calendar'];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the current path is a public route
	const isPublicRoute = publicRoutes.includes(pathname);
	const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

	// For now, we'll let the client-side handle authentication
	// since we're using localStorage for session management
	// In a production app, you might want to use cookies and validate them here

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
