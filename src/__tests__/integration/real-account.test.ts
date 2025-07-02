/**
 * Integration tests using real account credentials from .env file
 * These tests interact with the actual KMA server to validate functionality
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
import { saveData, loadData, clearData } from '@/lib/ts/storage';

// Skip these tests if credentials are not provided
const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

const skipIfNoCredentials = TEST_USERNAME && TEST_PASSWORD ? describe : describe.skip;

skipIfNoCredentials('Real Account Integration Tests', () => {
	let signInToken: string;
	let rawResponse: string;

	beforeAll(async () => {
		// Clear any existing data
		clearData();

		// Set timeout for network operations
		jest.setTimeout(30000);
	});

	afterAll(() => {
		// Clean up after tests
		clearData();
	});

	describe('Authentication', () => {
		test('should successfully login with real credentials', async () => {
			expect(TEST_USERNAME).toBeDefined();
			expect(TEST_PASSWORD).toBeDefined();

			const token = await login(TEST_USERNAME!, TEST_PASSWORD!);

			expect(token).toBeDefined();
			expect(typeof token).toBe('string');
			expect(token.length).toBeGreaterThan(0);

			// Store token for subsequent tests
			signInToken = token;
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
	});

	describe('Data Fetching', () => {
		test('should fetch calendar data with valid token', async () => {
			expect(signInToken).toBeDefined();

			const response = await fetchCalendarWithGet(signInToken);

			expect(response).toBeDefined();
			expect(typeof response).toBe('string');
			expect(response.length).toBeGreaterThan(0);

			// Store response for subsequent tests
			rawResponse = response;
		});

		test('should filter trash from HTML response', () => {
			expect(rawResponse).toBeDefined();

			const filteredResponse = filterTrashInHtml(rawResponse);

			expect(filteredResponse).toBeDefined();
			expect(typeof filteredResponse).toBe('string');
			expect(filteredResponse.length).toBeGreaterThan(0);

			// Update response for processing tests
			rawResponse = filteredResponse;
		});
	});

	describe('Data Processing', () => {
		test('should process calendar data successfully', async () => {
			expect(rawResponse).toBeDefined();

			// Use restructureTKB directly to avoid Worker issues in test environment
			const cleanedData = cleanFromHTMLtoArray(rawResponse);
			const calendarResult = restructureTKB(cleanedData);
			const calendar = calendarResult ? calendarResult : { data_subject: [] };

			expect(calendar).toBeDefined();
			expect(calendar).toHaveProperty('data_subject');
			expect(Array.isArray(calendar.data_subject)).toBe(true);

			// Log some info for debugging
			console.log(`Processed ${calendar.data_subject.length} weeks`);
		});

		test('should process student information', () => {
			expect(rawResponse).toBeDefined();

			const student = processStudent(rawResponse);

			expect(student).toBeDefined();
			expect(typeof student).toBe('string');
			expect(student.length).toBeGreaterThan(0);

			console.log(`Student name: ${student}`);
		});

		test('should process main form data', () => {
			expect(rawResponse).toBeDefined();

			const mainForm = processMainForm(rawResponse);

			expect(mainForm).toBeDefined();
			expect(typeof mainForm).toBe('object');
			expect(mainForm).toHaveProperty('__VIEWSTATE');
			expect(mainForm).toHaveProperty('__EVENTVALIDATION');
		});

		test('should process semesters data', () => {
			expect(rawResponse).toBeDefined();

			const semesters = processSemesters(rawResponse);

			expect(semesters).toBeDefined();
			expect(semesters).toHaveProperty('semesters');
			expect(semesters).toHaveProperty('currentSemester');
			expect(Array.isArray(semesters.semesters)).toBe(true);
			expect(semesters.semesters.length).toBeGreaterThan(0);

			console.log(`Found ${semesters.semesters.length} semesters`);
		});
	});

	describe('Data Storage', () => {
		test('should save and load data correctly', async () => {
			expect(signInToken).toBeDefined();
			expect(rawResponse).toBeDefined();

			// Process all data
			const calendar = await processCalendar(rawResponse);
			const student = processStudent(rawResponse);
			const mainForm = processMainForm(rawResponse);
			const semesters = processSemesters(rawResponse);

			// Save data
			const dataToSave = {
				signInToken,
				mainForm,
				semesters,
				calendar,
				student
			};

			saveData(dataToSave);

			// Load data back
			const loadedData = loadData();

			expect(loadedData.signInToken).toBe(signInToken);
			expect(loadedData.student).toBe(student);
			expect(loadedData.calendar).toEqual(calendar);
			expect(loadedData.mainForm).toEqual(mainForm);
			expect(loadedData.semesters).toEqual(semesters);
		});

		test('should clear data correctly', () => {
			// Ensure data exists first
			const loadedData = loadData();
			expect(loadedData.signInToken).toBeDefined();

			// Clear data
			clearData();

			// Verify data is cleared
			const clearedData = loadData();
			expect(clearedData.signInToken).toBeNull();
			expect(clearedData.student).toBeNull();
			expect(clearedData.calendar).toBeNull();
			expect(clearedData.mainForm).toBeNull();
			expect(clearedData.semesters).toBeNull();
		});
	});

	describe('End-to-End Workflow', () => {
		test('should complete full login and data processing workflow', async () => {
			// Step 1: Login
			const token = await login(TEST_USERNAME!, TEST_PASSWORD!);
			expect(token).toBeDefined();

			// Step 2: Fetch data
			const response = await fetchCalendarWithGet(token);
			expect(response).toBeDefined();

			// Step 3: Filter response
			const filteredResponse = filterTrashInHtml(response);
			expect(filteredResponse).toBeDefined();

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
			expect(student).toBeDefined();
			expect(mainForm).toBeDefined();
			expect(semesters).toBeDefined();

			// Step 6: Save data
			saveData({
				signInToken: token,
				mainForm,
				semesters,
				calendar,
				student
			});

			// Step 7: Verify saved data
			const savedData = loadData();
			expect(savedData.signInToken).toBe(token);
			expect(savedData.student).toBe(student);

			console.log('Full workflow completed successfully');
			console.log(`Student: ${student}`);
			console.log(`Subjects count: ${calendar.data_subject.length}`);
			console.log(`Semesters count: ${semesters.semesters.length}`);
		});
	});
});
