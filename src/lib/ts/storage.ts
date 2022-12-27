export function saveData(data: {
	signInToken?: string;
	mainForm?: any;
	semesters?: {
		semesters: Array<{ value: string; from: string; to: string; th: string }>;
		currentSemester: string;
	} | null;
	calendar?: any;
	student?: string;
}) {
	if (data.semesters) {
		window.localStorage.setItem('semesters', JSON.stringify(data.semesters));
	}

	if (data.signInToken && data.signInToken.length) {
		window.localStorage.setItem('signInToken', data.signInToken);
	}

	if (data.mainForm) {
		window.localStorage.setItem('mainForm', JSON.stringify(data.mainForm));
	}

	if (data.calendar) {
		window.localStorage.setItem('calendar', JSON.stringify(data.calendar));
	}

	if (data.student) {
		window.localStorage.setItem('student', data.student);
	}
}

export function loadData() {
	const calendar = window.localStorage.getItem('calendar');
	const student = window.localStorage.getItem('student');
	const semesters = window.localStorage.getItem('semesters');
	const mainForm = window.localStorage.getItem('mainForm');
	const signInToken = window.localStorage.getItem('signInToken');

	return {
		calendar: calendar ? JSON.parse(calendar) : null,
		student: student ? student : null,
		semesters: semesters ? JSON.parse(semesters) : null,
		mainForm: mainForm ? JSON.parse(mainForm) : null,
		signInToken: signInToken ? signInToken : null
	};
}

export function clearData() {
	window.localStorage.removeItem('calendar');
	window.localStorage.removeItem('student');
	window.localStorage.removeItem('semesters');
	window.localStorage.removeItem('mainForm');
	window.localStorage.removeItem('signInToken');
}
