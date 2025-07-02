import { getFieldFromResult } from './calendar';
import { clearData } from './storage';
import md5 from 'md5';

export async function login(username: string, password: string) {
	let result = await fetch('https://actvn-schedule.cors-ngosangns.workers.dev/login', {
		method: 'GET'
	});

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

	// Get cookies from response headers
	const setCookieHeader = result.headers.get('set-cookie') || result.headers.get('Set-Cookie');

	if (setCookieHeader) {
		return setCookieHeader;
	}

	// If no cookies in headers, try to extract from response text
	const responseText = await result.text();

	// The response text appears to be the cookie value directly
	// Format it as a proper cookie string
	if (responseText && responseText.startsWith('SignIn=')) {
		return responseText;
	}

	return responseText;
}

export function logout() {
	clearData();
}
