import {
	numToDate,
	dateToNum,
	getTotalDaysBetweenDates,
	getSessionShift,
	generateCalendarTableData
} from '@/lib/ts/course-planning/schedule-generator';
import { SESSION_CONSTANTS, JSONResultData, MajorSelectedSubjects } from '@/types/course-planning';

describe('Schedule Generator', () => {
	describe('Date utilities', () => {
		it('should convert number to date correctly', () => {
			const date = numToDate(240101); // 2024-01-01
			expect(date.getFullYear()).toBe(2024);
			expect(date.getMonth()).toBe(0); // January is 0
			expect(date.getDate()).toBe(1);
		});

		it('should convert date to number correctly', () => {
			const date = new Date(2024, 0, 1); // 2024-01-01
			const num = dateToNum(date);
			expect(num).toBe(240101);
		});

		it('should calculate days between dates correctly', () => {
			const startDate = new Date(2024, 0, 1);
			const endDate = new Date(2024, 0, 8);
			const days = getTotalDaysBetweenDates(startDate, endDate);
			expect(days).toBe(7);
		});
	});

	describe('Session utilities', () => {
		it('should identify morning sessions correctly', () => {
			expect(getSessionShift(1)).toBe('morning');
			expect(getSessionShift(6)).toBe('morning');
		});

		it('should identify afternoon sessions correctly', () => {
			expect(getSessionShift(7)).toBe('afternoon');
			expect(getSessionShift(12)).toBe('afternoon');
		});

		it('should identify evening sessions correctly', () => {
			expect(getSessionShift(13)).toBe('evening');
			expect(getSessionShift(16)).toBe('evening');
		});
	});

	describe('Calendar table generation', () => {
		it('should handle empty calendar data', () => {
			const mockCalendar: JSONResultData = {
				title: 'Test',
				minDate: 240101,
				maxDate: 240107,
				majors: {}
			};

			const selectedClasses: MajorSelectedSubjects = {};

			const result = generateCalendarTableData(mockCalendar, selectedClasses);

			expect(result).toBeDefined();
			expect(result.totalConflictedSessions).toBe(0);
			expect(result.data).toBeDefined();
		});
	});

	describe('Session constants', () => {
		it('should have correct session boundaries', () => {
			expect(SESSION_CONSTANTS.START_MORNING_SESSION).toBe(1);
			expect(SESSION_CONSTANTS.END_MORNING_SESSION).toBe(6);
			expect(SESSION_CONSTANTS.START_AFTERNOON_SESSION).toBe(7);
			expect(SESSION_CONSTANTS.END_AFTERNOON_SESSION).toBe(12);
			expect(SESSION_CONSTANTS.START_EVENING_SESSION).toBe(13);
			expect(SESSION_CONSTANTS.END_EVENING_SESSION).toBe(16);
		});
	});
});
