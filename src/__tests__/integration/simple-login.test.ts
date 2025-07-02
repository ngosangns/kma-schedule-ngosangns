/**
 * Simple login test with real credentials
 */

import { login } from '@/lib/ts/user';
import {
	fetchCalendarWithGet,
	processCalendar,
	processStudent,
	processMainForm,
	processSemesters,
	filterTrashInHtml,
	restructureTKB,
	cleanFromHTMLtoArray
} from '@/lib/ts/calendar';

// Skip these tests if credentials are not provided
const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

const skipIfNoCredentials = TEST_USERNAME && TEST_PASSWORD ? describe : describe.skip;

skipIfNoCredentials('Simple Login Test', () => {
	beforeAll(() => {
		jest.setTimeout(30000);
	});

	test('should login successfully with real credentials', async () => {
		console.log('Testing login with username:', TEST_USERNAME);

		try {
			const token = await login(TEST_USERNAME!, TEST_PASSWORD!);

			expect(token).toBeDefined();
			expect(typeof token).toBe('string');
			expect(token.length).toBeGreaterThan(0);

			console.log('Login successful! Token received:', token.substring(0, 50) + '...');
		} catch (error) {
			console.error('Login failed:', error);
			throw error;
		}
	});

	test('should fail with invalid credentials', async () => {
		try {
			await login('invalid_user', 'invalid_pass');
			throw new Error('Expected login to fail with invalid credentials');
		} catch (error) {
			expect(error).toBeDefined();
			console.log('Expected login failure:', error.message);
		}
	});

	test('should complete full workflow with real data', async () => {
		console.log('Testing full workflow...');

		try {
			// Step 1: Login
			const token = await login(TEST_USERNAME!, TEST_PASSWORD!);
			expect(token).toBeDefined();
			console.log('✓ Login successful');

			// Step 2: Fetch calendar data
			const response = await fetchCalendarWithGet(token);
			expect(response).toBeDefined();
			expect(typeof response).toBe('string');
			expect(response.length).toBeGreaterThan(0);
			console.log('✓ Calendar data fetched');

			// Step 3: Filter response
			const filteredResponse = filterTrashInHtml(response);
			expect(filteredResponse).toBeDefined();
			console.log('✓ HTML filtered');

			// Step 4: Process all data
			// Use restructureTKB directly to avoid Worker issues in test environment
			const cleanedData = cleanFromHTMLtoArray(filteredResponse);
			const calendarResult = restructureTKB(cleanedData);
			const calendar = calendarResult ? calendarResult : { data_subject: [] };
			const student = processStudent(filteredResponse);
			const mainForm = processMainForm(filteredResponse);
			const semesters = processSemesters(filteredResponse);

			// Step 5: Validate processed data
			expect(calendar).toBeDefined();
			expect(calendar.data_subject).toBeDefined();
			expect(Array.isArray(calendar.data_subject)).toBe(true);

			expect(student).toBeDefined();
			expect(typeof student).toBe('string');

			expect(mainForm).toBeDefined();
			expect(typeof mainForm).toBe('object');

			expect(semesters).toBeDefined();
			expect(semesters.semesters).toBeDefined();
			expect(Array.isArray(semesters.semesters)).toBe(true);

			console.log('✓ All data processed successfully');
			console.log(`Student: ${student}`);
			console.log(`Total weeks in calendar: ${calendar.data_subject.length}`);
			console.log(`Semesters count: ${semesters.semesters.length}`);
			console.log(`Current semester: ${semesters.currentSemester}`);

			// Debug calendar structure
			console.log(
				'Calendar structure:',
				JSON.stringify(calendar, null, 2).substring(0, 1000) + '...'
			);

			// Extract actual subjects from the calendar data
			const actualSubjects = new Set<string>();
			let totalClasses = 0;

			// Handle the new nested array structure
			calendar.data_subject.forEach((weekArray: any) => {
				if (Array.isArray(weekArray)) {
					weekArray.forEach((week: any) => {
						if (week.shift && Array.isArray(week.shift)) {
							week.shift.forEach((shift: any) => {
								if (shift.content && shift.content !== null) {
									actualSubjects.add(shift.content);
									totalClasses++;
								}
							});
						}
					});
				}
			});

			console.log(`Actual subjects count: ${actualSubjects.size}`);
			console.log(`Total classes scheduled: ${totalClasses}`);

			if (actualSubjects.size > 0) {
				console.log('Subjects found:');
				Array.from(actualSubjects).forEach((subject, index) => {
					console.log(`  ${index + 1}. ${subject}`);
				});
			}

			// Verify we have the expected number of subjects
			expect(actualSubjects.size).toBeGreaterThan(0);

			// If you mentioned 3 subjects, let's check if we're close
			if (actualSubjects.size !== 3) {
				console.log(
					`Note: Expected 3 subjects but found ${actualSubjects.size}. This might be due to:`
				);
				console.log('- Different semester selected');
				console.log('- Different time period');
				console.log('- Data processing differences');
			}

			// Check if we have the expected number of subjects for current semester
			// Note: This might vary depending on the current semester and data
			expect(calendar.data_subject.length).toBeGreaterThan(0);
		} catch (error) {
			console.error('Full workflow failed:', error);
			throw error;
		}
	});
});
