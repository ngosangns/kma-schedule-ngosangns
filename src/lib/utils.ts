import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import moment from 'moment';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: string | Date, format: string = 'DD/MM/YYYY'): string {
	return moment(date).format(format);
}

export function formatTime(time: string | Date): string {
	return moment(time).format('HH:mm');
}

export function formatDateTime(date: string | Date): string {
	return moment(date).format('DD/MM/YYYY HH:mm');
}

export function isToday(date: string | Date): boolean {
	return moment(date).isSame(moment(), 'day');
}

export function isSameWeek(date1: string | Date, date2: string | Date): boolean {
	return moment(date1).isSame(moment(date2), 'week');
}

// String utilities
export function truncate(str: string, length: number): string {
	if (str.length <= length) return str;
	return str.slice(0, length) + '...';
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
	return array.reduce(
		(groups, item) => {
			const group = String(item[key]);
			groups[group] = groups[group] || [];
			groups[group].push(item);
			return groups;
		},
		{} as Record<string, T[]>
	);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
	return [...array].sort((a, b) => {
		const aVal = a[key];
		const bVal = b[key];

		if (aVal < bVal) return order === 'asc' ? -1 : 1;
		if (aVal > bVal) return order === 'asc' ? 1 : -1;
		return 0;
	});
}

// Validation utilities
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
	return password.length >= 6;
}

// Local storage utilities with error handling
export function getFromStorage<T>(key: string, defaultValue: T): T {
	if (typeof window === 'undefined') return defaultValue;

	try {
		const item = window.localStorage.getItem(key);
		return item ? JSON.parse(item) : defaultValue;
	} catch (error) {
		console.error(`Error reading from localStorage key "${key}":`, error);
		return defaultValue;
	}
}

export function setToStorage<T>(key: string, value: T): void {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Error writing to localStorage key "${key}":`, error);
	}
}

export function removeFromStorage(key: string): void {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.removeItem(key);
	} catch (error) {
		console.error(`Error removing from localStorage key "${key}":`, error);
	}
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	return 'Đã xảy ra lỗi không xác định';
}

// Schedule utilities
export function getShiftTime(shift: number): { start: string; end: string } {
	const shifts = {
		1: { start: '07:00', end: '07:50' },
		2: { start: '08:00', end: '08:50' },
		3: { start: '09:00', end: '09:50' },
		4: { start: '10:00', end: '10:50' },
		5: { start: '11:00', end: '11:50' },
		6: { start: '12:00', end: '12:50' },
		7: { start: '13:00', end: '13:50' },
		8: { start: '14:00', end: '14:50' },
		9: { start: '15:00', end: '15:50' },
		10: { start: '16:00', end: '16:50' },
		11: { start: '17:00', end: '17:50' },
		12: { start: '18:00', end: '18:50' },
		13: { start: '19:00', end: '19:50' },
		14: { start: '20:00', end: '20:50' },
		15: { start: '21:00', end: '21:50' }
	};

	return shifts[shift as keyof typeof shifts] || { start: '00:00', end: '00:00' };
}

export function getShiftSession(shift: number): 'morning' | 'afternoon' | 'evening' {
	if (shift >= 1 && shift <= 6) return 'morning';
	if (shift >= 7 && shift <= 12) return 'afternoon';
	return 'evening';
}

export function getDayName(dayNumber: number): string {
	const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
	return days[dayNumber] || 'Không xác định';
}

// Format semester name from "1_2025_2026" to "Kỳ 1 - 2025 - 2026"
export function formatSemesterName(semesterValue: string): string {
	// Handle null, undefined, or non-string inputs
	if (semesterValue === null || semesterValue === undefined) {
		return 'Không xác định';
	}

	if (typeof semesterValue !== 'string') {
		return semesterValue;
	}

	// Handle empty string
	if (semesterValue === '') {
		return '';
	}

	// Split by underscore
	const parts = semesterValue.split('_');

	if (parts.length === 3) {
		const [semester, startYear, endYear] = parts;
		return `Kỳ ${semester} - ${startYear} - ${endYear}`;
	}

	// Fallback for other formats
	return semesterValue;
}

// Calculate shift range based on start shift and length
export function getShiftRange(startShift: number, length: number): { start: number; end: number } {
	if (!startShift || !length || startShift < 1 || length < 1) {
		return { start: startShift || 1, end: startShift || 1 };
	}

	return {
		start: startShift,
		end: startShift + length - 1
	};
}

// Get time range for multiple shifts
export function getShiftTimeRange(
	startShift: number,
	length: number
): { start: string; end: string } {
	const { start, end } = getShiftRange(startShift, length);
	const startTime = getShiftTime(start);
	const endTime = getShiftTime(end);

	return {
		start: startTime.start,
		end: endTime.end
	};
}

// Format shift display text with range
export function formatShiftDisplay(startShift: number, length: number): string {
	const { start, end } = getShiftRange(startShift, length);

	if (start === end) {
		return `Tiết ${start}`;
	}

	return `Tiết ${start}-${end}`;
}

// Format time display text with range
export function formatTimeDisplay(startShift: number, length: number): string {
	const { start, end } = getShiftTimeRange(startShift, length);
	return `${start} - ${end}`;
}
