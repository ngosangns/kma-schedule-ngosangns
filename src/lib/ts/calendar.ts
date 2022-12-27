import $ from 'jquery';
import { createInlineWorker } from './worker';
import moment from 'moment';

export function fetchCalendarWithPost(formObj: any, signInToken: any) {
	return /** @type {any} */ $.ajax({
		url: 'https://actvn-schedule.cors-ngosangns.workers.dev/subject',
		method: 'POST',
		data: Object.keys(formObj)
			.map((key) => {
				return encodeURIComponent(key) + '=' + encodeURIComponent(formObj[key]);
			})
			.join('&'),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'x-cors-headers': JSON.stringify({
				Cookie: signInToken
			})
		}
	});
}

export function fetchCalendarWithGet(signInToken: any) {
	return /** @type {any} */ $.ajax({
		url: 'https://actvn-schedule.cors-ngosangns.workers.dev/subject',
		method: 'GET',
		headers: {
			'x-cors-headers': JSON.stringify({
				Cookie: signInToken
			})
		}
	});
}

export function getFieldFromResult(result: any, field: any) {
	let res = result.match(new RegExp('id="' + field + '" value="(.+?)"', 'g'));
	if (!res || !res.length) return false;
	res = res[0];
	res = res.match(/value="(.+?)"/);
	if (!res || !res.length) return false;
	res = res[1];
	return res;
}

function stripHTMLTags(str: any) {
	if (str === null || str === false) return '';
	else str = str.toString();
	return str.replace(/<[^>]*>/g, '');
}

export function filterTrashInHtml(html: string): string {
	let result = html;
	result = result.replace(/src="(.+?)"/g, '');
	return result;
}

export function cleanFromHTMLtoArray(raw_tkb: string) {
	if (!raw_tkb || !raw_tkb.length) return false;

	// remove trash and catch table from html string
	raw_tkb = raw_tkb.replace(/ {2,}/gm, ' ');
	raw_tkb = raw_tkb.replace(/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/gm, '');
	const raw_tkb_matched = raw_tkb.match(/<table.+?gridRegistered.+?<\/table>/g);
	if (raw_tkb_matched && raw_tkb_matched.length) raw_tkb = raw_tkb_matched[0];

	// convert response to DOM then export the table to array
	$('body').append('<div id=cleanTKB class=uk-hidden></div>');
	$('#cleanTKB').html(raw_tkb);
	const data_content_temp = Array.prototype.map.call(
		document.querySelectorAll('#gridRegistered tr'),
		(tr) => Array.prototype.map.call(tr.querySelectorAll('td'), (td) => stripHTMLTags(td.innerHTML))
	);
	$('#cleanTKB').remove();

	// check null
	if (!data_content_temp) return false;

	return data_content_temp;
}

export function processStudent(rawHtml: string) {
	let student = rawHtml.match(/<span id="lblStudent">(.+?)<\/span/g);
	if (student && student.length) {
		student = student[0].match(/<span id="lblStudent">(.+?)<\/span/);
		if (student && student.length > 1) return student[1];
	}
	return 'KIT Club';
}

export async function processCalendar(rawHtml: string) {
	if (!rawHtml) throw new Error('empty data');

	return await new Promise((resolve, reject) => {
		const worker = createInlineWorker(
			(_rawHtml: { data: any }) => self.postMessage(restructureTKB(_rawHtml.data)),
			restructureTKB
		);
		worker.onmessage = (res) =>
			resolve(res.data ? res.data : res.data === false ? { data_subject: [] } : null);
		worker.onerror = (err) => reject(err);
		worker.postMessage(cleanFromHTMLtoArray(rawHtml));
	}).catch((e) => {
		throw e;
	});
}

export function processMainForm(rawHtml: any) {
	// parse html
	const parser = new DOMParser(),
		content = 'text/html',
		dom = parser.parseFromString(rawHtml, content),
		form1 = dom.getElementById('Form1'),
		mainForm = form1 ? $(form1) : null;
	return mainForm
		? mainForm.serializeArray().reduce((o, kv) => ({ ...o, [kv.name]: kv.value }), {})
		: {};
}

/**
 * Get semesters from mainForm
 * @param {string} response
 * @return {{
 * 	semesters: Array<{value: string, from: string, to: string, th: string}>
 * 	currentSemester: string
 * } | null} response
 */
export function processSemesters(response: string): {
	semesters: Array<{ value: string; from: string; to: string; th: string }>;
	currentSemester: string;
} | null {
	const semesterOptions = $(response).find('select[name=drpSemester]').first();
	if (!semesterOptions.length) return null;

	const semester = semesterOptions.find('option');
	const semesters = [];
	for (const item of semester) {
		const tmp = item.innerHTML.split('_');
		semesters.push({
			value: item.value,
			from: tmp[1],
			to: tmp[2],
			th: tmp[0]
		});
	}

	const currentSemester: any = semesterOptions.find('option:checked').first();

	return {
		semesters: semesters,
		currentSemester: currentSemester.length ? currentSemester.val() : ''
	};
}

export function restructureTKB(data: any) {
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
	if (data.length == 0 || data == false) return false;
	// remove price
	data.pop();
	// if after remove price just only have header titles then return
	if (data.length == 1) return false;
	// create var
	const header_data = data[0];
	const content_data = data.slice(1, data.length);
	let min_time: any, max_time: any;
	const data_subject: any = Array.prototype.map.call(content_data, function (td) {
		const regex_time_spliter =
			'([0-9]{2}\\/[0-9]{2}\\/[0-9]{4}).+?([0-9]{2}\\/[0-9]{2}\\/[0-9]{4}):(\\([0-9]*\\))?(.+?)((Từ)|$)+?';
		const regex_time_spliter_multi = new RegExp(regex_time_spliter, 'g');
		const regex_time_spliter_line = new RegExp(regex_time_spliter);

		let temp_dia_diem = td[header_data.indexOf(categories.dia_diem)];
		const temp_dia_diem_season_index = temp_dia_diem.match(/\([0-9,]+?\)/g);
		// return null (not remove) if not match the pattern (to sync with season time)
		if (!temp_dia_diem_season_index) temp_dia_diem = null;
		if (temp_dia_diem) {
			// add \n before each season
			temp_dia_diem_season_index.forEach(
				(child_item: any) => (temp_dia_diem = temp_dia_diem.replace(child_item, '\n' + child_item))
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
			td[header_data.indexOf(categories.thoi_gian)].match(regex_time_spliter_multi);
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
	min_time = min_time.getTime();
	max_time = max_time.getTime();

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
			day.shift = [...Array(16).keys()].map((shift) => {
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
	return { data_subject: days_outline };
}

export function exportToGoogleCalendar(student: string | null, calendar: any) {
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
	calendar.data_subject.forEach((week: any) => {
		for (const day of week) {
			const timeIter = new Date(day.time);
			day.shift.forEach((shift: any, shift_index: number) => {
				if (shift.content) {
					result += `BEGIN:VEVENT\nDTSTART:${moment(timeIter).format('YYYYMMDD')}T${
						time_sift_table[shift_index + 1].start
					}Z\n`;
					result += `DTEND:${moment(timeIter).format('YYYYMMDD')}T${
						time_sift_table[shift_index + shift.length].end
					}Z\n`;
					if (shift.address) result += `LOCATION:${shift.address}\n`;
					result += `SUMMARY:${shift.name}\n`;
					result += `END:VEVENT\n\n`;
				}
			});
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
