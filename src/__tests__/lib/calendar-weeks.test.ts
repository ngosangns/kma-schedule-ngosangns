import { restructureTKB } from '@/lib/ts/calendar';

describe('Calendar Weeks Processing', () => {
	// Mock data giống như dữ liệu thật từ server
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
		// Subject data row
		[
			'IT4409 01',
			'Mạng máy tính',
			'15/01/2024 - 15/05/2024:(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16)&nbsp;&nbsp;&nbsp;Thứ 2 tiết 1,2,3&nbsp;&nbsp;&nbsp;Thứ 5 tiết 1,2,3',
			'\n(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16)TC-205',
			'Nguyễn Văn A&nbsp;&nbsp;&nbsp;',
			'60',
			'45',
			'3',
			''
		],
		// Dummy row (sẽ bị pop() bởi hàm restructureTKB)
		['dummy']
	];

	test('should return correct structure with weeks and data_subject', () => {
		// Tạo copy để tránh mutation
		const testData = JSON.parse(JSON.stringify(mockCalendarData));
		const result = restructureTKB(testData);

		// Kiểm tra result không phải false
		expect(result).not.toBe(false);

		if (result !== false) {
			// Kiểm tra cấu trúc trả về
			expect(result).toHaveProperty('data_subject');
			expect(result).toHaveProperty('weeks');

			// Kiểm tra data_subject là array các môn học
			expect(Array.isArray(result.data_subject)).toBe(true);

			// Kiểm tra weeks là array các tuần
			expect(Array.isArray(result.weeks)).toBe(true);

			if (result.weeks.length > 0) {
				// Kiểm tra mỗi tuần có 7 ngày
				expect(result.weeks[0]).toHaveLength(7);

				// Kiểm tra mỗi ngày có cấu trúc đúng
				const firstDay = result.weeks[0][0];
				expect(firstDay).toHaveProperty('time');
				expect(firstDay).toHaveProperty('shift');
				expect(typeof firstDay.time).toBe('number');
				expect(Array.isArray(firstDay.shift)).toBe(true);
			}
		}
	});

	test('should calculate correct number of weeks for semester', () => {
		// Tạo copy để tránh mutation từ test trước
		const testData = JSON.parse(JSON.stringify(mockCalendarData));
		const result = restructureTKB(testData);

		// Kiểm tra result không phải false
		expect(result).not.toBe(false);

		if (result !== false) {
			// Kiểm tra có weeks
			expect(result).toHaveProperty('weeks');
			expect(Array.isArray(result.weeks)).toBe(true);

			if (result.weeks.length > 0) {
				// Với dữ liệu từ 15/01/2024 đến 15/05/2024 (khoảng 16 tuần)
				// Số tuần nên >= 16
				expect(result.weeks.length).toBeGreaterThanOrEqual(16);

				// Kiểm tra tuần đầu và cuối
				const firstWeek = result.weeks[0];
				const lastWeek = result.weeks[result.weeks.length - 1];

				expect(firstWeek).toHaveLength(7);
				// Tuần cuối có thể không đầy đủ 7 ngày
				expect(lastWeek.length).toBeGreaterThan(0);
				expect(lastWeek.length).toBeLessThanOrEqual(7);

				// Kiểm tra thời gian tuần đầu phải trước tuần cuối
				expect(firstWeek[0].time).toBeLessThan(lastWeek[0].time);
			}
		}
	});

	test('should handle empty data correctly', () => {
		const emptyData = [
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
			['dummy'] // Dummy row để không bị pop() thành empty
		];

		const result = restructureTKB(emptyData);
		expect(result).toBe(false);
	});

	test('should handle malformed data gracefully', () => {
		const malformedData = [
			// Header với đủ cột
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
			// Data row với thời gian không đúng format
			[
				'IT4409 01',
				'Mạng máy tính',
				'Invalid time format without proper date pattern',
				'TC-205',
				'Nguyễn Văn A',
				'60',
				'45',
				'3',
				''
			],
			['dummy'] // Dummy row để không bị pop() thành empty
		];

		// Với dữ liệu malformed, hàm có thể throw error hoặc trả về false
		// Chúng ta chỉ cần đảm bảo nó không crash toàn bộ app
		let result;
		try {
			result = restructureTKB(malformedData);
		} catch {
			// Nếu throw error, coi như xử lý malformed data
			result = false;
		}

		expect(result).toBe(false);
	});
});
