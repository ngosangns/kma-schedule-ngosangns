// @ts-nocheck
import { createInlineWorker } from './worker';
import moment from 'moment';
import { MainFormData, ProcessedCalendarData, SemesterData } from '@/types';

export async function fetchCalendarWithPost(
	formObj: MainFormData,
	signInToken: string
): Promise<string> {
	// Validate token
	if (!signInToken || typeof signInToken !== 'string') {
		throw new Error('Invalid signInToken provided');
	}

	// Clean token - remove any potential invalid characters and newlines
	const cleanToken = signInToken.trim().replace(/[\r\n]/g, '');

	// Validate clean token
	if (!cleanToken || cleanToken.length === 0) {
		throw new Error('Token is empty after cleaning');
	}

	// Ensure token doesn't contain invalid characters for HTTP headers
	if (!/^[a-zA-Z0-9=;._-]+$/.test(cleanToken)) {
		throw new Error('Token contains invalid characters');
	}

	const response = await fetch('/api/kma/subject', {
		method: 'POST',
		body: Object.keys(formObj)
			.map((key) => {
				return encodeURIComponent(key) + '=' + encodeURIComponent(formObj[key] || '');
			})
			.join('&'),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${cleanToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.text();
}

export async function fetchCalendarWithGet(signInToken: string): Promise<string> {
	// Validate token
	if (!signInToken || typeof signInToken !== 'string') {
		throw new Error('Invalid signInToken provided');
	}

	// Clean token - remove any potential invalid characters and newlines
	const cleanToken = signInToken.trim().replace(/[\r\n]/g, '');

	// Validate clean token
	if (!cleanToken || cleanToken.length === 0) {
		throw new Error('Token is empty after cleaning');
	}

	// Ensure token doesn't contain invalid characters for HTTP headers
	if (!/^[a-zA-Z0-9=;._-]+$/.test(cleanToken)) {
		throw new Error('Token contains invalid characters');
	}

	const response = await fetch('/api/kma/subject', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${cleanToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.text();
}

export function getFieldFromResult(result: string, field: string): string | false {
	const matches = result.match(new RegExp('id="' + field + '" value="(.+?)"', 'g'));
	if (!matches || !matches.length) return false;

	const firstMatch = matches[0];
	const valueMatch = firstMatch.match(/value="(.+?)"/);
	if (!valueMatch || !valueMatch.length) return false;

	return valueMatch[1] || false;
}

function stripHTMLTags(str: string | null | false): string {
	if (str === null || str === false) return '';
	return str.toString().replace(/<[^>]*>/g, '');
}

export function filterTrashInHtml(html: string): string {
	let result = html;
	result = result.replace(/src="(.+?)"/g, '');
	return result;
}

export function cleanFromHTMLtoArray(raw_tkb: string): string[][] | false {
	if (!raw_tkb || !raw_tkb.length) return false;

	// remove trash and catch table from html string
	raw_tkb = raw_tkb.replace(/ {2,}/gm, ' ');
	raw_tkb = raw_tkb.replace(/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/gm, '');
	const raw_tkb_matched = raw_tkb.match(/<table.+?gridRegistered.+?<\/table>/g);
	if (raw_tkb_matched && raw_tkb_matched.length) raw_tkb = raw_tkb_matched[0];

	// convert response to DOM then export the table to array
	if (typeof document === 'undefined') {
		throw new Error('DOM operations not available on server side');
	}

	const tempDiv = document.createElement('div');
	tempDiv.id = 'cleanTKB';
	tempDiv.style.display = 'none';
	tempDiv.innerHTML = raw_tkb;
	document.body.appendChild(tempDiv);

	const data_content_temp: string[][] = Array.prototype.map.call(
		tempDiv.querySelectorAll('#gridRegistered tr'),
		(tr: HTMLTableRowElement) =>
			Array.prototype.map.call(tr.querySelectorAll('td'), (td: HTMLTableCellElement) =>
				stripHTMLTags(td.innerHTML)
			)
	) as string[][];
	document.body.removeChild(tempDiv);

	// check null
	if (!data_content_temp) return false;

	return data_content_temp;
}

export function processStudent(rawHtml: string): string {
	const studentMatches = rawHtml.match(/<span id="lblStudent">(.+?)<\/span/g);
	if (studentMatches && studentMatches.length) {
		const studentMatch = studentMatches[0].match(/<span id="lblStudent">(.+?)<\/span/);
		if (studentMatch && studentMatch.length > 1 && studentMatch[1]) return studentMatch[1];
	}
	return 'KIT Club';
}

export async function processCalendar(rawHtml: string): Promise<ProcessedCalendarData> {
	if (!rawHtml) throw new Error('empty data');

	return await new Promise<ProcessedCalendarData>((resolve, reject) => {
		const worker = createInlineWorker(
			(_rawHtml: { data: string[][] | false }) => self.postMessage(restructureTKB(_rawHtml.data)),
			restructureTKB
		);
		worker.onmessage = (res) => {
			const result = res.data
				? res.data
				: res.data === false
					? { data_subject: [], weeks: [] }
					: { data_subject: [], weeks: [] };
			resolve(result);
		};
		worker.onerror = (err) => reject(err);
		worker.postMessage(cleanFromHTMLtoArray(rawHtml));
	}).catch((e) => {
		throw e;
	});
}

export function processMainForm(rawHtml: string): MainFormData {
	// parse html
	if (typeof DOMParser === 'undefined') {
		throw new Error('DOMParser not available on server side');
	}

	const parser = new DOMParser();
	const dom = parser.parseFromString(rawHtml, 'text/html');
	const form1 = dom.getElementById('Form1');

	if (!form1) return {} as MainFormData;

	const formData: Record<string, string> = {};
	const inputs = form1.querySelectorAll('input, select, textarea');

	inputs.forEach((input) => {
		const element = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
		if (element.name && element.value) {
			formData[element.name] = element.value;
		}
	});

	return formData as MainFormData;
}

/**
 * Get semesters from mainForm
 * @param {string} response
 * @return {{
 * 	semesters: Array<{value: string, from: string, to: string, th: string}>
 * 	currentSemester: string
 * } | null} response
 */
export function processSemesters(response: string): SemesterData | null {
	if (typeof DOMParser === 'undefined') {
		throw new Error('DOMParser not available on server side');
	}

	const parser = new DOMParser();
	const dom = parser.parseFromString(response, 'text/html');
	const semesterSelect = dom.querySelector('select[name=drpSemester]');

	if (!semesterSelect) return null;

	const options = semesterSelect.querySelectorAll('option');
	const semesters: Array<{ value: string; from: string; to: string; th: string }> = [];
	let currentSemester = '';

	for (let i = 0; i < options.length; i++) {
		const option = options[i] as HTMLOptionElement;
		const tmp = option.innerHTML.split('_');

		// Ensure we have all required parts
		if (tmp.length >= 3) {
			semesters.push({
				value: option.value,
				from: tmp[1] || '',
				to: tmp[2] || '',
				th: tmp[0] || ''
			});
		}

		if (option.selected) {
			currentSemester = option.value;
		}
	}

	// Sort semesters by year and semester number (most recent first)
	semesters.sort((a, b) => {
		const yearA = parseInt(a.to || '0');
		const yearB = parseInt(b.to || '0');
		if (yearA !== yearB) {
			return yearB - yearA; // Newer year first
		}
		// If same year, sort by semester number (2 before 1)
		return parseInt(b.th || '0') - parseInt(a.th || '0');
	});

	// Take only the 10 most recent semesters
	const recentSemesters = semesters;

	return {
		semesters: recentSemesters,
		currentSemester: currentSemester
	};
}

export function restructureTKB(data: string[][] | false): ProcessedCalendarData | false {
	const categories = {
		lop_hoc_phan: 'Lớp học phần',
		hoc_phan: 'Học phần',
		thoi_gian: 'Thời gian',
		dia_diem: 'Ðịa điểm',
		giang_vien: 'Giảng viên',
		si_so: 'Sĩ số',
		so_dk: 'Số ÐK',
		so_tc: 'Số TC',
		ghi_chu: 'Ghi chú'
	};

	// check null
	if (data === false || data.length === 0) return false;
	// remove price
	data.pop();
	// if after remove price just only have header titles then return
	if (data.length === 1) return false;
	// create var
	const header_data = data[0];
	const content_data = data.slice(1, data.length);
	let min_time: any = null;
	let max_time: any = null;
	const data_subject = content_data.map((td: string[]) => {
		if (!header_data) return null;
		const regex_time_spliter =
			'([0-9]{2}\\/[0-9]{2}\\/[0-9]{4}).+?([0-9]{2}\\/[0-9]{2}\\/[0-9]{4}):(\\([0-9]*\\))?(.+?)((Từ)|$)+?';
		const regex_time_spliter_multi = new RegExp(regex_time_spliter, 'g');
		const regex_time_spliter_line = new RegExp(regex_time_spliter);

		let temp_dia_diem: any = td[header_data.indexOf(categories.dia_diem)];
		const temp_dia_diem_season_index = temp_dia_diem?.match(/\([0-9,]+?\)/g);
		// return null (not remove) if not match the pattern (to sync with season time)
		if (!temp_dia_diem_season_index) temp_dia_diem = null;
		if (temp_dia_diem && temp_dia_diem_season_index) {
			// add \n before each season
			temp_dia_diem_season_index.forEach(
				(child_item: any) => (temp_dia_diem = temp_dia_diem!.replace(child_item, '\n' + child_item))
			);
			// split season
			temp_dia_diem = temp_dia_diem.match(/\n\(([0-9,]+?)\)(.+)/g);
			temp_dia_diem = Array.prototype.map
				.call(temp_dia_diem, (item) => {
					let temp = item.match(/\n\(([0-9,]+?)\)(.+)/);
					temp = [temp[1].split(','), temp[2]];
					// merge splited season to address
					const temp2 = Array.prototype.map.call(
						temp[0],
						(child_item) => `(${child_item}) ${temp[1]}`
					);
					return temp2;
				})
				.flat();
			temp_dia_diem.sort(function (a: any, b: any) {
				return parseInt(a[1]) - parseInt(b[1]);
			});
			// remove season index in string
			temp_dia_diem = Array.prototype.map.call(temp_dia_diem, (item) =>
				item.replace(/^\([0-9]+?\) /i, '').trim()
			);
		}

		// ---------------------------------

		const temp_thoi_gian =
			td[header_data.indexOf(categories.thoi_gian)]?.match(regex_time_spliter_multi);
		// throw Error if subject hasn't had class times
		if (!temp_thoi_gian) return false;
		temp_thoi_gian.forEach((item: any, index: any) => {
			item = item.match(regex_time_spliter_line);
			// remove if not match the pattern
			if (!item) {
				temp_thoi_gian.splice(index, 1);
				return;
			}
			item[4] = item[4].split('&nbsp;&nbsp;&nbsp;');
			item[4].shift(); // remove trash
			item[4].forEach((child_item: any, child_index: any) => {
				// split day of week part
				child_item = child_item.match(/((Thứ .+?)||Chủ nhật) tiết (.+?)$/);
				// remove if not match the pattern
				if (!child_item) {
					item[4].splice(child_index, 1);
					return;
				}
				// remove trash
				const dayOfWeek_number: any = {
					'Thứ 2': 2,
					'Thứ 3': 3,
					'Thứ 4': 4,
					'Thứ 5': 5,
					'Thứ 6': 6,
					'Thứ 7': 7,
					'Chủ nhật': 8
				};
				if (child_item) {
					child_item[3] = child_item[3].split(/[^0-9]+/g);
					child_item[3].pop();
					child_item = { dow: dayOfWeek_number[child_item[1]], shi: child_item[3] };
				}
				// save element
				item[4][child_index] = child_item;
			});
			// remove trash
			item[1] = `${item[1].substr(3, 2)}/${item[1].substr(0, 2)}/${item[1].substr(6, 4)}`;
			item[2] = `${item[2].substr(3, 2)}/${item[2].substr(0, 2)}/${item[2].substr(6, 4)}`;
			item[1] = new Date(Date.parse(item[1]));
			item[2] = new Date(Date.parse(item[2]));
			item = {
				startTime: item[1],
				endTime: item[2],
				dayOfWeek: item[4],
				address: temp_dia_diem ? temp_dia_diem[index] : null
			};

			// save min/max time
			if (min_time) {
				if (min_time > item.startTime) min_time = item.startTime;
			} else min_time = item.startTime;
			if (max_time) {
				if (max_time < item.endTime) max_time = item.endTime;
			} else max_time = item.endTime;

			// save element
			temp_thoi_gian[index] = item;
		});

		// ---------------------------------

		return {
			lop_hoc_phan: td[header_data.indexOf(categories.lop_hoc_phan)],
			hoc_phan: td[header_data.indexOf(categories.hoc_phan)],
			giang_vien: td[header_data.indexOf(categories.giang_vien)],
			si_so: td[header_data.indexOf(categories.si_so)],
			so_dk: td[header_data.indexOf(categories.so_dk)],
			so_tc: td[header_data.indexOf(categories.so_tc)],
			tkb: temp_thoi_gian
		};
	});
	min_time = min_time?.getTime() || 0;
	max_time = max_time?.getTime() || 0;

	const days_outline: any = [];
	const one_day_time = 86400000;

	for (let time_iter = min_time; time_iter <= max_time; time_iter += one_day_time) {
		if (new Date(time_iter).getDay() + 1 == 2 || time_iter == min_time) {
			days_outline.push([{ time: time_iter, shift: [] }]);
			continue;
		}
		days_outline[days_outline.length - 1].push({ time: time_iter, shift: [] });
	}

	for (const week of days_outline) {
		for (const day of week) {
			day.shift = Array.from({ length: 16 }, (_, shift) => {
				for (const subject of data_subject) {
					if (subject)
						for (const season of subject.tkb)
							if (day.time >= season.startTime.getTime() && day.time <= season.endTime.getTime())
								for (const sub_day of season.dayOfWeek) {
									if (
										sub_day.dow == new Date(day.time).getDay() + 1 ||
										(new Date(day.time).getDay() + 1 == 1 && sub_day.dow == 8) // Chu nhat
									)
										if (
											shift + 1 >= parseInt(sub_day.shi[0]) &&
											shift + 1 <= parseInt(sub_day.shi[sub_day.shi.length - 1])
										)
											if (shift + 1 === parseInt(sub_day.shi[0])) {
												return {
													content: `${subject.lop_hoc_phan}${
														season.address ? ` (học tại ${season.address})` : ''
													}`,
													name: subject.lop_hoc_phan,
													address: season.address ? season.address : null,
													length: sub_day.shi.length
												};
											} else
												return {
													content: null,
													name: null,
													address: null,
													length: 0
												};
								}
				}

				return {
					content: null,
					name: null,
					address: null,
					length: 1
				};
			});
		}
	}
	return {
		data_subject: data_subject,
		weeks: days_outline
	};
}

export function exportToGoogleCalendar(
	student: string | null,
	calendar: ProcessedCalendarData
): void {
	if (
		!calendar ||
		!calendar.data_subject ||
		!Array.isArray(calendar.data_subject) ||
		!calendar.weeks ||
		!Array.isArray(calendar.weeks)
	) {
		console.error('Invalid calendar data for export');
		return;
	}
	const time_sift_table = [
		{},
		{ start: '000000', end: '004500' },
		{ start: '005000', end: '013500' },
		{ start: '014000', end: '022500' },
		{ start: '023500', end: '032000' },
		{ start: '032500', end: '041000' },
		{ start: '041500', end: '050000' },
		{ start: '053000', end: '061500' },
		{ start: '062000', end: '070500' },
		{ start: '071000', end: '075500' },
		{ start: '080500', end: '085000' },
		{ start: '085500', end: '094000' },
		{ start: '094500', end: '103000' },
		{ start: '110000', end: '114500' },
		{ start: '114500', end: '123000' },
		{ start: '124500', end: '133000' },
		{ start: '133000', end: '141500' }
	];
	let result = `BEGIN:VCALENDAR\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n\n`;
	calendar.weeks.forEach((week: any) => {
		for (const day of week) {
			const timeIter = new Date(day.time);
			if (day.shift && Array.isArray(day.shift)) {
				day.shift.forEach((shift: any, shift_index: number) => {
					if (shift.content) {
						const startIndex = shift_index + 1;
						const endIndex = shift_index + (parseInt(shift.length) || 1);

						// Ensure indices are within bounds
						if (startIndex < time_sift_table.length && endIndex < time_sift_table.length) {
							const startTime = time_sift_table[startIndex]?.start;
							const endTime = time_sift_table[endIndex]?.end;

							if (startTime && endTime) {
								result += `BEGIN:VEVENT\nDTSTART:${moment(timeIter).format('YYYYMMDD')}T${startTime}Z\n`;
								result += `DTEND:${moment(timeIter).format('YYYYMMDD')}T${endTime}Z\n`;
								if (shift.address) result += `LOCATION:${shift.address}\n`;
								result += `SUMMARY:${shift.name}\n`;
								result += `END:VEVENT\n\n`;
							}
						}
					}
				});
			}
		}
	});
	result += `END:VCALENDAR`;
	const link = document.createElement('a');
	link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result));
	link.setAttribute('download', `${student ? student.split(' - ')[0] : 'tkb_export'}.ics`);
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
