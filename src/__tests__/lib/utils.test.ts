import {
	cn,
	formatDate,
	formatTime,
	formatDateTime,
	isToday,
	isSameWeek,
	truncate,
	capitalize,
	groupBy,
	sortBy,
	isValidEmail,
	isValidPassword,
	getDayName,
	getShiftTime,
	getShiftSession,
	formatSemesterName,
	getShiftRange,
	getShiftTimeRange,
	formatShiftDisplay,
	formatTimeDisplay,
	getFromStorage,
	setToStorage,
	removeFromStorage,
	getErrorMessage
} from '@/lib/utils';
import moment from 'moment';

// Mock localStorage
const mockLocalStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
	value: mockLocalStorage
});

describe('utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset console.error mock
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('cn', () => {
		it('should merge class names correctly', () => {
			expect(cn('class1', 'class2')).toBe('class1 class2');
		});

		it('should handle conditional classes', () => {
			expect(cn('class1', (false as boolean) && 'class2', 'class3')).toBe('class1 class3');
		});

		it('should merge tailwind classes correctly', () => {
			expect(cn('p-4', 'p-2')).toBe('p-2');
		});
	});

	describe('Date utilities', () => {
		const testDate = '2023-12-25';
		const testDateTime = '2023-12-25 14:30:00';

		describe('formatDate', () => {
			it('should format date with default format', () => {
				expect(formatDate(testDate)).toBe('25/12/2023');
			});

			it('should format date with custom format', () => {
				expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2023-12-25');
			});

			it('should handle Date object', () => {
				const date = new Date('2023-12-25');
				expect(formatDate(date)).toBe('25/12/2023');
			});
		});

		describe('formatTime', () => {
			it('should format time correctly', () => {
				expect(formatTime(testDateTime)).toBe('14:30');
			});

			it('should handle Date object', () => {
				const date = new Date('2023-12-25T14:30:00');
				expect(formatTime(date)).toBe('14:30');
			});
		});

		describe('formatDateTime', () => {
			it('should format datetime correctly', () => {
				expect(formatDateTime(testDateTime)).toBe('25/12/2023 14:30');
			});
		});

		describe('isToday', () => {
			it('should return true for today', () => {
				const today = moment().format('YYYY-MM-DD');
				expect(isToday(today)).toBe(true);
			});

			it('should return false for other dates', () => {
				expect(isToday('2020-01-01')).toBe(false);
			});
		});

		describe('isSameWeek', () => {
			it('should return true for dates in same week', () => {
				const date1 = '2023-12-25'; // Monday
				const date2 = '2023-12-26'; // Tuesday of same week
				expect(isSameWeek(date1, date2)).toBe(true);
			});

			it('should return false for dates in different weeks', () => {
				const date1 = '2023-12-25';
				const date2 = '2024-01-01';
				expect(isSameWeek(date1, date2)).toBe(false);
			});
		});
	});

	describe('String utilities', () => {
		describe('truncate', () => {
			it('should truncate long strings', () => {
				expect(truncate('This is a long string', 10)).toBe('This is a ...');
			});

			it('should not truncate short strings', () => {
				expect(truncate('Short', 10)).toBe('Short');
			});

			it('should handle exact length', () => {
				expect(truncate('Exact', 5)).toBe('Exact');
			});
		});

		describe('capitalize', () => {
			it('should capitalize first letter', () => {
				expect(capitalize('hello')).toBe('Hello');
			});

			it('should handle uppercase strings', () => {
				expect(capitalize('HELLO')).toBe('Hello');
			});

			it('should handle mixed case', () => {
				expect(capitalize('hELLO')).toBe('Hello');
			});

			it('should handle empty string', () => {
				expect(capitalize('')).toBe('');
			});
		});
	});

	describe('Array utilities', () => {
		const testArray = [
			{ id: 1, category: 'A', value: 10 },
			{ id: 2, category: 'B', value: 20 },
			{ id: 3, category: 'A', value: 15 },
			{ id: 4, category: 'B', value: 5 }
		];

		describe('groupBy', () => {
			it('should group array by key', () => {
				const result = groupBy(testArray, 'category');
				expect(result).toEqual({
					A: [
						{ id: 1, category: 'A', value: 10 },
						{ id: 3, category: 'A', value: 15 }
					],
					B: [
						{ id: 2, category: 'B', value: 20 },
						{ id: 4, category: 'B', value: 5 }
					]
				});
			});

			it('should handle empty array', () => {
				const result = groupBy([], 'category');
				expect(result).toEqual({});
			});
		});

		describe('sortBy', () => {
			it('should sort array by key ascending', () => {
				const result = sortBy(testArray, 'value', 'asc');
				expect(result.map((item) => item.value)).toEqual([5, 10, 15, 20]);
			});

			it('should sort array by key descending', () => {
				const result = sortBy(testArray, 'value', 'desc');
				expect(result.map((item) => item.value)).toEqual([20, 15, 10, 5]);
			});

			it('should default to ascending order', () => {
				const result = sortBy(testArray, 'value');
				expect(result.map((item) => item.value)).toEqual([5, 10, 15, 20]);
			});
		});
	});

	describe('Validation utilities', () => {
		describe('isValidEmail', () => {
			it('should validate correct email', () => {
				expect(isValidEmail('test@example.com')).toBe(true);
				expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
			});

			it('should reject invalid email', () => {
				expect(isValidEmail('invalid-email')).toBe(false);
				expect(isValidEmail('test@')).toBe(false);
				expect(isValidEmail('@domain.com')).toBe(false);
				expect(isValidEmail('test.domain.com')).toBe(false);
			});
		});

		describe('isValidPassword', () => {
			it('should validate password with minimum length', () => {
				expect(isValidPassword('123456')).toBe(true);
				expect(isValidPassword('password123')).toBe(true);
			});

			it('should reject short passwords', () => {
				expect(isValidPassword('12345')).toBe(false);
				expect(isValidPassword('')).toBe(false);
			});
		});
	});

	describe('Schedule utilities', () => {
		describe('getDayName', () => {
			it('should return correct day names', () => {
				expect(getDayName(0)).toBe('Chủ nhật');
				expect(getDayName(1)).toBe('Thứ hai');
				expect(getDayName(2)).toBe('Thứ ba');
				expect(getDayName(3)).toBe('Thứ tư');
				expect(getDayName(4)).toBe('Thứ năm');
				expect(getDayName(5)).toBe('Thứ sáu');
				expect(getDayName(6)).toBe('Thứ bảy');
			});

			it('should handle invalid day numbers', () => {
				expect(getDayName(7)).toBe('Không xác định');
				expect(getDayName(-1)).toBe('Không xác định');
			});
		});

		describe('getShiftTime', () => {
			it('should return correct shift times', () => {
				expect(getShiftTime(1)).toEqual({ start: '07:00', end: '07:50' });
				expect(getShiftTime(2)).toEqual({ start: '08:00', end: '08:50' });
				expect(getShiftTime(7)).toEqual({ start: '13:00', end: '13:50' });
				expect(getShiftTime(15)).toEqual({ start: '21:00', end: '21:50' });
			});

			it('should handle invalid shift numbers', () => {
				expect(getShiftTime(0)).toEqual({ start: '00:00', end: '00:00' });
				expect(getShiftTime(16)).toEqual({ start: '00:00', end: '00:00' });
			});
		});

		describe('getShiftSession', () => {
			it('should return correct shift sessions', () => {
				expect(getShiftSession(1)).toBe('morning');
				expect(getShiftSession(6)).toBe('morning');
				expect(getShiftSession(7)).toBe('afternoon');
				expect(getShiftSession(12)).toBe('afternoon');
				expect(getShiftSession(13)).toBe('evening');
				expect(getShiftSession(15)).toBe('evening');
			});

			it('should handle invalid shift numbers', () => {
				expect(getShiftSession(0)).toBe('evening');
				expect(getShiftSession(16)).toBe('evening');
			});
		});

		describe('formatSemesterName', () => {
			it('should format semester name correctly', () => {
				expect(formatSemesterName('1_2025_2026')).toBe('Kỳ 1 - 2025 - 2026');
				expect(formatSemesterName('2_2024_2025')).toBe('Kỳ 2 - 2024 - 2025');
				expect(formatSemesterName('3_2023_2024')).toBe('Kỳ 3 - 2023 - 2024');
			});

			it('should handle invalid formats gracefully', () => {
				expect(formatSemesterName('invalid')).toBe('invalid');
				expect(formatSemesterName('1_2025')).toBe('1_2025');
				expect(formatSemesterName('1_2025_2026_extra')).toBe('1_2025_2026_extra');
				expect(formatSemesterName('')).toBe('');
			});

			it('should handle null and undefined inputs', () => {
				expect(formatSemesterName(null as any)).toBe('Không xác định');
				expect(formatSemesterName(undefined as any)).toBe('Không xác định');
			});

			it('should handle non-string inputs', () => {
				expect(formatSemesterName(123 as any)).toBe(123);
				expect(formatSemesterName({} as any)).toEqual({});
				expect(formatSemesterName([] as any)).toEqual([]);
			});
		});

		describe('getShiftRange', () => {
			it('should calculate correct shift range', () => {
				expect(getShiftRange(1, 1)).toEqual({ start: 1, end: 1 });
				expect(getShiftRange(1, 3)).toEqual({ start: 1, end: 3 });
				expect(getShiftRange(7, 2)).toEqual({ start: 7, end: 8 });
				expect(getShiftRange(13, 3)).toEqual({ start: 13, end: 15 });
			});

			it('should handle invalid inputs', () => {
				expect(getShiftRange(0, 1)).toEqual({ start: 1, end: 1 });
				expect(getShiftRange(1, 0)).toEqual({ start: 1, end: 1 });
				expect(getShiftRange(null as any, 1)).toEqual({ start: 1, end: 1 });
				expect(getShiftRange(1, null as any)).toEqual({ start: 1, end: 1 });
			});
		});

		describe('getShiftTimeRange', () => {
			it('should calculate correct time range for single shift', () => {
				expect(getShiftTimeRange(1, 1)).toEqual({ start: '07:00', end: '07:50' });
				expect(getShiftTimeRange(7, 1)).toEqual({ start: '13:00', end: '13:50' });
			});

			it('should calculate correct time range for multiple shifts', () => {
				expect(getShiftTimeRange(1, 3)).toEqual({ start: '07:00', end: '09:50' });
				expect(getShiftTimeRange(7, 2)).toEqual({ start: '13:00', end: '14:50' });
				expect(getShiftTimeRange(13, 3)).toEqual({ start: '19:00', end: '21:50' });
			});
		});

		describe('formatShiftDisplay', () => {
			it('should format single shift correctly', () => {
				expect(formatShiftDisplay(1, 1)).toBe('Tiết 1');
				expect(formatShiftDisplay(7, 1)).toBe('Tiết 7');
				expect(formatShiftDisplay(15, 1)).toBe('Tiết 15');
			});

			it('should format multiple shifts correctly', () => {
				expect(formatShiftDisplay(1, 3)).toBe('Tiết 1-3');
				expect(formatShiftDisplay(7, 2)).toBe('Tiết 7-8');
				expect(formatShiftDisplay(13, 3)).toBe('Tiết 13-15');
			});
		});

		describe('formatTimeDisplay', () => {
			it('should format single shift time correctly', () => {
				expect(formatTimeDisplay(1, 1)).toBe('07:00 - 07:50');
				expect(formatTimeDisplay(7, 1)).toBe('13:00 - 13:50');
			});

			it('should format multiple shifts time correctly', () => {
				expect(formatTimeDisplay(1, 3)).toBe('07:00 - 09:50');
				expect(formatTimeDisplay(7, 2)).toBe('13:00 - 14:50');
				expect(formatTimeDisplay(13, 3)).toBe('19:00 - 21:50');
			});
		});
	});

	describe('Local storage utilities', () => {
		describe('getFromStorage', () => {
			it('should return parsed value from localStorage', () => {
				const testData = { key: 'value' };
				mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

				const result = getFromStorage('test-key', {});
				expect(result).toEqual(testData);
				expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
			});

			it('should return default value when item not found', () => {
				mockLocalStorage.getItem.mockReturnValue(null);

				const defaultValue = { default: true };
				const result = getFromStorage('test-key', defaultValue);
				expect(result).toEqual(defaultValue);
			});

			it('should return default value on parse error', () => {
				mockLocalStorage.getItem.mockReturnValue('invalid-json');

				const defaultValue = { default: true };
				const result = getFromStorage('test-key', defaultValue);
				expect(result).toEqual(defaultValue);
				expect(console.error).toHaveBeenCalled();
			});

			it('should return default value in SSR environment', () => {
				// Mock window as undefined
				const originalWindow = global.window;
				delete (global as any).window;

				const defaultValue = { default: true };
				const result = getFromStorage('test-key', defaultValue);
				expect(result).toEqual(defaultValue);

				// Restore window
				global.window = originalWindow;
			});
		});

		describe('setToStorage', () => {
			it('should set value to localStorage', () => {
				const testData = { key: 'value' };
				setToStorage('test-key', testData);

				expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
			});

			it('should handle errors gracefully', () => {
				mockLocalStorage.setItem.mockImplementation(() => {
					throw new Error('Storage error');
				});

				expect(() => setToStorage('test-key', { data: 'test' })).not.toThrow();
				expect(console.error).toHaveBeenCalled();
			});

			it('should do nothing in SSR environment', () => {
				const originalWindow = global.window;
				delete (global as any).window;

				setToStorage('test-key', { data: 'test' });
				expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

				global.window = originalWindow;
			});
		});

		describe('removeFromStorage', () => {
			it('should remove item from localStorage', () => {
				removeFromStorage('test-key');
				expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
			});

			it('should handle errors gracefully', () => {
				mockLocalStorage.removeItem.mockImplementation(() => {
					throw new Error('Storage error');
				});

				expect(() => removeFromStorage('test-key')).not.toThrow();
				expect(console.error).toHaveBeenCalled();
			});
		});
	});

	describe('Error handling utilities', () => {
		describe('getErrorMessage', () => {
			it('should return error message from Error object', () => {
				const error = new Error('Test error message');
				expect(getErrorMessage(error)).toBe('Test error message');
			});

			it('should return string error as is', () => {
				const error = 'String error message';
				expect(getErrorMessage(error)).toBe('String error message');
			});

			it('should return default message for unknown error types', () => {
				const error = { unknown: 'error' };
				expect(getErrorMessage(error)).toBe('Đã xảy ra lỗi không xác định');
			});

			it('should handle null and undefined', () => {
				expect(getErrorMessage(null)).toBe('Đã xảy ra lỗi không xác định');
				expect(getErrorMessage(undefined)).toBe('Đã xảy ra lỗi không xác định');
			});
		});
	});
});
