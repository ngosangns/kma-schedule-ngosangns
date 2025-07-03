import { 
	getShiftRange, 
	getShiftTimeRange, 
	formatShiftDisplay, 
	formatTimeDisplay 
} from '@/lib/utils';

describe('Shift Range Display Integration', () => {
	describe('Single Shift Display', () => {
		test('should display single shift correctly', () => {
			// Test single shift subjects
			const singleShiftSubject = {
				shiftNumber: 1,
				length: 1,
				name: 'Toán cao cấp'
			};

			const shiftDisplay = formatShiftDisplay(singleShiftSubject.shiftNumber, singleShiftSubject.length);
			const timeDisplay = formatTimeDisplay(singleShiftSubject.shiftNumber, singleShiftSubject.length);

			expect(shiftDisplay).toBe('Tiết 1');
			expect(timeDisplay).toBe('07:00 - 07:50');
		});

		test('should handle different single shifts', () => {
			const testCases = [
				{ shift: 1, expected: { display: 'Tiết 1', time: '07:00 - 07:50' } },
				{ shift: 7, expected: { display: 'Tiết 7', time: '13:00 - 13:50' } },
				{ shift: 13, expected: { display: 'Tiết 13', time: '19:00 - 19:50' } }
			];

			testCases.forEach(({ shift, expected }) => {
				const shiftDisplay = formatShiftDisplay(shift, 1);
				const timeDisplay = formatTimeDisplay(shift, 1);

				expect(shiftDisplay).toBe(expected.display);
				expect(timeDisplay).toBe(expected.time);
			});
		});
	});

	describe('Multiple Shift Display', () => {
		test('should display multiple shifts correctly', () => {
			// Test multiple shift subjects (common in KMA)
			const multipleShiftSubject = {
				shiftNumber: 1,
				length: 3,
				name: 'Lập trình Web'
			};

			const shiftDisplay = formatShiftDisplay(multipleShiftSubject.shiftNumber, multipleShiftSubject.length);
			const timeDisplay = formatTimeDisplay(multipleShiftSubject.shiftNumber, multipleShiftSubject.length);

			expect(shiftDisplay).toBe('Tiết 1-3');
			expect(timeDisplay).toBe('07:00 - 09:50');
		});

		test('should handle different multiple shift scenarios', () => {
			const testCases = [
				{ 
					start: 1, 
					length: 3, 
					expected: { display: 'Tiết 1-3', time: '07:00 - 09:50' } 
				},
				{ 
					start: 7, 
					length: 2, 
					expected: { display: 'Tiết 7-8', time: '13:00 - 14:50' } 
				},
				{ 
					start: 13, 
					length: 3, 
					expected: { display: 'Tiết 13-15', time: '19:00 - 21:50' } 
				}
			];

			testCases.forEach(({ start, length, expected }) => {
				const shiftDisplay = formatShiftDisplay(start, length);
				const timeDisplay = formatTimeDisplay(start, length);

				expect(shiftDisplay).toBe(expected.display);
				expect(timeDisplay).toBe(expected.time);
			});
		});
	});

	describe('Real KMA Schedule Scenarios', () => {
		test('should handle typical morning class (3 shifts)', () => {
			// Typical morning class: Tiết 1-3 (07:00 - 09:50)
			const morningClass = { shiftNumber: 1, length: 3 };
			
			expect(formatShiftDisplay(morningClass.shiftNumber, morningClass.length)).toBe('Tiết 1-3');
			expect(formatTimeDisplay(morningClass.shiftNumber, morningClass.length)).toBe('07:00 - 09:50');
		});

		test('should handle typical afternoon class (2 shifts)', () => {
			// Typical afternoon class: Tiết 7-8 (13:00 - 14:50)
			const afternoonClass = { shiftNumber: 7, length: 2 };
			
			expect(formatShiftDisplay(afternoonClass.shiftNumber, afternoonClass.length)).toBe('Tiết 7-8');
			expect(formatTimeDisplay(afternoonClass.shiftNumber, afternoonClass.length)).toBe('13:00 - 14:50');
		});

		test('should handle evening class (3 shifts)', () => {
			// Evening class: Tiết 13-15 (19:00 - 21:50)
			const eveningClass = { shiftNumber: 13, length: 3 };
			
			expect(formatShiftDisplay(eveningClass.shiftNumber, eveningClass.length)).toBe('Tiết 13-15');
			expect(formatTimeDisplay(eveningClass.shiftNumber, eveningClass.length)).toBe('19:00 - 21:50');
		});

		test('should handle lab sessions (4 shifts)', () => {
			// Lab session: Tiết 1-4 (07:00 - 10:50)
			const labSession = { shiftNumber: 1, length: 4 };
			
			expect(formatShiftDisplay(labSession.shiftNumber, labSession.length)).toBe('Tiết 1-4');
			expect(formatTimeDisplay(labSession.shiftNumber, labSession.length)).toBe('07:00 - 10:50');
		});
	});

	describe('Edge Cases and Error Handling', () => {
		test('should handle missing length (default to 1)', () => {
			const subjectWithoutLength = { shiftNumber: 5 };
			
			const shiftDisplay = formatShiftDisplay(subjectWithoutLength.shiftNumber, undefined as any);
			const timeDisplay = formatTimeDisplay(subjectWithoutLength.shiftNumber, undefined as any);

			// Should default to single shift
			expect(shiftDisplay).toBe('Tiết 5');
			expect(timeDisplay).toBe('11:00 - 11:50');
		});

		test('should handle zero length (default to 1)', () => {
			const shiftDisplay = formatShiftDisplay(5, 0);
			const timeDisplay = formatTimeDisplay(5, 0);

			expect(shiftDisplay).toBe('Tiết 5');
			expect(timeDisplay).toBe('11:00 - 11:50');
		});

		test('should handle invalid shift numbers', () => {
			const shiftDisplay = formatShiftDisplay(0, 1);
			const timeDisplay = formatTimeDisplay(0, 1);

			expect(shiftDisplay).toBe('Tiết 1'); // Should default to 1
			expect(timeDisplay).toBe('07:00 - 07:50');
		});
	});

	describe('Calendar Component Integration', () => {
		test('should work with calendar component data structure', () => {
			// Mock subject data as it would appear in calendar component
			const mockSubject = {
				name: 'Mạng máy tính',
				address: 'TC-205',
				shiftNumber: 1,
				length: 3,
				instructor: 'TS. Nguyễn Văn A'
			};

			// Simulate what calendar component would do
			const shiftDisplay = formatShiftDisplay(mockSubject.shiftNumber, mockSubject.length || 1);
			const timeDisplay = formatTimeDisplay(mockSubject.shiftNumber, mockSubject.length || 1);

			expect(shiftDisplay).toBe('Tiết 1-3');
			expect(timeDisplay).toBe('07:00 - 09:50');

			// Verify it's different from old single-shift display
			expect(shiftDisplay).not.toBe('Tiết 1');
			expect(timeDisplay).not.toBe('07:00 - 07:50');
		});

		test('should handle subjects without length property', () => {
			// Some subjects might not have length property
			const mockSubject = {
				name: 'Toán rời rạc',
				address: 'TC-101',
				shiftNumber: 7
				// No length property
			};

			const shiftDisplay = formatShiftDisplay(mockSubject.shiftNumber, mockSubject.length || 1);
			const timeDisplay = formatTimeDisplay(mockSubject.shiftNumber, mockSubject.length || 1);

			expect(shiftDisplay).toBe('Tiết 7');
			expect(timeDisplay).toBe('13:00 - 13:50');
		});
	});

	describe('Performance and Consistency', () => {
		test('should be consistent across multiple calls', () => {
			const shift = 1;
			const length = 3;

			// Call multiple times to ensure consistency
			for (let i = 0; i < 10; i++) {
				expect(formatShiftDisplay(shift, length)).toBe('Tiết 1-3');
				expect(formatTimeDisplay(shift, length)).toBe('07:00 - 09:50');
			}
		});

		test('should handle large datasets efficiently', () => {
			// Simulate processing many subjects
			const subjects = Array.from({ length: 100 }, (_, i) => ({
				shiftNumber: (i % 15) + 1,
				length: (i % 4) + 1
			}));

			const startTime = Date.now();
			
			subjects.forEach(subject => {
				formatShiftDisplay(subject.shiftNumber, subject.length);
				formatTimeDisplay(subject.shiftNumber, subject.length);
			});

			const endTime = Date.now();
			const processingTime = endTime - startTime;

			// Should process 100 subjects in less than 100ms
			expect(processingTime).toBeLessThan(100);
		});
	});
});
