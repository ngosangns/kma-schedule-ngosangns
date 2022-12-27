import $ from 'jquery';
import { getFieldFromResult } from './calendar';
import { clearData } from './storage';
import md5 from 'md5';

export async function login(username: string, password: string) {
	let result = await $.ajax({
		url: 'https://actvn-schedule.cors-ngosangns.workers.dev/login',
		method: 'GET'
	});

	const viewState = getFieldFromResult(result, '__VIEWSTATE');
	const eventValidation = getFieldFromResult(result, '__EVENTVALIDATION');

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
	return await result.text();
}

export function logout() {
	clearData();
}
