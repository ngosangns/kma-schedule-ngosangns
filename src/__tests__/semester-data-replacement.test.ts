import { renderHook, act } from '@testing-library/react';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useAuth, useCalendar } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/use-notifications';
import { saveData } from '@/lib/ts/storage';
import {
	fetchCalendarWithPost,
	processCalendar,
	processMainForm,
	processSemesters,
	processStudent,
	filterTrashInHtml
} from '@/lib/ts/calendar';

// Mock all dependencies
jest.mock('@/contexts/AppContext');
jest.mock('@/hooks/use-notifications');
jest.mock('@/lib/ts/storage');
jest.mock('@/lib/ts/calendar');

describe('Semester Data Replacement', () => {
	const mockSetCalendar = jest.fn();
	const mockSetStudent = jest.fn();
	const mockShowSuccess = jest.fn();
	const mockShowError = jest.fn();

	const mockCurrentData = {
		semesters: { currentSemester: '20231' },
		mainForm: { drpSemester: '20231' },
		signInToken: 'mock-token'
	};

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock useAuth
		(useAuth as jest.Mock).mockReturnValue({
			login: jest.fn(),
			logout: jest.fn(),
			setLoading: jest.fn(),
			setError: jest.fn()
		});

		// Mock useCalendar
		(useCalendar as jest.Mock).mockReturnValue({
			setCalendar: mockSetCalendar,
			setStudent: mockSetStudent
		});

		// Mock useNotifications
		(useNotifications as jest.Mock).mockReturnValue({
			showSuccess: mockShowSuccess,
			showError: mockShowError
		});

		// Mock calendar functions
		(fetchCalendarWithPost as jest.Mock).mockResolvedValue('<html>new semester data</html>');
		(filterTrashInHtml as jest.Mock).mockReturnValue('<html>filtered response</html>');
		(processCalendar as jest.Mock).mockResolvedValue({
			data_subject: [
				{ name: 'New Subject 1', schedule: 'Mon 1-2' },
				{ name: 'New Subject 2', schedule: 'Tue 3-4' }
			]
		});
		(processStudent as jest.Mock).mockReturnValue('New Student Name');
		(processMainForm as jest.Mock).mockReturnValue({ drpSemester: '20232' });
		(processSemesters as jest.Mock).mockReturnValue({
			semesters: [{ value: '20232', name: 'Semester 2' }],
			currentSemester: '20232'
		});
		(saveData as jest.Mock).mockImplementation(() => {});
	});

	it('should completely replace old semester data with new data', async () => {
		const { result } = renderHook(() => useCalendarData());

		let changeResult: any;

		await act(async () => {
			changeResult = await result.current.changeSemester('20232', mockCurrentData);
		});

		// Verify the change was successful
		expect(changeResult.success).toBe(true);
		expect(changeResult.data).toBeDefined();

		// Verify that saveData was called with complete new data (including signInToken)
		expect(saveData).toHaveBeenCalledWith({
			mainForm: { drpSemester: '20232' },
			semesters: {
				semesters: [{ value: '20232', name: 'Semester 2' }],
				currentSemester: '20232'
			},
			calendar: {
				data_subject: [
					{ name: 'New Subject 1', schedule: 'Mon 1-2' },
					{ name: 'New Subject 2', schedule: 'Tue 3-4' }
				]
			},
			student: 'New Student Name',
			signInToken: 'mock-token' // Should preserve signInToken
		});

		// Verify context was updated with new data
		expect(mockSetCalendar).toHaveBeenCalledWith({
			data_subject: [
				{ name: 'New Subject 1', schedule: 'Mon 1-2' },
				{ name: 'New Subject 2', schedule: 'Tue 3-4' }
			]
		});
		expect(mockSetStudent).toHaveBeenCalledWith('New Student Name');

		expect(mockShowSuccess).toHaveBeenCalledWith('Đã cập nhật học kỳ thành công!');
	});

	it('should return complete new data structure', async () => {
		const { result } = renderHook(() => useCalendarData());

		let changeResult: any;

		await act(async () => {
			changeResult = await result.current.changeSemester('20232', mockCurrentData);
		});

		// Verify the returned data structure is complete and new
		expect(changeResult.data).toEqual({
			mainForm: { drpSemester: '20232' },
			semesters: {
				semesters: [{ value: '20232', name: 'Semester 2' }],
				currentSemester: '20232'
			},
			calendar: {
				data_subject: [
					{ name: 'New Subject 1', schedule: 'Mon 1-2' },
					{ name: 'New Subject 2', schedule: 'Tue 3-4' }
				]
			},
			student: 'New Student Name',
			signInToken: 'mock-token'
		});
	});
});
