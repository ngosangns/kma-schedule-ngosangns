import { getFieldFromResult } from './calendar';
import { clearData } from './storage';
import md5 from 'md5';

export async function login(username: string, password: string): Promise<string> {
	let result = await fetch('/api/kma/login', {
		method: 'GET'
	});

	if (!result || !result.text) {
		throw new Error('Failed to fetch login page');
	}

	const resultText = await result.text();

	const viewState = getFieldFromResult(resultText, '__VIEWSTATE');
	const eventValidation = getFieldFromResult(resultText, '__EVENTVALIDATION');

	const data: Record<string, string> = {
		__VIEWSTATE: viewState || '',
		__EVENTVALIDATION: eventValidation || '',
		txtUserName: username.toUpperCase(),
		txtPassword: md5(password),
		btnSubmit: 'Đăng nhập'
	};

	result = await fetch('/api/kma/login', {
		method: 'POST',
		body: Object.keys(data)
			.map((key: string) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key] || ''))
			.join('&'),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

	if (!result) {
		throw new Error('Failed to authenticate with server');
	}

	if (!result.ok) {
		throw new Error(`Authentication failed with status: ${result.status}`);
	}

	// Get response text (our API returns the token directly)
	const responseText = await result.text();

	// The response text should be the cookie value directly
	if (responseText && responseText.startsWith('SignIn=')) {
		return responseText.trim();
	}

	// If we get here, authentication likely failed
	if (!responseText || responseText.length === 0) {
		throw new Error('Authentication failed - empty response');
	}

	return responseText;
}

export function logout(): void {
	clearData();
}
