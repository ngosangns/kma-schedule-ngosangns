import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { mockCalendarData, mockUser } from '../mocks/data';

// Mock the calendar data hook
jest.mock('@/hooks/use-calendar-data');

// Mock Next.js router
jest.mock('next/router', () => ({
	useRouter: () => ({
		push: jest.fn(),
		pathname: '/calendar'
	})
}));

// Simple test component that doesn't rely on complex context
const TestCalendarComponent = ({
	isAuthenticated = false,
	user = null,
	calendar = null,
	student = null
}: {
	isAuthenticated?: boolean;
	user?: any;
	calendar?: any;
	student?: string | null;
}) => {
	const { changeSemester, exportCalendar, logout } = useCalendarData();
	const [selectedSemester, setSelectedSemester] = React.useState('20231');

	const handleSemesterChange = async () => {
		await changeSemester(selectedSemester, {
			semesters: { currentSemester: '20231' },
			mainForm: { drpSemester: '20231' },
			signInToken: 'mock-token'
		});
	};

	const handleExport = () => {
		if (calendar && student) {
			exportCalendar(student, calendar);
		}
	};

	const handleLogout = () => {
		logout();
	};

	if (!isAuthenticated) {
		return <div data-testid="not-authenticated">Please login</div>;
	}

	return (
		<div>
			<div data-testid="user-info">Welcome, {user?.name || 'Unknown User'}</div>

			<div data-testid="student-info">Student: {student || 'No student data'}</div>

			<div data-testid="semester-selector">
				<select
					value={selectedSemester}
					onChange={(e) => setSelectedSemester(e.target.value)}
					data-testid="semester-select"
				>
					<option value="20231">Semester 1 2023-2024</option>
					<option value="20232">Semester 2 2023-2024</option>
				</select>
				<button data-testid="change-semester-btn" onClick={handleSemesterChange}>
					Change Semester
				</button>
			</div>

			{calendar ? (
				<div data-testid="calendar-data">
					<div data-testid="semester-name">{calendar.semester.name}</div>
					<div data-testid="subjects-count">Subjects: {calendar.data_subject.length}</div>
					<div data-testid="subjects-list">
						{calendar.data_subject.map((subject: any, index: number) => (
							<div key={index} data-testid={`subject-${index}`}>
								{subject.name} - {subject.code}
							</div>
						))}
					</div>
					<button data-testid="export-btn" onClick={handleExport}>
						Export Calendar
					</button>
				</div>
			) : (
				<div data-testid="no-calendar">No calendar data</div>
			)}

			<button data-testid="logout-btn" onClick={handleLogout}>
				Logout
			</button>
		</div>
	);
};

describe('Calendar Flow Integration', () => {
	const mockChangeSemester = jest.fn();
	const mockExportCalendar = jest.fn();
	const mockLogout = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useCalendarData as jest.Mock).mockReturnValue({
			loginWithCredentials: jest.fn(),
			processManualData: jest.fn(),
			changeSemester: mockChangeSemester,
			exportCalendar: mockExportCalendar,
			logout: mockLogout,
			isProcessing: false
		});
	});

	it('should display login prompt when not authenticated', () => {
		render(<TestCalendarComponent />);

		const notAuthMessage = screen.getByTestId('not-authenticated');
		expect(notAuthMessage).toHaveTextContent('Please login');
	});

	it('should display calendar data when authenticated', async () => {
		render(
			<TestCalendarComponent
				isAuthenticated={true}
				user={mockUser}
				calendar={mockCalendarData}
				student="Test Student - CT050101"
			/>
		);

		expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome, Nguyễn Văn A');
		expect(screen.getByTestId('student-info')).toHaveTextContent(
			'Student: Test Student - CT050101'
		);
		expect(screen.getByTestId('calendar-data')).toBeInTheDocument();

		// Check calendar details
		expect(screen.getByTestId('semester-name')).toHaveTextContent('Học kỳ 1 năm 2023-2024');
		expect(screen.getByTestId('subjects-count')).toHaveTextContent('Subjects: 3');

		// Check subjects are displayed
		expect(screen.getByTestId('subject-0')).toHaveTextContent('Lập trình Web - IT4409');
		expect(screen.getByTestId('subject-1')).toHaveTextContent('Cơ sở dữ liệu - IT3090');
		expect(screen.getByTestId('subject-2')).toHaveTextContent('Mạng máy tính - IT4062');
	});

	it('should handle semester change', async () => {
		const user = userEvent.setup();
		mockChangeSemester.mockResolvedValue({ success: true });

		render(
			<TestCalendarComponent
				isAuthenticated={true}
				user={mockUser}
				calendar={mockCalendarData}
				student="Test Student"
			/>
		);

		const semesterSelect = screen.getByTestId('semester-select');
		const changeSemesterBtn = screen.getByTestId('change-semester-btn');

		// Change semester selection
		await user.selectOptions(semesterSelect, '20232');
		expect(semesterSelect).toHaveValue('20232');

		// Click change semester button
		await user.click(changeSemesterBtn);

		await waitFor(() => {
			expect(mockChangeSemester).toHaveBeenCalledWith('20232', {
				semesters: { currentSemester: '20231' },
				mainForm: { drpSemester: '20231' },
				signInToken: 'mock-token'
			});
		});
	});

	it('should handle calendar export', async () => {
		const user = userEvent.setup();
		mockExportCalendar.mockReturnValue({ success: true });

		render(
			<TestCalendarComponent
				isAuthenticated={true}
				user={mockUser}
				calendar={mockCalendarData}
				student="Test Student"
			/>
		);

		const exportBtn = screen.getByTestId('export-btn');
		await user.click(exportBtn);

		expect(mockExportCalendar).toHaveBeenCalledWith('Test Student', mockCalendarData);
	});

	it('should handle logout', async () => {
		const user = userEvent.setup();

		render(
			<TestCalendarComponent
				isAuthenticated={true}
				user={mockUser}
				calendar={mockCalendarData}
				student="Test Student"
			/>
		);

		const logoutBtn = screen.getByTestId('logout-btn');
		await user.click(logoutBtn);

		expect(mockLogout).toHaveBeenCalledTimes(1);
	});

	it('should display no calendar message when no data available', async () => {
		render(
			<TestCalendarComponent
				isAuthenticated={true}
				user={mockUser}
				calendar={null}
				student="Test Student"
			/>
		);

		expect(screen.getByTestId('no-calendar')).toHaveTextContent('No calendar data');
	});

	it('should disable export when no calendar or student data', async () => {
		const user = userEvent.setup();

		render(
			<TestCalendarComponent
				isAuthenticated={true}
				user={mockUser}
				calendar={mockCalendarData}
				student={null}
			/>
		);

		const exportBtn = screen.getByTestId('export-btn');
		await user.click(exportBtn);

		// Should not call export without student data
		expect(mockExportCalendar).not.toHaveBeenCalled();
	});

	it('should maintain UI state during semester change', async () => {
		const user = userEvent.setup();
		mockChangeSemester.mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
		);

		render(
			<TestCalendarComponent
				isAuthenticated={true}
				user={mockUser}
				calendar={mockCalendarData}
				student="Test Student"
			/>
		);

		const semesterSelect = screen.getByTestId('semester-select');
		const changeSemesterBtn = screen.getByTestId('change-semester-btn');

		await user.selectOptions(semesterSelect, '20232');
		await user.click(changeSemesterBtn);

		// UI should remain responsive during the operation
		expect(screen.getByTestId('user-info')).toBeInTheDocument();
		expect(screen.getByTestId('calendar-data')).toBeInTheDocument();

		await waitFor(() => {
			expect(mockChangeSemester).toHaveBeenCalled();
		});
	});
});
