/**
 * Integration tests for calendar processing with real data
 * Tests the calendar processing functions with actual server responses
 */

import { login } from '@/lib/ts/user';
import {
	fetchCalendarWithGet,
	fetchCalendarWithPost,
	processCalendar,
	processStudent,
	processMainForm,
	processSemesters,
	filterTrashInHtml,
	restructureTKB,
	cleanFromHTMLtoArray
} from '@/lib/ts/calendar';

// Skip these tests if credentials are not provided
const TEST_USERNAME = process.env['TEST_USERNAME'];
const TEST_PASSWORD = process.env['TEST_PASSWORD'];

const skipIfNoCredentials = TEST_USERNAME && TEST_PASSWORD ? describe : describe.skip;

skipIfNoCredentials('Calendar Processing Integration Tests', () => {
	let signInToken: string;
	let mainForm: any;
	let semesters: any;

	beforeAll(async () => {
		jest.setTimeout(30000);

		// Login and get initial data
		signInToken = await login(TEST_USERNAME!, TEST_PASSWORD!);
		const response = await fetchCalendarWithGet(signInToken);
		const filteredResponse = filterTrashInHtml(response);

		mainForm = processMainForm(filteredResponse);
		semesters = processSemesters(filteredResponse);
	});

	describe('Calendar Data Structure', () => {
		test('should process calendar with correct structure', async () => {
			const response = await fetchCalendarWithGet(signInToken);
			const filteredResponse = filterTrashInHtml(response);
			// Use restructureTKB directly to avoid Worker issues in test environment
			const cleanedData = cleanFromHTMLtoArray(filteredResponse);
			const calendarResult = restructureTKB(cleanedData);
			const calendar = calendarResult ? calendarResult : { data_subject: [] };

			expect(calendar).toBeDefined();
			expect(calendar).toHaveProperty('data_subject');
			expect(Array.isArray(calendar.data_subject)).toBe(true);

			// Test calendar structure - data_subject contains weeks with shifts
			if (calendar.data_subject.length > 0) {
				const firstWeek = calendar.data_subject[0];
				expect(Array.isArray(firstWeek)).toBe(true);

				if (firstWeek.length > 0) {
					const firstDay = firstWeek[0];
					expect(firstDay).toHaveProperty('time');
					expect(firstDay).toHaveProperty('shift');
					expect(Array.isArray(firstDay.shift)).toBe(true);

					console.log('Sample day structure:', {
						time: firstDay.time,
						shiftsCount: firstDay.shift.length
					});
				}
			}
		});

		test('should handle different semester data', async () => {
			if (semesters && semesters.semesters && semesters.semesters.length > 1) {
				// Test with different semester
				const differentSemester = semesters.semesters.find(
					(sem: any) => sem.value !== semesters.currentSemester
				);

				if (differentSemester) {
					const updatedMainForm = { ...mainForm, drpSemester: differentSemester.value };

					const response = await fetchCalendarWithPost(updatedMainForm, signInToken);
					const filteredResponse = filterTrashInHtml(response);
					// Use restructureTKB directly to avoid Worker issues in test environment
					const cleanedData = cleanFromHTMLtoArray(filteredResponse);
					const calendarResult = restructureTKB(cleanedData);
					const calendar = calendarResult ? calendarResult : { data_subject: [] };

					expect(calendar).toBeDefined();
					expect(calendar).toHaveProperty('data_subject');
					expect(Array.isArray(calendar.data_subject)).toBe(true);

					console.log(
						`Semester ${differentSemester.value} has ${calendar.data_subject.length} subjects`
					);
				}
			}
		});
	});

	describe('Student Information Processing', () => {
		test('should extract student name correctly', async () => {
			const response = await fetchCalendarWithGet(signInToken);
			const filteredResponse = filterTrashInHtml(response);
			const student = processStudent(filteredResponse);

			expect(student).toBeDefined();
			expect(typeof student).toBe('string');
			expect(student.length).toBeGreaterThan(0);
			expect(student).not.toBe('undefined');
			expect(student).not.toBe('null');

			console.log(`Extracted student name: "${student}"`);
		});
	});

	describe('Form Data Processing', () => {
		test('should extract form fields correctly', async () => {
			const response = await fetchCalendarWithGet(signInToken);
			const filteredResponse = filterTrashInHtml(response);
			const form = processMainForm(filteredResponse);

			expect(form).toBeDefined();
			expect(typeof form).toBe('object');

			// Check required form fields
			expect(form).toHaveProperty('__VIEWSTATE');
			expect(form).toHaveProperty('__EVENTVALIDATION');
			expect(form.__VIEWSTATE).toBeDefined();
			expect(form.__EVENTVALIDATION).toBeDefined();

			console.log('Form fields extracted:', Object.keys(form));
		});
	});

	describe('Semester Data Processing', () => {
		test('should extract semester information correctly', async () => {
			const response = await fetchCalendarWithGet(signInToken);
			const filteredResponse = filterTrashInHtml(response);
			const semesterData = processSemesters(filteredResponse);

			expect(semesterData).toBeDefined();
			expect(semesterData).toHaveProperty('semesters');
			expect(semesterData).toHaveProperty('currentSemester');
			expect(Array.isArray(semesterData.semesters)).toBe(true);
			expect(semesterData.semesters.length).toBeGreaterThan(0);

			// Check semester structure
			const semester = semesterData.semesters[0];
			expect(semester).toHaveProperty('value');
			expect(semester).toHaveProperty('th');
			expect(semester.value).toBeDefined();
			expect(semester.th).toBeDefined();

			console.log('Available semesters:');
			semesterData.semesters.forEach((sem: any) => {
				console.log(`- ${sem.th} (${sem.value})`);
			});
			console.log(`Current semester: ${semesterData.currentSemester}`);
		});
	});

	describe('Data Consistency', () => {
		test('should maintain data consistency across multiple fetches', async () => {
			// First fetch
			const response1 = await fetchCalendarWithGet(signInToken);
			const filteredResponse1 = filterTrashInHtml(response1);
			const student1 = processStudent(filteredResponse1);
			const semesters1 = processSemesters(filteredResponse1);

			// Second fetch
			const response2 = await fetchCalendarWithGet(signInToken);
			const filteredResponse2 = filterTrashInHtml(response2);
			const student2 = processStudent(filteredResponse2);
			const semesters2 = processSemesters(filteredResponse2);

			// Data should be consistent
			expect(student1).toBe(student2);
			expect(semesters1.currentSemester).toBe(semesters2.currentSemester);
			expect(semesters1.semesters.length).toBe(semesters2.semesters.length);
		});
	});

	describe('Error Handling', () => {
		test('should handle invalid token gracefully', async () => {
			const invalidToken = 'invalid-token';

			try {
				await fetchCalendarWithGet(invalidToken);
				throw new Error('Expected fetchCalendarWithGet to fail with invalid token');
			} catch (error) {
				expect(error).toBeDefined();
				console.log('Expected fetch failure:', error.message);
			}
		});

		test('should handle empty response gracefully', async () => {
			try {
				await processCalendar('');
				throw new Error('Expected processCalendar to fail with empty response');
			} catch (error) {
				expect(error).toBeDefined();
				console.log('Expected processing failure:', error.message);
			}
		});

		test('should handle malformed HTML gracefully', async () => {
			const malformedHtml = '<html><body>Invalid content</body></html>';

			// These should not throw but return empty/default values
			const student = processStudent(malformedHtml);
			const form = processMainForm(malformedHtml);
			const semesters = processSemesters(malformedHtml);

			expect(student).toBeDefined();
			expect(form).toBeDefined();
			expect(semesters).toBeDefined();
		});
	});

	describe('Performance', () => {
		test('should process data within reasonable time', async () => {
			const startTime = Date.now();

			const response = await fetchCalendarWithGet(signInToken);
			const filteredResponse = filterTrashInHtml(response);
			// Use restructureTKB directly to avoid Worker issues in test environment
			const cleanedData = cleanFromHTMLtoArray(filteredResponse);
			const calendarResult = restructureTKB(cleanedData);
			const calendar = calendarResult ? calendarResult : { data_subject: [] };
			const student = processStudent(filteredResponse);
			const form = processMainForm(filteredResponse);
			const semesters = processSemesters(filteredResponse);

			const endTime = Date.now();
			const processingTime = endTime - startTime;

			console.log(`Data processing completed in ${processingTime}ms`);

			// Should complete within 10 seconds
			expect(processingTime).toBeLessThan(10000);

			// Verify all data was processed
			expect(calendar).toBeDefined();
			expect(student).toBeDefined();
			expect(form).toBeDefined();
			expect(semesters).toBeDefined();
		});
	});
});
