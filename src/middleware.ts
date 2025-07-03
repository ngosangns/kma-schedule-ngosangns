import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
	// For now, we'll let the client-side handle authentication
	// since we're using localStorage for session management
	// In a production app, you might want to use cookies and validate them here

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
		'/((?!api|_next/static|_next/image|favicon.ico).*)'
	]
};
