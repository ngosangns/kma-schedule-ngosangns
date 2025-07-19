/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/kma/subject/route';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/kma/subject', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('GET', () => {
		it('should fetch subject data with Bearer token', async () => {
			const mockHtml = '<html><body>Subject data</body></html>';
			const mockRequest = new NextRequest('http://localhost/api/kma/subject', {
				method: 'GET',
				headers: {
					Authorization: 'Bearer SignIn=test_token'
				}
			});

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				text: jest.fn().mockResolvedValue(mockHtml)
			});

			const response = await GET(mockRequest);
			const responseText = await response.text();

			expect(global.fetch).toHaveBeenCalledWith(
				'http://qldt.actvn.edu.vn/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx',
				expect.objectContaining({
					method: 'GET',
					headers: expect.objectContaining({
						Cookie: 'SignIn=test_token',
						'User-Agent': expect.any(String)
					})
				})
			);

			expect(response.status).toBe(200);
			expect(responseText).toBe(mockHtml);
		});

		it('should fetch subject data with Cookie header', async () => {
			const mockHtml = '<html><body>Subject data</body></html>';
			const mockRequest = new NextRequest('http://localhost/api/kma/subject', {
				method: 'GET',
				headers: {
					Cookie: 'SignIn=test_token'
				}
			});

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				text: jest.fn().mockResolvedValue(mockHtml)
			});

			const response = await GET(mockRequest);
			const responseText = await response.text();

			expect(global.fetch).toHaveBeenCalledWith(
				'http://qldt.actvn.edu.vn/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx',
				expect.objectContaining({
					method: 'GET',
					headers: expect.objectContaining({
						Cookie: 'SignIn=test_token'
					})
				})
			);

			expect(response.status).toBe(200);
			expect(responseText).toBe(mockHtml);
		});

		it('should return 401 when no auth token provided', async () => {
			const mockRequest = new NextRequest('http://localhost/api/kma/subject', {
				method: 'GET'
			});

			const response = await GET(mockRequest);
			const responseJson = await response.json();

			expect(response.status).toBe(401);
			expect(responseJson.error).toContain('Authentication token required');
		});

		it('should handle KMA server error', async () => {
			const mockRequest = new NextRequest('http://localhost/api/kma/subject', {
				method: 'GET',
				headers: {
					Authorization: 'Bearer SignIn=test_token'
				}
			});

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 500
			});

			const response = await GET(mockRequest);
			const responseJson = await response.json();

			expect(response.status).toBe(500);
			expect(responseJson.error).toContain('Failed to fetch subject data');
		});
	});

	describe('POST', () => {
		it('should post subject data with form body', async () => {
			const mockHtml = '<html><body>Subject data</body></html>';
			const mockFormData = 'semester=20241&student=test';
			const mockRequest = new NextRequest('http://localhost/api/kma/subject', {
				method: 'POST',
				body: mockFormData,
				headers: {
					Authorization: 'Bearer SignIn=test_token',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				text: jest.fn().mockResolvedValue(mockHtml)
			});

			const response = await POST(mockRequest);
			const responseText = await response.text();

			expect(global.fetch).toHaveBeenCalledWith(
				'http://qldt.actvn.edu.vn/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx',
				expect.objectContaining({
					method: 'POST',
					body: mockFormData,
					headers: expect.objectContaining({
						'Content-Type': 'application/x-www-form-urlencoded',
						Cookie: 'SignIn=test_token',
						Origin: 'http://qldt.actvn.edu.vn/',
						'User-Agent': expect.any(String)
					})
				})
			);

			expect(response.status).toBe(200);
			expect(responseText).toBe(mockHtml);
		});

		it('should return 401 when no auth token provided', async () => {
			const mockRequest = new NextRequest('http://localhost/api/kma/subject', {
				method: 'POST',
				body: 'test=data'
			});

			const response = await POST(mockRequest);
			const responseJson = await response.json();

			expect(response.status).toBe(401);
			expect(responseJson.error).toContain('Authentication token required');
		});

		it('should handle POST error', async () => {
			const mockRequest = new NextRequest('http://localhost/api/kma/subject', {
				method: 'POST',
				body: 'test=data',
				headers: {
					Authorization: 'Bearer SignIn=test_token'
				}
			});

			(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

			const response = await POST(mockRequest);
			const responseJson = await response.json();

			expect(response.status).toBe(500);
			expect(responseJson.error).toContain('Failed to post subject data');
		});
	});
});
