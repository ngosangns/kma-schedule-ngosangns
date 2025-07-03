import { getShiftTime, getShiftSession } from '@/lib/utils';

describe('Shift Time Functions', () => {
	describe('getShiftTime', () => {
		test('should return correct time for morning shifts', () => {
			expect(getShiftTime(1)).toEqual({ start: '07:00', end: '07:50' });
			expect(getShiftTime(2)).toEqual({ start: '08:00', end: '08:50' });
			expect(getShiftTime(3)).toEqual({ start: '09:00', end: '09:50' });
			expect(getShiftTime(4)).toEqual({ start: '10:00', end: '10:50' });
			expect(getShiftTime(5)).toEqual({ start: '11:00', end: '11:50' });
			expect(getShiftTime(6)).toEqual({ start: '12:00', end: '12:50' });
		});

		test('should return correct time for afternoon shifts', () => {
			expect(getShiftTime(7)).toEqual({ start: '13:00', end: '13:50' });
			expect(getShiftTime(8)).toEqual({ start: '14:00', end: '14:50' });
			expect(getShiftTime(9)).toEqual({ start: '15:00', end: '15:50' });
			expect(getShiftTime(10)).toEqual({ start: '16:00', end: '16:50' });
			expect(getShiftTime(11)).toEqual({ start: '17:00', end: '17:50' });
			expect(getShiftTime(12)).toEqual({ start: '18:00', end: '18:50' });
		});

		test('should return correct time for evening shifts', () => {
			expect(getShiftTime(13)).toEqual({ start: '19:00', end: '19:50' });
			expect(getShiftTime(14)).toEqual({ start: '20:00', end: '20:50' });
			expect(getShiftTime(15)).toEqual({ start: '21:00', end: '21:50' });
		});

		test('should handle invalid shift numbers', () => {
			expect(getShiftTime(0)).toEqual({ start: '00:00', end: '00:00' });
			expect(getShiftTime(16)).toEqual({ start: '00:00', end: '00:00' });
			expect(getShiftTime(-1)).toEqual({ start: '00:00', end: '00:00' });
		});
	});

	describe('getShiftSession', () => {
		test('should classify morning shifts correctly', () => {
			expect(getShiftSession(1)).toBe('morning');
			expect(getShiftSession(2)).toBe('morning');
			expect(getShiftSession(3)).toBe('morning');
			expect(getShiftSession(4)).toBe('morning');
			expect(getShiftSession(5)).toBe('morning');
			expect(getShiftSession(6)).toBe('morning');
		});

		test('should classify afternoon shifts correctly', () => {
			expect(getShiftSession(7)).toBe('afternoon');
			expect(getShiftSession(8)).toBe('afternoon');
			expect(getShiftSession(9)).toBe('afternoon');
			expect(getShiftSession(10)).toBe('afternoon');
			expect(getShiftSession(11)).toBe('afternoon');
			expect(getShiftSession(12)).toBe('afternoon');
		});

		test('should classify evening shifts correctly', () => {
			expect(getShiftSession(13)).toBe('evening');
			expect(getShiftSession(14)).toBe('evening');
			expect(getShiftSession(15)).toBe('evening');
		});

		test('should handle edge cases', () => {
			expect(getShiftSession(0)).toBe('evening'); // fallback
			expect(getShiftSession(16)).toBe('evening'); // fallback
		});
	});

	describe('Integration test - realistic schedule', () => {
		test('should provide logical time progression', () => {
			// Test một lịch học thực tế
			const schedule = [
				{ shift: 1, expected: { start: '07:00', end: '07:50', session: 'morning' } },
				{ shift: 2, expected: { start: '08:00', end: '08:50', session: 'morning' } },
				{ shift: 7, expected: { start: '13:00', end: '13:50', session: 'afternoon' } },
				{ shift: 8, expected: { start: '14:00', end: '14:50', session: 'afternoon' } },
				{ shift: 13, expected: { start: '19:00', end: '19:50', session: 'evening' } }
			];

			schedule.forEach(({ shift, expected }) => {
				const time = getShiftTime(shift);
				const session = getShiftSession(shift);

				expect(time).toEqual({ start: expected.start, end: expected.end });
				expect(session).toBe(expected.session);
			});
		});

		test('should have no time overlaps between consecutive shifts', () => {
			for (let shift = 1; shift <= 14; shift++) {
				const currentShift = getShiftTime(shift);
				const nextShift = getShiftTime(shift + 1);

				// Chuyển đổi thời gian thành phút để so sánh
				const currentEndMinutes =
					parseInt(currentShift.end.split(':')[0]) * 60 + parseInt(currentShift.end.split(':')[1]);
				const nextStartMinutes =
					parseInt(nextShift.start.split(':')[0]) * 60 + parseInt(nextShift.start.split(':')[1]);

				// Ca tiếp theo phải bắt đầu sau khi ca hiện tại kết thúc
				expect(nextStartMinutes).toBeGreaterThan(currentEndMinutes);
			}
		});
	});
});
