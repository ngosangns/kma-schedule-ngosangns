import { login, logout } from '@/lib/ts/user';
import { clearData } from '@/lib/ts/storage';
import { mockHTMLResponses } from '../../mocks/data';

// Mock dependencies
jest.mock('@/lib/ts/storage', () => ({
	clearData: jest.fn()
}));

jest.mock('@/lib/ts/calendar', () => ({
	getFieldFromResult: jest.fn()
}));

jest.mock('md5', () => jest.fn());

// Mock fetch
global.fetch = jest.fn();

describe('user utilities', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockClear();
	});

	describe('login', () => {
		const mockGetFieldFromResult = require('@/lib/ts/calendar').getFieldFromResult;
		const mockMd5 = require('md5');

		beforeEach(() => {
			mockGetFieldFromResult.mockImplementation((html: string, field: string) => {
				if (field === '__VIEWSTATE') return 'mock-viewstate';
				if (field === '__EVENTVALIDATION') return 'mock-eventvalidation';
				return '';
			});
			mockMd5.mockReturnValue('hashed-password');
		});

		it('should login successfully with valid credentials', async () => {
			// Mock first GET request (get login form)
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockHTMLResponses.loginPage)
				})
				// Mock second POST request (submit login)
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue('SignIn=test-token; Path=/')
					},
					text: jest.fn().mockResolvedValue('')
				});

			const result = await login('student001', 'password123');

			expect(fetch).toHaveBeenCalledTimes(2);

			// Check first call (GET)
			expect(fetch).toHaveBeenNthCalledWith(1, '/api/kma/login', { method: 'GET' });

			// Check second call (POST)
			expect(fetch).toHaveBeenNthCalledWith(2, '/api/kma/login', {
				method: 'POST',
				body: expect.stringContaining('txtUserName=STUDENT001'),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			expect(mockMd5).toHaveBeenCalledWith('password123');
			expect(result).toBe('SignIn=test-token; Path=/');
		});

		it('should handle login with cookie in Set-Cookie header', async () => {
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockHTMLResponses.loginPage)
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockImplementation((header: string) => {
							if (header === 'set-cookie') return 'SignIn=test-token; Path=/';
							return null;
						})
					},
					text: jest.fn().mockResolvedValue('')
				});

			const result = await login('student001', 'password123');
			expect(result).toBe('SignIn=test-token; Path=/');
		});

		it('should handle login with response text as cookie', async () => {
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockHTMLResponses.loginPage)
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue(null)
					},
					text: jest.fn().mockResolvedValue('SignIn=direct-token')
				});

			const result = await login('student001', 'password123');
			expect(result).toBe('SignIn=direct-token');
		});

		it('should return response text when no cookie found', async () => {
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockHTMLResponses.loginPage)
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue(null)
					},
					text: jest.fn().mockResolvedValue('Login failed')
				});

			const result = await login('student001', 'password123');
			expect(result).toBe('Login failed');
		});

		it('should convert username to uppercase', async () => {
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockHTMLResponses.loginPage)
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue('SignIn=test-token')
					},
					text: jest.fn().mockResolvedValue('')
				});

			await login('student001', 'password123');

			const postCall = (fetch as jest.Mock).mock.calls[1];
			const postBody = postCall[1].body;
			expect(postBody).toContain('txtUserName=STUDENT001');
		});

		it('should include form fields in POST request', async () => {
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(mockHTMLResponses.loginPage)
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue('SignIn=test-token')
					},
					text: jest.fn().mockResolvedValue('')
				});

			await login('student001', 'password123');

			const postCall = (fetch as jest.Mock).mock.calls[1];
			const postBody = postCall[1].body;

			expect(postBody).toContain('__VIEWSTATE=mock-viewstate');
			expect(postBody).toContain('__EVENTVALIDATION=mock-eventvalidation');
			expect(postBody).toContain('txtUserName=STUDENT001');
			expect(postBody).toContain('txtPassword=hashed-password');
			expect(postBody).toContain('btnSubmit=%C4%90%C4%83ng%20nh%E1%BA%ADp'); // URL encoded "Đăng nhập"
		});

		it('should handle network errors', async () => {
			(fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

			await expect(login('student001', 'password123')).rejects.toThrow('Network error');
		});

		it('should handle invalid HTML response', async () => {
			mockGetFieldFromResult.mockReturnValue('');
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue('invalid html')
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue('SignIn=test-token')
					},
					text: jest.fn().mockResolvedValue('')
				});

			const result = await login('student001', 'password123');
			expect(result).toBe('SignIn=test-token');
		});
	});

	describe('logout', () => {
		it('should call clearData', () => {
			logout();
			expect(clearData).toHaveBeenCalledTimes(1);
		});

		it('should not throw errors', () => {
			expect(() => logout()).not.toThrow();
		});
	});

	describe('integration tests', () => {
		it('should handle complete login flow', async () => {
			const mockGetFieldFromResult = require('@/lib/ts/calendar').getFieldFromResult;
			const mockMd5 = require('md5');

			mockGetFieldFromResult.mockImplementation((html: string, field: string) => {
				if (field === '__VIEWSTATE') return 'viewstate-123';
				if (field === '__EVENTVALIDATION') return 'validation-456';
				return '';
			});
			mockMd5.mockReturnValue('md5-hash-789');
			(fetch as jest.Mock)
				.mockResolvedValueOnce({
					text: jest.fn().mockResolvedValue(`
            <html>
              <input name="__VIEWSTATE" value="viewstate-123" />
              <input name="__EVENTVALIDATION" value="validation-456" />
            </html>
          `)
				})
				.mockResolvedValueOnce({
					headers: {
						get: jest.fn().mockReturnValue('SignIn=success-token; Path=/; HttpOnly')
					},
					text: jest.fn().mockResolvedValue('')
				});

			const result = await login('testuser', 'testpass');

			expect(mockGetFieldFromResult).toHaveBeenCalledTimes(2);
			expect(mockMd5).toHaveBeenCalledWith('testpass');
			expect(result).toBe('SignIn=success-token; Path=/; HttpOnly');

			// Verify POST request body
			const postCall = (fetch as jest.Mock).mock.calls[1];
			const postBody = postCall[1].body;
			expect(postBody).toContain('txtUserName=TESTUSER');
			expect(postBody).toContain('txtPassword=md5-hash-789');
		});
	});
});
