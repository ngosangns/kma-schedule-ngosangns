import { getFieldFromResult } from './calendar';
import { clearData } from './storage';
import md5 from 'md5';

export async function login(username: string, password: string) {
	let result = await fetch('https://actvn-schedule.cors-ngosangns.workers.dev/login', {
		method: 'GET'
	});

	if (!result || !result.text) {
		throw new Error('Failed to fetch login page');
	}

	const resultText = await result.text();

	const viewState = getFieldFromResult(resultText, '__VIEWSTATE');
	const eventValidation = getFieldFromResult(resultText, '__EVENTVALIDATION');

	const data: any = {
		__VIEWSTATE: viewState,
		__EVENTVALIDATION: eventValidation,
		txtUserName: username.toUpperCase(),
		txtPassword: md5(password),
		btnSubmit: 'Đăng nhập'
	};

	result = await fetch('https://actvn-schedule.cors-ngosangns.workers.dev/login', {
		method: 'POST',
		body: Object.keys(data)
			.map(
				(key: string) =>
					encodeURIComponent(key) + '=' + encodeURIComponent(key in data ? data[key] : '')
			)
			.join('&'),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

	if (!result || !result.headers) {
		throw new Error('Failed to authenticate with server');
	}

	// Get cookies from response headers
	const setCookieHeader = result.headers.get('set-cookie') || result.headers.get('Set-Cookie');

	if (setCookieHeader) {
		return setCookieHeader;
	}

	// If no cookies in headers, try to extract from response text
	if (!result.text) {
		throw new Error('Invalid response from server');
	}

	const responseText = await result.text();

	// The response text appears to be the cookie value directly
	// Format it as a proper cookie string
	if (responseText && responseText.startsWith('SignIn=')) {
		return responseText;
	}

	// If we get here, authentication likely failed
	if (!responseText || responseText.length === 0) {
		throw new Error('Authentication failed - empty response');
	}

	return responseText;
}

export function logout() {
	clearData();
}
