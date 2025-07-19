/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/kma/login/route';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/kma/login', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('GET', () => {
		it('should fetch login page from KMA server', async () => {
			const mockHtml = '<html><body>Login page</body></html>';
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				text: jest.fn().mockResolvedValue(mockHtml)
			});

			const response = await GET();
			const responseText = await response.text();

			expect(global.fetch).toHaveBeenCalledWith(
				'http://qldt.actvn.edu.vn/CMCSoft.IU.Web.info/Login.aspx',
				expect.objectContaining({
					method: 'GET',
					headers: expect.objectContaining({
						'User-Agent': expect.any(String),
						Accept: expect.any(String)
					})
				})
			);

			expect(response.status).toBe(200);
			expect(responseText).toBe(mockHtml);
		});

		it('should handle KMA server error', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 500
			});

			const response = await GET();
			const responseJson = await response.json();

			expect(response.status).toBe(500);
			expect(responseJson.error).toContain('Failed to fetch login page');
		});

		it('should handle network error', async () => {
			(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

			const response = await GET();
			const responseJson = await response.json();

			expect(response.status).toBe(500);
			expect(responseJson.error).toContain('Failed to fetch login page');
		});
	});

	describe('POST', () => {
		it('should forward login request and extract SignIn token', async () => {
			const mockFormData = 'username=test&password=test';
			const mockRequest = new NextRequest('http://localhost/api/kma/login', {
				method: 'POST',
				body: mockFormData
			});

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				headers: {
					get: jest.fn().mockReturnValue('SignIn=test_token; Path=/')
				},
				text: jest.fn().mockResolvedValue('')
			});

			const response = await POST(mockRequest);
			const responseText = await response.text();

			expect(global.fetch).toHaveBeenCalledWith(
				'http://qldt.actvn.edu.vn/CMCSoft.IU.Web.info/Login.aspx',
				expect.objectContaining({
					method: 'POST',
					body: mockFormData,
					headers: expect.objectContaining({
						'Content-Type': 'application/x-www-form-urlencoded',
						Origin: 'http://qldt.actvn.edu.vn'
					})
				})
			);

			expect(response.status).toBe(200);
			expect(responseText).toBe('SignIn=test_token;');
		});

		it('should return response text when no cookie found', async () => {
			const mockFormData = 'username=test&password=test';
			const mockRequest = new NextRequest('http://localhost/api/kma/login', {
				method: 'POST',
				body: mockFormData
			});

			const mockResponseText = '<html>Login failed</html>';
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				status: 200,
				headers: {
					get: jest.fn().mockReturnValue(null)
				},
				text: jest.fn().mockResolvedValue(mockResponseText)
			});

			const response = await POST(mockRequest);
			const responseText = await response.text();

			expect(response.status).toBe(200);
			expect(responseText).toBe(mockResponseText);
		});

		it('should handle authentication error', async () => {
			const mockFormData = 'username=test&password=test';
			const mockRequest = new NextRequest('http://localhost/api/kma/login', {
				method: 'POST',
				body: mockFormData
			});

			(global.fetch as jest.Mock).mockRejectedValue(new Error('Auth error'));

			const response = await POST(mockRequest);
			const responseJson = await response.json();

			expect(response.status).toBe(500);
			expect(responseJson.error).toContain('Failed to authenticate');
		});
	});
});
