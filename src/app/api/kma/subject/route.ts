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

export async function GET(request: NextRequest) {
	try {
		// Extract authentication token from request headers
		const authHeader = request.headers.get('Authorization');
		const cookieHeader = request.headers.get('Cookie');

		let signInToken = '';

		// Check for token in Authorization header first
		if (authHeader && authHeader.startsWith(AUTH_CONFIG.BEARER_PREFIX)) {
			signInToken = authHeader.substring(AUTH_CONFIG.BEARER_PREFIX.length);
		}
		// Fallback to Cookie header
		else if (cookieHeader) {
			signInToken = cookieHeader;
		}

		if (!signInToken) {
			return NextResponse.json(
				{ error: ERROR_MESSAGES.AUTH_TOKEN_REQUIRED },
				{ status: HTTP_STATUS.UNAUTHORIZED }
			);
		}

		// Clean token - remove any potential invalid characters and newlines
		signInToken = signInToken.trim().replace(/[\r\n]/g, '');

		const response = await fetch(`${KMA_CONFIG.BASE_URL}${KMA_CONFIG.PATHS.SUBJECT}`, {
			method: 'GET',
			headers: {
				Cookie: signInToken,
				'User-Agent': DEFAULT_HEADERS.USER_AGENT,
				Accept: DEFAULT_HEADERS.ACCEPT,
				'Accept-Language': DEFAULT_HEADERS.ACCEPT_LANGUAGE,
				'Accept-Encoding': DEFAULT_HEADERS.ACCEPT_ENCODING,
				Connection: DEFAULT_HEADERS.CONNECTION,
				'Upgrade-Insecure-Requests': DEFAULT_HEADERS.UPGRADE_INSECURE_REQUESTS,
				Referer: `${KMA_CONFIG.BASE_URL}${KMA_CONFIG.PATHS.SUBJECT}`
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
		console.error('Error fetching subject data:', error);
		return NextResponse.json(
			{ error: ERROR_MESSAGES.FETCH_SUBJECT_DATA_FAILED },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		// Extract authentication token from request headers
		const authHeader = request.headers.get('Authorization');
		const cookieHeader = request.headers.get('Cookie');

		let signInToken = '';

		// Check for token in Authorization header first
		if (authHeader && authHeader.startsWith(AUTH_CONFIG.BEARER_PREFIX)) {
			signInToken = authHeader.substring(AUTH_CONFIG.BEARER_PREFIX.length);
		}
		// Fallback to Cookie header
		else if (cookieHeader) {
			signInToken = cookieHeader;
		}

		if (!signInToken) {
			return NextResponse.json(
				{ error: ERROR_MESSAGES.AUTH_TOKEN_REQUIRED },
				{ status: HTTP_STATUS.UNAUTHORIZED }
			);
		}

		// Clean token - remove any potential invalid characters and newlines
		signInToken = signInToken.trim().replace(/[\r\n]/g, '');

		const body = await request.text();

		const response = await fetch(`${KMA_CONFIG.BASE_URL}${KMA_CONFIG.PATHS.SUBJECT}`, {
			method: 'POST',
			headers: {
				'Content-Type': CONTENT_TYPES.FORM_URLENCODED,
				Cookie: signInToken,
				'User-Agent': DEFAULT_HEADERS.USER_AGENT,
				Accept: DEFAULT_HEADERS.ACCEPT,
				'Accept-Language': DEFAULT_HEADERS.ACCEPT_LANGUAGE,
				'Accept-Encoding': DEFAULT_HEADERS.ACCEPT_ENCODING,
				Connection: DEFAULT_HEADERS.CONNECTION,
				'Upgrade-Insecure-Requests': DEFAULT_HEADERS.UPGRADE_INSECURE_REQUESTS,
				Origin: KMA_CONFIG.BASE_URL,
				Referer: `${KMA_CONFIG.BASE_URL}${KMA_CONFIG.PATHS.SUBJECT}`
			},
			body: body
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
		console.error('Error posting subject data:', error);
		return NextResponse.json(
			{ error: ERROR_MESSAGES.POST_SUBJECT_DATA_FAILED },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
}
