import { restructureTKB } from '@/lib/ts/calendar';
import { getShiftTime, getShiftSession } from '@/lib/utils';

describe('Calendar Display Integration', () => {
	// Mock data với thời gian thực tế
	const mockCalendarData = [
		// Header row
		[
			'Lớp học phần',
			'Học phần',
			'Thời gian',
			'Ðịa điểm',
			'Giảng viên',
			'Sĩ số',
			'Số ÐK',
			'Số TC',
			'Ghi chú'
		],
		// Subject data row với nhiều ca học
		[
			'IT4409 01',
			'Mạng máy tính',
			'15/01/2024 - 15/05/2024:(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16)&nbsp;&nbsp;&nbsp;Thứ 2 tiết 1,2,3&nbsp;&nbsp;&nbsp;Thứ 5 tiết 7,8,9',
			'\n(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16)TC-205',
			'Nguyễn Văn A&nbsp;&nbsp;&nbsp;',
			'60',
			'45',
			'3',
			''
		],
		// Dummy row
		['dummy']
	];

	test('should process calendar data and provide correct shift information', () => {
		const result = restructureTKB(JSON.parse(JSON.stringify(mockCalendarData)));

		expect(result).not.toBe(false);

		if (result !== false) {
			expect(result.weeks).toBeDefined();
			expect(result.weeks.length).toBeGreaterThan(0);

			// Kiểm tra cấu trúc tuần
			const firstWeek = result.weeks[0];
			expect(firstWeek).toHaveLength(7); // 7 ngày trong tuần

			// Kiểm tra cấu trúc ngày
			const firstDay = firstWeek[0];
			expect(firstDay.shift).toBeDefined();
			expect(firstDay.shift).toHaveLength(16); // 16 ca học

			// Kiểm tra các ca có môn học
			let foundSubjects = 0;
			firstDay.shift.forEach((shift: any, index: number) => {
				if (shift.name) {
					foundSubjects++;

					// Kiểm tra thông tin ca học
					expect(shift.name).toBeDefined();
					expect(shift.content).toBeDefined();
					expect(shift.address).toBeDefined();
					expect(shift.length).toBeGreaterThan(0);

					// Kiểm tra số ca hợp lệ (1-16)
					const shiftNumber = index + 1;
					expect(shiftNumber).toBeGreaterThanOrEqual(1);
					expect(shiftNumber).toBeLessThanOrEqual(16);

					// Kiểm tra thời gian ca học
					const shiftTime = getShiftTime(shiftNumber);
					expect(shiftTime.start).toMatch(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
					expect(shiftTime.end).toMatch(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

					// Kiểm tra phân loại buổi học
					const session = getShiftSession(shiftNumber);
					expect(['morning', 'afternoon', 'evening']).toContain(session);
				}
			});

			expect(foundSubjects).toBeGreaterThan(0);
		}
	});

	test('should correctly map shift numbers to time slots', () => {
		// Test mapping từ ca 1 đến ca 15
		const testCases = [
			{ shift: 1, expectedStart: '07:00', expectedEnd: '07:50', expectedSession: 'morning' },
			{ shift: 2, expectedStart: '08:00', expectedEnd: '08:50', expectedSession: 'morning' },
			{ shift: 6, expectedStart: '12:00', expectedEnd: '12:50', expectedSession: 'morning' },
			{ shift: 7, expectedStart: '13:00', expectedEnd: '13:50', expectedSession: 'afternoon' },
			{ shift: 12, expectedStart: '18:00', expectedEnd: '18:50', expectedSession: 'afternoon' },
			{ shift: 13, expectedStart: '19:00', expectedEnd: '19:50', expectedSession: 'evening' },
			{ shift: 15, expectedStart: '21:00', expectedEnd: '21:50', expectedSession: 'evening' }
		];

		testCases.forEach(({ shift, expectedStart, expectedEnd, expectedSession }) => {
			const shiftTime = getShiftTime(shift);
			const session = getShiftSession(shift);

			expect(shiftTime.start).toBe(expectedStart);
			expect(shiftTime.end).toBe(expectedEnd);
			expect(session).toBe(expectedSession);
		});
	});

	test('should handle calendar data filtering by session', () => {
		const result = restructureTKB(JSON.parse(JSON.stringify(mockCalendarData)));

		if (result !== false && result.weeks.length > 0) {
			const firstWeek = result.weeks[0];

			// Simulate filtering logic như trong component
			const allShifts = firstWeek.flatMap((day: any) =>
				day.shift
					.map((subject: any, shiftIndex: number) => ({
						...subject,
						shiftNumber: shiftIndex + 1
					}))
					.filter((subject: any) => subject.name)
			);

			// Test filter by morning session
			const morningShifts = allShifts.filter((subject: any) => {
				const session = getShiftSession(subject.shiftNumber);
				return session === 'morning';
			});

			// Test filter by afternoon session
			const afternoonShifts = allShifts.filter((subject: any) => {
				const session = getShiftSession(subject.shiftNumber);
				return session === 'afternoon';
			});

			// Test filter by evening session
			const eveningShifts = allShifts.filter((subject: any) => {
				const session = getShiftSession(subject.shiftNumber);
				return session === 'evening';
			});

			// Verify that filtering works
			morningShifts.forEach((shift: any) => {
				expect(shift.shiftNumber).toBeGreaterThanOrEqual(1);
				expect(shift.shiftNumber).toBeLessThanOrEqual(6);
			});

			afternoonShifts.forEach((shift: any) => {
				expect(shift.shiftNumber).toBeGreaterThanOrEqual(7);
				expect(shift.shiftNumber).toBeLessThanOrEqual(12);
			});

			eveningShifts.forEach((shift: any) => {
				expect(shift.shiftNumber).toBeGreaterThanOrEqual(13);
				expect(shift.shiftNumber).toBeLessThanOrEqual(15);
			});
		}
	});

	test('should provide consistent time display format', () => {
		// Test tất cả các ca từ 1-15
		for (let shift = 1; shift <= 15; shift++) {
			const shiftTime = getShiftTime(shift);

			// Kiểm tra format HH:MM
			expect(shiftTime.start).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
			expect(shiftTime.end).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);

			// Kiểm tra logic thời gian (end > start)
			const startMinutes =
				parseInt(shiftTime.start.split(':')[0]) * 60 + parseInt(shiftTime.start.split(':')[1]);
			const endMinutes =
				parseInt(shiftTime.end.split(':')[0]) * 60 + parseInt(shiftTime.end.split(':')[1]);

			expect(endMinutes).toBeGreaterThan(startMinutes);

			// Kiểm tra thời lượng ca học (50 phút)
			expect(endMinutes - startMinutes).toBe(50);
		}
	});
});
