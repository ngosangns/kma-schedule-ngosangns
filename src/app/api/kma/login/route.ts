import { NextRequest, NextResponse } from 'next/server';
import {
	KMA_CONFIG,
	DEFAULT_HEADERS,
	CACHE_HEADERS,
	CONTENT_TYPES,
	ERROR_MESSAGES,
	HTTP_STATUS,
	AUTH_CONFIG
} from '@/lib/constants/api';

export async function GET() {
	try {
		const response = await fetch(`${KMA_CONFIG.BASE_URL}${KMA_CONFIG.PATHS.LOGIN}`, {
			method: 'GET',
			headers: {
				'User-Agent': DEFAULT_HEADERS.USER_AGENT,
				Accept: DEFAULT_HEADERS.ACCEPT,
				'Accept-Language': DEFAULT_HEADERS.ACCEPT_LANGUAGE,
				'Accept-Encoding': DEFAULT_HEADERS.ACCEPT_ENCODING,
				Connection: DEFAULT_HEADERS.CONNECTION,
				'Upgrade-Insecure-Requests': DEFAULT_HEADERS.UPGRADE_INSECURE_REQUESTS
			}
		});

		if (!response.ok) {
			throw new Error(`${ERROR_MESSAGES.INVALID_KMA_RESPONSE}: ${response.status}`);
		}

		const html = await response.text();

		return new NextResponse(html, {
			status: HTTP_STATUS.OK,
			headers: {
				'Content-Type': CONTENT_TYPES.HTML,
				...CACHE_HEADERS.NO_CACHE
			}
		});
	} catch (error) {
		console.error('Error fetching login page:', error);
		return NextResponse.json(
			{ error: ERROR_MESSAGES.FETCH_LOGIN_PAGE_FAILED },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.text();

		const response = await fetch(`${KMA_CONFIG.BASE_URL}${KMA_CONFIG.PATHS.LOGIN}`, {
			method: 'POST',
			headers: {
				'Content-Type': CONTENT_TYPES.FORM_URLENCODED,
				'User-Agent': DEFAULT_HEADERS.USER_AGENT,
				Origin: KMA_CONFIG.BASE_URL.slice(0, -1), // Remove trailing slash
				Referer: `${KMA_CONFIG.BASE_URL}${KMA_CONFIG.PATHS.LOGIN}`
			},
			body: body,
			redirect: 'manual' // Don't follow redirects automatically
		});

		// Check for Set-Cookie header first (similar to proxy logic)
		const setCookieHeader = response.headers.get('Set-Cookie');

		if (setCookieHeader) {
			const tokenMatch = setCookieHeader.match(AUTH_CONFIG.COOKIE_PATTERN);
			if (tokenMatch && tokenMatch.length > 1) {
				// Return the full cookie string (SignIn=value;) to match expected format
				return new NextResponse(tokenMatch[0], {
					status: HTTP_STATUS.OK,
					headers: {
						'Content-Type': CONTENT_TYPES.PLAIN_TEXT
					}
				});
			}
		}

		// If no cookie found, return the response as-is
		const responseText = await response.text();
		return new NextResponse(responseText, {
			status: response.status,
			headers: {
				'Content-Type': response.headers.get('Content-Type') || CONTENT_TYPES.HTML
			}
		});
	} catch (error) {
		console.error('Error during login:', error);
		return NextResponse.json(
			{ error: ERROR_MESSAGES.AUTHENTICATION_FAILED },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
}
