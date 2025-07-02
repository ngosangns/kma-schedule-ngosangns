import {
	fetchCalendarWithGet,
	fetchCalendarWithPost,
	processCalendar,
	processStudent,
	processMainForm,
	processSemesters,
	getFieldFromResult,
	filterTrashInHtml
} from '@/lib/ts/calendar';

// Mock worker for processCalendar
const mockWorker = {
	postMessage: jest.fn(),
	onmessage: null as any,
	onerror: null as any,
	terminate: jest.fn()
};

// Mock createInlineWorker
jest.mock('@/lib/ts/worker', () => ({
	createInlineWorker: jest.fn(() => mockWorker)
}));

describe('Calendar Processing Functions', () => {
	let originalFetch: any;

	beforeEach(() => {
		jest.clearAllMocks();
		originalFetch = global.fetch;
		global.fetch = jest.fn();
	});

	afterEach(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	describe('getFieldFromResult', () => {
		it('should extract field value from HTML', () => {
			const html = '<input id="testField" value="testValue" />';
			const result = getFieldFromResult(html, 'testField');
			expect(result).toBe('testValue');
		});

		it('should return false for non-existent field', () => {
			const html = '<input id="otherField" value="testValue" />';
			const result = getFieldFromResult(html, 'testField');
			expect(result).toBe(false);
		});

		it('should handle multiple fields with same id', () => {
			const html = `
        <input id="testField" value="firstValue" />
        <input id="testField" value="secondValue" />
      `;
			const result = getFieldFromResult(html, 'testField');
			expect(result).toBe('firstValue');
		});
	});

	describe('filterTrashInHtml', () => {
		it('should remove src attributes from HTML', () => {
			const html = '<div>Content</div><img src="image.jpg" alt="test" />';
			const result = filterTrashInHtml(html);
			expect(result).not.toContain('src="image.jpg"');
			expect(result).toContain('<div>Content</div>');
			expect(result).toContain('<img  alt="test" />');
		});

		it('should handle HTML without src attributes', () => {
			const html = '<div>Content</div><p>No images here</p>';
			const result = filterTrashInHtml(html);
			expect(result).toBe(html);
		});
	});

	describe('fetchCalendarWithGet', () => {
		it('should make GET request with correct headers', async () => {
			const mockResponse = '<html>Calendar data</html>';
			(global.fetch as jest.Mock).mockResolvedValue({
				text: jest.fn().mockResolvedValue(mockResponse)
			});

			const signInToken = 'SignIn=test_token';
			const result = await fetchCalendarWithGet(signInToken);

			expect(global.fetch).toHaveBeenCalledWith(
				'https://actvn-schedule.cors-ngosangns.workers.dev/subject',
				{
					method: 'GET',
					headers: {
						'x-cors-headers': JSON.stringify({
							Cookie: signInToken
						})
					}
				}
			);
			expect(result).toBe(mockResponse);
		});
	});

	describe('fetchCalendarWithPost', () => {
		it('should make POST request with form data', async () => {
			const mockResponse = '<html>Calendar data</html>';
			(global.fetch as jest.Mock).mockResolvedValue({
				text: jest.fn().mockResolvedValue(mockResponse)
			});

			const formObj = { semester: '20241', student: 'test' };
			const signInToken = 'SignIn=test_token';
			const result = await fetchCalendarWithPost(formObj, signInToken);

			expect(global.fetch).toHaveBeenCalledWith(
				'https://actvn-schedule.cors-ngosangns.workers.dev/subject',
				{
					method: 'POST',
					body: 'semester=20241&student=test',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'x-cors-headers': JSON.stringify({
							Cookie: signInToken
						})
					}
				}
			);
			expect(result).toBe(mockResponse);
		});
	});

	describe('processCalendar', () => {
		it('should throw error for empty data', async () => {
			await expect(processCalendar('')).rejects.toThrow('empty data');
		});

		it('should process calendar data using worker', async () => {
			const mockCalendarData = { data_subject: [{ name: 'Test Subject' }] };

			// Simulate worker success
			setTimeout(() => {
				if (mockWorker.onmessage) {
					mockWorker.onmessage({ data: mockCalendarData });
				}
			}, 10);

			const result = await processCalendar('<html>Valid calendar data</html>');

			expect(result).toEqual(mockCalendarData);
			expect(mockWorker.postMessage).toHaveBeenCalled();
		});

		it('should handle worker error', async () => {
			// Simulate worker error
			setTimeout(() => {
				if (mockWorker.onerror) {
					mockWorker.onerror(new Error('Worker error'));
				}
			}, 10);

			await expect(processCalendar('<html>Invalid data</html>')).rejects.toThrow('Worker error');
		});
	});

	describe('processStudent', () => {
		it('should extract student name from HTML', () => {
			const html = `
        <div>
          <span>Sinh viên:</span>
          <span>Nguyễn Văn A</span>
        </div>
      `;
			const result = processStudent(html);
			expect(typeof result).toBe('string');
		});

		it('should handle HTML without student info', () => {
			const html = '<div>No student info</div>';
			const result = processStudent(html);
			expect(result).toBeDefined();
		});
	});

	describe('processSemesters', () => {
		it('should extract semester options from select element', () => {
			const html = `
        <select name="drpSemester">
          <option value="20241">1_2024_2025</option>
          <option value="20242" selected>2_2024_2025</option>
        </select>
      `;
			const result = processSemesters(html);

			expect(result).toEqual({
				semesters: [
					{ value: '20241', from: '2024', to: '2025', th: '1' },
					{ value: '20242', from: '2024', to: '2025', th: '2' }
				],
				currentSemester: '20242'
			});
		});

		it('should return null for HTML without semester select', () => {
			const html = '<div>No semester select</div>';
			const result = processSemesters(html);
			expect(result).toBeNull();
		});
	});

	describe('processMainForm', () => {
		it('should extract form fields from HTML', () => {
			const html = `
        <form id="Form1">
          <input name="__VIEWSTATE" value="viewstate_value" />
          <input name="__EVENTVALIDATION" value="validation_value" />
          <select name="drpSemester">
            <option value="20241" selected>Semester 1</option>
          </select>
        </form>
      `;
			const result = processMainForm(html);

			expect(result).toHaveProperty('__VIEWSTATE');
			expect(result).toHaveProperty('__EVENTVALIDATION');
			expect(result).toHaveProperty('drpSemester');
		});
	});
});
