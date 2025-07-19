import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '@/contexts/AppContext';
import { AuthState, CalendarData, UIState, StorageData } from '@/types';

// Mock data for testing
export const mockUser = {
	id: 'test-user-id',
	username: 'testuser',
	name: 'Test User',
	email: 'test@example.com'
};

export const mockAuthState: AuthState = {
	user: mockUser,
	isAuthenticated: true,
	isLoading: false,
	error: null
};

export const mockUIState: UIState = {
	theme: 'dark',
	sidebarOpen: false,
	currentView: 'calendar'
};

export const mockCalendarData: CalendarData = {
	data_subject: [
		{
			id: '1',
			name: 'Test Subject',
			code: 'TEST101',
			credits: 3,
			instructor: 'Test Instructor',
			room: 'A101',
			schedule: [
				{
					day: 2,
					shift: 1,
					weeks: [1, 2, 3, 4, 5]
				}
			]
		}
	],
	semester: {
		id: '20231',
		name: 'Học kỳ 1 năm 2023-2024',
		startDate: '2023-09-01',
		endDate: '2024-01-15'
	}
};

export const mockStorageData: StorageData = {
	signInToken: 'mock-signin-token',
	mainForm: {},
	semesters: {
		semesters: [
			{
				value: '20231',
				from: '2023-09-01',
				to: '2024-01-15',
				th: 'Học kỳ 1 năm 2023-2024'
			}
		],
		currentSemester: '20231'
	},
	calendar: mockCalendarData,
	student: 'Test Student'
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	initialState?: {
		auth?: Partial<AuthState>;
		ui?: Partial<UIState>;
		calendar?: CalendarData | null;
		student?: string | null;
	};
}

const AllTheProviders = ({
	children,
	initialState: _initialState = {}
}: {
	children: React.ReactNode;
	initialState?: CustomRenderOptions['initialState'];
}) => {
	// Mock the AppProvider with initial state
	return <AppProvider>{children}</AppProvider>;
};

export const renderWithProviders = (ui: ReactElement, options: CustomRenderOptions = {}) => {
	const { initialState, ...renderOptions } = options;

	return render(ui, {
		wrapper: ({ children }) => (
			<AllTheProviders initialState={initialState}>{children}</AllTheProviders>
		),
		...renderOptions
	});
};

// Mock functions
export const mockFetch = (response: any, ok = true) => {
	global.fetch = jest.fn().mockResolvedValue({
		ok,
		json: jest.fn().mockResolvedValue(response),
		text: jest
			.fn()
			.mockResolvedValue(typeof response === 'string' ? response : JSON.stringify(response)),
		headers: new Headers(),
		status: ok ? 200 : 400,
		statusText: ok ? 'OK' : 'Bad Request'
	});
};

export const mockLocalStorage = () => {
	const store: Record<string, string> = {};

	return {
		getItem: jest.fn((key: string) => store[key] || null),
		setItem: jest.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: jest.fn((key: string) => {
			delete store[key];
		}),
		clear: jest.fn(() => {
			Object.keys(store).forEach((key) => delete store[key]);
		}),
		get store() {
			return { ...store };
		}
	};
};

// Wait for async operations
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock router push function
export const mockRouterPush = jest.fn();

// Mock toast function
export const mockToast = jest.fn();

// Helper to create mock events
export const createMockEvent = (type: string, properties: any = {}) => {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.assign(event, properties);
	return event;
};

// Helper to create mock form data
export const createMockFormData = (data: Record<string, string>) => {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		formData.append(key, value);
	});
	return formData;
};

// Helper to simulate user input
export const simulateUserInput = async (element: HTMLElement, value: string) => {
	const { fireEvent } = await import('@testing-library/react');
	fireEvent.change(element, { target: { value } });
	fireEvent.blur(element);
};

// Helper to simulate form submission
export const simulateFormSubmit = async (form: HTMLFormElement) => {
	const { fireEvent } = await import('@testing-library/react');
	fireEvent.submit(form);
};

// Real account testing utilities
export interface TestCredentials {
	username: string;
	password: string;
}

export interface TestConfig {
	credentials: TestCredentials;
	alternativeCredentials?: TestCredentials;
	expectedSemester?: string;
	expectedSubjects?: number;
	timeout?: number;
}

/**
 * Load test credentials from environment variables
 */
export function getTestCredentials(): TestCredentials {
	const username = process.env['TEST_USERNAME'];
	const password = process.env['TEST_PASSWORD'];

	if (!username || !password) {
		throw new Error(
			'Test credentials not found. Please set TEST_USERNAME and TEST_PASSWORD in your .env file.\n' +
				'Copy .env.example to .env and fill in your KMA credentials.'
		);
	}

	return { username, password };
}

/**
 * Get alternative test credentials if available
 */
export function getAlternativeTestCredentials(): TestCredentials | undefined {
	const username = process.env['TEST_USERNAME_2'];
	const password = process.env['TEST_PASSWORD_2'];

	if (!username || !password) {
		return undefined;
	}

	return { username, password };
}

/**
 * Get complete test configuration
 */
export function getTestConfig(): TestConfig {
	const credentials = getTestCredentials();
	const alternativeCredentials = getAlternativeTestCredentials();

	return {
		credentials,
		alternativeCredentials,
		expectedSemester: process.env['TEST_SEMESTER'],
		expectedSubjects: process.env['TEST_EXPECTED_SUBJECTS']
			? parseInt(process.env['TEST_EXPECTED_SUBJECTS'])
			: undefined,
		timeout: process.env['TEST_TIMEOUT'] ? parseInt(process.env['TEST_TIMEOUT']) : 30000
	};
}

/**
 * Check if real account testing is enabled
 */
export function isRealAccountTestingEnabled(): boolean {
	return !!(process.env['TEST_USERNAME'] && process.env['TEST_PASSWORD']);
}

/**
 * Skip test if real account testing is not enabled
 */
export function skipIfNoRealAccount() {
	if (!isRealAccountTestingEnabled()) {
		console.warn('Skipping real account test - credentials not configured');
		return true;
	}
	return false;
}

/**
 * Validate test response data
 */
export function validateTestResponse(response: any) {
	if (!response) {
		throw new Error('Empty response received');
	}

	if (typeof response === 'string' && response.includes('error')) {
		throw new Error(`Error in response: ${response}`);
	}

	return true;
}

/**
 * Wait for async operation with timeout
 */
export function waitForOperation(
	operation: () => Promise<any>,
	timeout: number = 30000,
	interval: number = 1000
): Promise<any> {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();

		const check = async () => {
			try {
				const result = await operation();
				if (result) {
					resolve(result);
					return;
				}
			} catch {
				// Continue trying unless timeout
			}

			if (Date.now() - startTime > timeout) {
				reject(new Error(`Operation timed out after ${timeout}ms`));
				return;
			}

			setTimeout(check, interval);
		};

		check();
	});
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
