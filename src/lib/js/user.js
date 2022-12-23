import $ from 'jquery';
import { getFieldFromResult } from './calendar';
import { clearData } from './storage';
import md5 from 'md5';

/**
 * return SignIn token
 * @param {*} username
 * @param {*} password
 */
export async function login(username, password) {
	let result = await /** @type {any} */ ($).ajax({
		url: 'https://actvn-schedule.cors-ngosangns.workers.dev/login',
		method: 'GET'
	});

	let viewState = getFieldFromResult(result, '__VIEWSTATE');
	let eventValidation = getFieldFromResult(result, '__EVENTVALIDATION');

	/** @type {*} */
	let data = {
		__VIEWSTATE: viewState,
		__EVENTVALIDATION: eventValidation,
		txtUserName: username.toUpperCase(),
		txtPassword: md5(password),
		btnSubmit: 'Đăng nhập'
	};

	result = await fetch('https://actvn-schedule.cors-ngosangns.workers.dev/login', {
		method: 'POST',
		body: Object.keys(data)
			.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
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
