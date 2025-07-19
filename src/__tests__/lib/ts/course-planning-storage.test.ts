import {
	saveCoursePlanningData,
	loadCoursePlanningData,
	clearCoursePlanningData
} from '@/lib/ts/storage';
import { CoursePlanningStorageData } from '@/types';
import { JSONResultData, MajorSelectedSubjects } from '@/types/course-planning';

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

describe('Course Planning Storage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const mockCalendarData: JSONResultData = {
		title: 'Test Semester',
		minDate: 240101,
		maxDate: 240630,
		majors: {
			CT4: {
				'Toán cao cấp': {
					'CT4-01': {
						schedules: {
							'240101': {
								dayOfWeek: 2,
								sessions: [1, 2, 3]
							}
						},
						teacher: 'Nguyễn Văn A'
					}
				}
			}
		}
	};

	const mockSelectedClasses: MajorSelectedSubjects = {
		CT4: {
			'Toán cao cấp': {
				show: true,
				class: 'CT4-01'
			}
		}
	};

	const mockStorageData: CoursePlanningStorageData = {
		calendar: mockCalendarData,
		selectedClasses: mockSelectedClasses,
		title: 'Test Semester',
		lastUpdated: '2024-01-01T00:00:00.000Z'
	};

	describe('saveCoursePlanningData', () => {
		it('should save course planning data to localStorage', () => {
			const testData = {
				calendar: mockCalendarData,
				selectedClasses: mockSelectedClasses,
				title: 'Test Semester'
			};

			saveCoursePlanningData(testData);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'coursePlanning',
				expect.stringContaining('"title":"Test Semester"')
			);
		});

		it('should add lastUpdated timestamp when saving', () => {
			const testData = {
				calendar: mockCalendarData,
				selectedClasses: mockSelectedClasses
			};

			saveCoursePlanningData(testData);

			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'coursePlanning',
				expect.stringContaining('"lastUpdated"')
			);
		});

		it('should handle save errors gracefully', () => {
			mockLocalStorage.setItem.mockImplementation(() => {
				throw new Error('Storage quota exceeded');
			});

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			expect(() => {
				saveCoursePlanningData(mockStorageData);
			}).not.toThrow();

			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to save course planning data:',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});

		it('should not save in SSR environment', () => {
			const originalWindow = global.window;
			delete (global as any).window;

			saveCoursePlanningData(mockStorageData);

			expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

			global.window = originalWindow;
		});
	});

	describe('loadCoursePlanningData', () => {
		it('should load course planning data from localStorage', () => {
			mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockStorageData));

			const result = loadCoursePlanningData();

			expect(mockLocalStorage.getItem).toHaveBeenCalledWith('coursePlanning');
			expect(result).toEqual(mockStorageData);
		});

		it('should return null when no data exists', () => {
			mockLocalStorage.getItem.mockReturnValue(null);

			const result = loadCoursePlanningData();

			expect(result).toBeNull();
		});

		it('should handle corrupted data gracefully', () => {
			mockLocalStorage.getItem.mockReturnValue('invalid json');

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			const result = loadCoursePlanningData();

			expect(result).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to load course planning data:',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});

		it('should return null in SSR environment', () => {
			const originalWindow = global.window;
			delete (global as any).window;

			const result = loadCoursePlanningData();

			expect(result).toBeNull();

			global.window = originalWindow;
		});
	});

	describe('clearCoursePlanningData', () => {
		it('should remove course planning data from localStorage', () => {
			clearCoursePlanningData();

			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('coursePlanning');
		});

		it('should not throw in SSR environment', () => {
			const originalWindow = global.window;
			delete (global as any).window;

			expect(() => {
				clearCoursePlanningData();
			}).not.toThrow();

			global.window = originalWindow;
		});
	});

	describe('integration tests', () => {
		it('should save and load data correctly', () => {
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
				calendar: mockCalendarData,
				selectedClasses: mockSelectedClasses,
				title: 'Integration Test'
			};

			saveCoursePlanningData(testData);

			// Load data
			const loadedData = loadCoursePlanningData();

			expect(loadedData).toBeDefined();
			expect(loadedData?.calendar).toEqual(mockCalendarData);
			expect(loadedData?.selectedClasses).toEqual(mockSelectedClasses);
			expect(loadedData?.title).toBe('Integration Test');
			expect(loadedData?.lastUpdated).toBeDefined();

			// Clear data
			clearCoursePlanningData();
			const clearedData = loadCoursePlanningData();

			expect(clearedData).toBeNull();
		});
	});
});
