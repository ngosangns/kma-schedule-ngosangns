import React from 'react';
import { render, screen } from '@testing-library/react';
import CalendarPage from '@/app/(main)/calendar/page';
import { useAuth, useCalendar } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/use-notifications';
import { loadData } from '@/lib/ts/storage';

// Mock all dependencies
jest.mock('@/contexts/AppContext');
jest.mock('@/hooks/use-notifications');
jest.mock('@/lib/ts/storage');
jest.mock('@/lib/ts/calendar');

// Mock Next.js router
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn()
	})
}));

describe('Empty Calendar Display', () => {
	const mockUser = { name: 'Test User' };
	const mockShowSuccess = jest.fn();
	const mockShowError = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock useAuth
		(useAuth as jest.Mock).mockReturnValue({
			user: mockUser,
			login: jest.fn(),
			logout: jest.fn(),
			setLoading: jest.fn(),
			setError: jest.fn()
		});

		// Mock useCalendar
		(useCalendar as jest.Mock).mockReturnValue({
			calendar: null,
			student: null,
			setCalendar: jest.fn(),
			setStudent: jest.fn()
		});

		// Mock useNotifications
		(useNotifications as jest.Mock).mockReturnValue({
			showSuccess: mockShowSuccess,
			showError: mockShowError
		});
	});

	it('should show empty state when no calendar data exists', () => {
		// Mock loadData to return empty calendar
		(loadData as jest.Mock).mockReturnValue({
			calendar: {
				data_subject: [],
				weeks: []
			},
			student: null,
			semesters: null,
			mainForm: null,
			signInToken: null
		});

		render(<CalendarPage />);

		// Should show empty state message
		expect(screen.getByText('Không có dữ liệu lịch học')).toBeInTheDocument();
		expect(
			screen.getByText('Học kỳ này chưa có lịch học hoặc chưa được cập nhật.')
		).toBeInTheDocument();

		// Should not show week navigation
		expect(screen.queryByText('Tuần trước')).not.toBeInTheDocument();
		expect(screen.queryByText('Tuần sau')).not.toBeInTheDocument();
	});

	it('should show empty state when calendar has empty weeks', () => {
		// Mock loadData to return calendar with empty weeks
		(loadData as jest.Mock).mockReturnValue({
			calendar: {
				data_subject: ['some data'], // Has subjects but empty weeks
				weeks: [
					[
						{ time: Date.now(), shift: Array(16).fill(null) }, // No subjects in shifts
						{ time: Date.now() + 86400000, shift: Array(16).fill(null) }
					]
				]
			},
			student: 'Test Student',
			semesters: { currentSemester: '20231' },
			mainForm: { drpSemester: '20231' },
			signInToken: 'token'
		});

		render(<CalendarPage />);

		// Should show empty state message
		expect(screen.getByText('Không có dữ liệu lịch học')).toBeInTheDocument();
		expect(
			screen.getByText('Học kỳ này không có lịch học trong tuần hiện tại.')
		).toBeInTheDocument();

		// Should not show week navigation
		expect(screen.queryByText('Tuần trước')).not.toBeInTheDocument();
		expect(screen.queryByText('Tuần sau')).not.toBeInTheDocument();
	});

	it('should show calendar when there is real schedule data', () => {
		// Mock loadData to return calendar with real data
		(loadData as jest.Mock).mockReturnValue({
			calendar: {
				data_subject: ['some data'],
				weeks: [
					[
						{
							time: Date.now(),
							shift: [
								{ name: 'Toán cao cấp', address: 'TC-101', instructor: 'GV A' },
								...Array(15).fill(null)
							]
						},
						{ time: Date.now() + 86400000, shift: Array(16).fill(null) }
					]
				]
			},
			student: 'Test Student',
			semesters: { currentSemester: '20231' },
			mainForm: { drpSemester: '20231' },
			signInToken: 'token'
		});

		render(<CalendarPage />);

		// Should not show empty state
		expect(screen.queryByText('Không có dữ liệu lịch học')).not.toBeInTheDocument();

		// Should show week navigation
		expect(screen.getByText('Tuần trước')).toBeInTheDocument();
		expect(screen.getByText('Tuần sau')).toBeInTheDocument();

		// Should show the subject (multiple instances for desktop/mobile views)
		expect(screen.getAllByText('Toán cao cấp')).toHaveLength(2);
	});
});
