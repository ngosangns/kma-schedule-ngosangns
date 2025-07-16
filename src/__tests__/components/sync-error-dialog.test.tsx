/**
 * Tests for sync error dialog functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarPage from '@/app/(main)/calendar/page';
import { useAuth, useCalendar } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/use-notifications';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { loadData } from '@/lib/ts/storage';

// Mock dependencies
jest.mock('@/contexts/AppContext');
jest.mock('@/hooks/use-notifications');
jest.mock('@/hooks/use-calendar-data');
jest.mock('@/lib/ts/storage');

const mockPush = jest.fn();
const mockShowError = jest.fn();
const mockShowSuccess = jest.fn();
const mockLogout = jest.fn();
const mockAuthLogout = jest.fn();

// Mock data
const mockCalendarData = {
	data_subject: [
		{
			name: 'Test Subject',
			address: 'Test Room',
			instructor: 'Test Instructor',
			shiftNumber: 1,
			length: 2,
			dayOfWeek: 1
		}
	],
	weeks: [
		[
			{
				time: '2025-01-13',
				shift: [
					{ name: 'Test Subject', address: 'Test Room', length: 2 },
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null
				]
			}
		]
	]
};

const mockData = {
	signInToken: 'test-token',
	calendar: mockCalendarData,
	student: 'Test Student',
	semesters: { semesters: [], currentSemester: '20241' },
	mainForm: {}
};

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		replace: jest.fn(),
		back: jest.fn()
	})
}));

describe('Sync Error Dialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(useAuth as jest.Mock).mockReturnValue({
			user: { name: 'Test User' },
			isAuthenticated: true,
			logout: mockAuthLogout
		});

		(useCalendar as jest.Mock).mockReturnValue({
			calendar: mockCalendarData,
			student: 'Test Student',
			setCalendar: jest.fn(),
			setStudent: jest.fn()
		});

		(useNotifications as jest.Mock).mockReturnValue({
			showError: mockShowError,
			showSuccess: mockShowSuccess,
			showWarning: jest.fn(),
			showInfo: jest.fn()
		});

		(loadData as jest.Mock).mockReturnValue(mockData);

		// Mock useCalendarData with sync error
		(useCalendarData as jest.Mock).mockReturnValue({
			isProcessing: false,
			loginWithCredentials: jest.fn(),
			processManualData: jest.fn(),
			changeSemester: jest.fn(),
			exportCalendar: jest.fn(),
			logout: mockLogout
		});
	});

	test('should show sync error dialog when sync fails', async () => {
		const user = userEvent.setup();

		render(<CalendarPage />);

		// Find and click sync button (get first one since there are mobile and desktop versions)
		const syncButtons = screen.getAllByRole('button', { name: /đồng bộ/i });
		expect(syncButtons.length).toBeGreaterThan(0);
		const syncButton = syncButtons[0] as HTMLElement;

		// Mock the sync function to fail
		const originalFetch = global.fetch;
		global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

		await user.click(syncButton);

		// Wait for error dialog to appear
		await waitFor(() => {
			expect(screen.getByText('Lỗi đồng bộ dữ liệu')).toBeInTheDocument();
		});

		// Check dialog content
		expect(
			screen.getByText(
				'Có lỗi xảy ra khi đồng bộ dữ liệu. Bạn có muốn thử lại hoặc đăng xuất không?'
			)
		).toBeInTheDocument();
		expect(screen.getByText('Network error')).toBeInTheDocument();

		// Check buttons
		expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /đăng xuất/i })).toBeInTheDocument();

		// Restore fetch
		global.fetch = originalFetch;
	});

	test('should retry sync when "Thử lại" button is clicked', async () => {
		const user = userEvent.setup();

		render(<CalendarPage />);

		// Simulate sync error dialog being open
		const syncButtons = screen.getAllByRole('button', { name: /đồng bộ/i });
		expect(syncButtons.length).toBeGreaterThan(0);
		const syncButton = syncButtons[0] as HTMLElement;

		// Mock fetch to fail first, then succeed
		let callCount = 0;
		global.fetch = jest.fn().mockImplementation(() => {
			callCount++;
			if (callCount === 1) {
				return Promise.reject(new Error('Network error'));
			}
			return Promise.resolve({
				ok: true,
				text: () => Promise.resolve('<html>Success</html>')
			});
		});

		// First click to trigger error
		await user.click(syncButton);

		await waitFor(() => {
			expect(screen.getByText('Lỗi đồng bộ dữ liệu')).toBeInTheDocument();
		});

		// Click retry button
		const retryButton = screen.getByRole('button', { name: /thử lại/i });
		await user.click(retryButton);

		// Dialog should close and sync should be retried
		await waitFor(() => {
			expect(screen.queryByText('Lỗi đồng bộ dữ liệu')).not.toBeInTheDocument();
		});

		expect(global.fetch).toHaveBeenCalledTimes(2);
	});

	test('should logout when "Đăng xuất" button is clicked', async () => {
		const user = userEvent.setup();

		render(<CalendarPage />);

		// Simulate sync error
		const syncButtons = screen.getAllByRole('button', { name: /đồng bộ/i });
		expect(syncButtons.length).toBeGreaterThan(0);
		const syncButton = syncButtons[0] as HTMLElement;

		global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

		await user.click(syncButton);

		await waitFor(() => {
			expect(screen.getByText('Lỗi đồng bộ dữ liệu')).toBeInTheDocument();
		});

		// Click logout button
		const logoutButton = screen.getByRole('button', { name: /đăng xuất/i });
		await user.click(logoutButton);

		// Should call logout functions and redirect
		expect(mockLogout).toHaveBeenCalled();
		expect(mockAuthLogout).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	test('should close dialog when clicking outside or close button', async () => {
		const user = userEvent.setup();

		render(<CalendarPage />);

		// Trigger sync error
		const syncButtons = screen.getAllByRole('button', { name: /đồng bộ/i });
		expect(syncButtons.length).toBeGreaterThan(0);
		const syncButton = syncButtons[0] as HTMLElement;
		global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

		await user.click(syncButton);

		await waitFor(() => {
			expect(screen.getByText('Lỗi đồng bộ dữ liệu')).toBeInTheDocument();
		});

		// Find and click close button (X)
		const closeButton = screen.getByRole('button', { name: /close/i });
		await user.click(closeButton);

		// Dialog should close
		await waitFor(() => {
			expect(screen.queryByText('Lỗi đồng bộ dữ liệu')).not.toBeInTheDocument();
		});
	});
});
