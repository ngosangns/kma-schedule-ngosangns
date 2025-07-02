import { saveData, loadData, clearData } from '@/lib/ts/storage';
import { mockStorageData } from '../../mocks/data';

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

describe('storage utilities', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('saveData', () => {
		it('should save signInToken to localStorage', () => {
			const data = { signInToken: 'test-token' };
			saveData(data);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('signInToken', 'test-token');
		});

		it('should save mainForm to localStorage', () => {
			const data = { mainForm: { key: 'value' } };
			saveData(data);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'mainForm',
				JSON.stringify({ key: 'value' })
			);
		});

		it('should save semesters to localStorage', () => {
			const data = { semesters: mockStorageData.semesters };
			saveData(data);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'semesters',
				JSON.stringify(mockStorageData.semesters)
			);
		});

		it('should save calendar to localStorage', () => {
			const data = { calendar: mockStorageData.calendar };
			saveData(data);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'calendar',
				JSON.stringify(mockStorageData.calendar)
			);
		});

		it('should save student to localStorage', () => {
			const data = { student: 'Test Student' };
			saveData(data);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('student', 'Test Student');
		});

		it('should save multiple data types at once', () => {
			const data = {
				signInToken: 'test-token',
				mainForm: { key: 'value' },
				student: 'Test Student'
			};
			saveData(data);

			expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('signInToken', 'test-token');
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'mainForm',
				JSON.stringify({ key: 'value' })
			);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('student', 'Test Student');
		});

		it('should not save empty or falsy values', () => {
			const data = {
				signInToken: '',
				mainForm: null,
				student: undefined
			};
			saveData(data);

			expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
		});

		it('should handle SSR environment gracefully', () => {
			const originalWindow = global.window;
			delete (global as any).window;

			const data = { signInToken: 'test-token' };
			expect(() => saveData(data)).not.toThrow();

			global.window = originalWindow;
		});
	});

	describe('loadData', () => {
		it('should load all data from localStorage', () => {
			mockLocalStorage.getItem.mockImplementation((key) => {
				switch (key) {
					case 'signInToken':
						return 'test-token';
					case 'mainForm':
						return JSON.stringify({ key: 'value' });
					case 'semesters':
						return JSON.stringify(mockStorageData.semesters);
					case 'calendar':
						return JSON.stringify(mockStorageData.calendar);
					case 'student':
						return 'Test Student';
					default:
						return null;
				}
			});

			const result = loadData();

			expect(result).toEqual({
				signInToken: 'test-token',
				mainForm: { key: 'value' },
				semesters: mockStorageData.semesters,
				calendar: mockStorageData.calendar,
				student: 'Test Student'
			});
		});

		it('should return null values when data not found', () => {
			mockLocalStorage.getItem.mockReturnValue(null);

			const result = loadData();

			expect(result).toEqual({
				signInToken: null,
				mainForm: null,
				semesters: null,
				calendar: null,
				student: null
			});
		});

		it('should handle invalid JSON gracefully', () => {
			mockLocalStorage.getItem.mockImplementation((key) => {
				switch (key) {
					case 'mainForm':
						return 'invalid-json';
					case 'semesters':
						return 'invalid-json';
					case 'calendar':
						return 'invalid-json';
					default:
						return null;
				}
			});

			const result = loadData();

			expect(result).toEqual({
				signInToken: null,
				mainForm: null,
				semesters: null,
				calendar: null,
				student: null
			});
		});

		it('should handle SSR environment', () => {
			const originalWindow = global.window;
			delete (global as any).window;

			const result = loadData();

			expect(result).toEqual({
				signInToken: null,
				mainForm: null,
				semesters: null,
				calendar: null,
				student: null
			});

			global.window = originalWindow;
		});

		it('should parse JSON data correctly', () => {
			const testData = { test: 'data', nested: { value: 123 } };
			mockLocalStorage.getItem.mockImplementation((key) => {
				if (key === 'mainForm') {
					return JSON.stringify(testData);
				}
				return null;
			});

			const result = loadData();

			expect(result.mainForm).toEqual(testData);
		});
	});

	describe('clearData', () => {
		it('should clear all stored data', () => {
			clearData();

			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('signInToken');
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('mainForm');
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('semesters');
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('calendar');
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('student');
		});

		it('should handle SSR environment gracefully', () => {
			const originalWindow = global.window;
			delete (global as any).window;

			expect(() => clearData()).not.toThrow();

			global.window = originalWindow;
		});
	});

	describe('integration tests', () => {
		it('should save and load data correctly', () => {
			// Clear mocks to use real localStorage behavior
			jest.clearAllMocks();

			// Mock localStorage with actual behavior
			const storage: Record<string, string> = {};
			mockLocalStorage.getItem.mockImplementation((key) => storage[key] || null);
			mockLocalStorage.setItem.mockImplementation((key, value) => {
				storage[key] = value;
			});
			mockLocalStorage.removeItem.mockImplementation((key) => {
				delete storage[key];
			});

			// Save data
			const testData = {
				signInToken: 'test-token',
				mainForm: { key: 'value' },
				student: 'Test Student'
			};
			saveData(testData);

			// Load data
			const loadedData = loadData();

			expect(loadedData.signInToken).toBe('test-token');
			expect(loadedData.mainForm).toEqual({ key: 'value' });
			expect(loadedData.student).toBe('Test Student');
		});

		it('should clear data correctly', () => {
			// Setup storage with data
			const storage: Record<string, string> = {
				signInToken: 'test-token',
				mainForm: JSON.stringify({ key: 'value' }),
				student: 'Test Student'
			};

			mockLocalStorage.getItem.mockImplementation((key) => storage[key] || null);
			mockLocalStorage.removeItem.mockImplementation((key) => {
				delete storage[key];
			});

			// Clear data
			clearData();

			// Verify data is cleared
			const loadedData = loadData();
			expect(loadedData).toEqual({
				signInToken: null,
				mainForm: null,
				semesters: null,
				calendar: null,
				student: null
			});
		});
	});
});
