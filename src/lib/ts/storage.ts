import { StorageData } from '@/types';

export function saveData(data: StorageData): void {
	if (typeof window === 'undefined') return;

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

	if (data.coursePlanning) {
		window.localStorage.setItem('coursePlanning', JSON.stringify(data.coursePlanning));
	}
}

export function loadData(): StorageData {
	if (typeof window === 'undefined') {
		return {
			calendar: null,
			student: null,
			semesters: null,
			mainForm: null,
			signInToken: null,
			coursePlanning: null
		};
	}

	const calendar = window.localStorage.getItem('calendar');
	const student = window.localStorage.getItem('student');
	const semesters = window.localStorage.getItem('semesters');
	const mainForm = window.localStorage.getItem('mainForm');
	const signInToken = window.localStorage.getItem('signInToken');
	const coursePlanning = window.localStorage.getItem('coursePlanning');

	// Helper function to safely parse JSON
	const safeJsonParse = (value: string | null) => {
		if (!value) return null;
		try {
			return JSON.parse(value);
		} catch (error) {
			console.warn('Failed to parse JSON from localStorage:', error);
			return null;
		}
	};

	return {
		calendar: safeJsonParse(calendar),
		student: student ? student : null,
		semesters: safeJsonParse(semesters),
		mainForm: safeJsonParse(mainForm),
		signInToken: signInToken ? signInToken : null,
		coursePlanning: safeJsonParse(coursePlanning)
	};
}

export function clearData(): void {
	if (typeof window === 'undefined') return;

	window.localStorage.removeItem('calendar');
	window.localStorage.removeItem('student');
	window.localStorage.removeItem('semesters');
	window.localStorage.removeItem('mainForm');
	window.localStorage.removeItem('signInToken');
	window.localStorage.removeItem('coursePlanning');
}

// Course Planning specific storage functions
export function saveCoursePlanningData(data: import('@/types').CoursePlanningStorageData): void {
	if (typeof window === 'undefined') return;

	try {
		const dataWithTimestamp = {
			...data,
			lastUpdated: new Date().toISOString()
		};
		window.localStorage.setItem('coursePlanning', JSON.stringify(dataWithTimestamp));
	} catch (error) {
		console.error('Failed to save course planning data:', error);
	}
}

export function loadCoursePlanningData(): import('@/types').CoursePlanningStorageData | null {
	if (typeof window === 'undefined') return null;

	try {
		const stored = window.localStorage.getItem('coursePlanning');
		return stored ? JSON.parse(stored) : null;
	} catch (error) {
		console.error('Failed to load course planning data:', error);
		return null;
	}
}

export function clearCoursePlanningData(): void {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem('coursePlanning');
}
