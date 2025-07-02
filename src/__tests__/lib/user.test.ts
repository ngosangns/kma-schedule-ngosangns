import { login, logout } from '@/lib/ts/user';
import { clearData } from '@/lib/ts/storage';

// Mock storage functions
jest.mock('@/lib/ts/storage', () => ({
	clearData: jest.fn()
}));

// Mock md5 for consistent testing
jest.mock('md5', () => jest.fn((input: string) => `hashed_${input}`));

describe('User Authentication Functions', () => {
	let originalFetch: any;

	beforeEach(() => {
		jest.clearAllMocks();
		// Store original fetch and create mock for unit tests
		originalFetch = global.fetch;
		global.fetch = jest.fn();
	});

	afterEach(() => {
		// Restore original fetch
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	describe('login function', () => {
		it('should handle successful login with mock data', async () => {
			const mockLoginPageResponse = `
        <input id="__VIEWSTATE" value="mock_viewstate" />
        <input id="__EVENTVALIDATION" value="mock_eventvalidation" />
      `;

			const mockSignInToken = 'SignIn=mock_signin_token';

			// Mock GET request for login page
			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockLoginPageResponse)
				})
				// Mock POST request for authentication
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue(mockSignInToken)
					},
					text: jest.fn().mockResolvedValue(mockSignInToken)
				});

			const result = await login('testuser', 'testpass');

			expect(result).toBe(mockSignInToken);
			expect(global.fetch).toHaveBeenCalledTimes(2);

			// Verify GET request
			expect(global.fetch).toHaveBeenNthCalledWith(
				1,
				'https://actvn-schedule.cors-ngosangns.workers.dev/login',
				{ method: 'GET' }
			);

			// Verify POST request
			expect(global.fetch).toHaveBeenNthCalledWith(
				2,
				'https://actvn-schedule.cors-ngosangns.workers.dev/login',
				expect.objectContaining({
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: expect.stringContaining('txtUserName=TESTUSER')
				})
			);
		});

		it('should handle login page without required fields', async () => {
			const mockLoginPageResponse = '<html><body>Invalid page</body></html>';

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockLoginPageResponse)
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue(null)
					},
					text: jest.fn().mockResolvedValue('SignIn=token')
				});

			const result = await login('testuser', 'testpass');

			// Should still attempt login even with missing fields
			expect(global.fetch).toHaveBeenCalledTimes(2);
			expect(result).toBe('SignIn=token');
		});

		it('should convert username to uppercase', async () => {
			const mockLoginPageResponse = `
        <input id="__VIEWSTATE" value="mock_viewstate" />
        <input id="__EVENTVALIDATION" value="mock_eventvalidation" />
      `;

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockLoginPageResponse)
				})
				.mockResolvedValueOnce({
					headers: { get: jest.fn().mockReturnValue(null) },
					text: jest.fn().mockResolvedValue('SignIn=token')
				});

			await login('lowercase_user', 'password');

			const postCall = (global.fetch as jest.Mock).mock.calls[1];
			expect(postCall[1].body).toContain('txtUserName=LOWERCASE_USER');
		});

		it('should hash password using md5', async () => {
			const mockLoginPageResponse = `
        <input id="__VIEWSTATE" value="mock_viewstate" />
        <input id="__EVENTVALIDATION" value="mock_eventvalidation" />
      `;

			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockLoginPageResponse)
				})
				.mockResolvedValueOnce({
					headers: { get: jest.fn().mockReturnValue(null) },
					text: jest.fn().mockResolvedValue('SignIn=token')
				});

			await login('testuser', 'mypassword');

			const postCall = (global.fetch as jest.Mock).mock.calls[1];
			expect(postCall[1].body).toContain('txtPassword=hashed_mypassword');
		});
	});

	describe('logout function', () => {
		it('should call clearData when logging out', () => {
			logout();
			expect(clearData).toHaveBeenCalledTimes(1);
		});
	});
});
