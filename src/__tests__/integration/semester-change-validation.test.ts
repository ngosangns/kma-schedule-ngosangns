/**
 * Integration tests for semester change validation and error handling
 * Tests the improved logic that validates data before updating state
 */

import { renderHook, act } from '@testing-library/react';
import { useCalendarData } from '@/hooks/use-calendar-data';
import {
	fetchCalendarWithPost,
	processCalendar,
	processStudent,
	processMainForm,
	processSemesters,
	filterTrashInHtml
} from '@/lib/ts/calendar';
import { saveData } from '@/lib/ts/storage';

// Mock dependencies
jest.mock('@/lib/ts/calendar');
jest.mock('@/lib/ts/storage');
jest.mock('@/hooks/use-notifications');

const mockFetchCalendarWithPost = fetchCalendarWithPost as jest.MockedFunction<
	typeof fetchCalendarWithPost
>;
const mockProcessCalendar = processCalendar as jest.MockedFunction<typeof processCalendar>;
const mockProcessStudent = processStudent as jest.MockedFunction<typeof processStudent>;
const mockProcessMainForm = processMainForm as jest.MockedFunction<typeof processMainForm>;
const mockProcessSemesters = processSemesters as jest.MockedFunction<typeof processSemesters>;
const mockFilterTrashInHtml = filterTrashInHtml as jest.MockedFunction<typeof filterTrashInHtml>;
const mockSaveData = saveData as jest.MockedFunction<typeof saveData>;

// Mock notifications
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

jest.mock('@/hooks/use-notifications', () => ({
	useNotifications: () => ({
		showSuccess: mockShowSuccess,
		showError: mockShowError
	})
}));

// Mock AppContext
const mockSetCalendar = jest.fn();
const mockSetStudent = jest.fn();
const mockAuthLogin = jest.fn();
const mockAuthLogout = jest.fn();
const mockSetLoading = jest.fn();
const mockSetError = jest.fn();

jest.mock('@/contexts/AppContext', () => ({
	useCalendar: () => ({
		setCalendar: mockSetCalendar,
		setStudent: mockSetStudent
	}),
	useAuth: () => ({
		login: mockAuthLogin,
		logout: mockAuthLogout,
		setLoading: mockSetLoading,
		setError: mockSetError
	})
}));

describe('Semester Change Validation', () => {
	const mockCurrentData = {
		semesters: { currentSemester: '20231' },
		mainForm: { drpSemester: '20231' },
		signInToken: 'mock-token'
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockFilterTrashInHtml.mockImplementation((html) => html);
	});

	describe('Successful semester change', () => {
		test('should validate data before updating state', async () => {
			// Mock successful responses
			mockFetchCalendarWithPost.mockResolvedValue('<html>valid response</html>');
			mockProcessCalendar.mockResolvedValue({ data_subject: [] });
			mockProcessStudent.mockReturnValue({ name: 'Test Student' });
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			mockProcessSemesters.mockReturnValue({ currentSemester: '20232', semesters: [] });

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			// Should validate data before updating
			expect(mockProcessCalendar).toHaveBeenCalled();
			expect(mockProcessSemesters).toHaveBeenCalled();

			// Should only update state after validation
			expect(mockSetCalendar).toHaveBeenCalledWith({ data_subject: [] });
			expect(mockSetStudent).toHaveBeenCalledWith({ name: 'Test Student' });
			expect(mockSaveData).toHaveBeenCalled();

			expect(changeResult.success).toBe(true);
			expect(mockShowSuccess).toHaveBeenCalledWith('Đã cập nhật học kỳ thành công!');
		});
	});

	describe('Data validation failures', () => {
		test('should fail when calendar data is null', async () => {
			mockFetchCalendarWithPost.mockResolvedValue('<html>response</html>');
			mockProcessCalendar.mockResolvedValue(null); // Invalid calendar
			mockProcessStudent.mockReturnValue({ name: 'Test Student' });
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			mockProcessSemesters.mockReturnValue({ currentSemester: '20232', semesters: [] });

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(false);
			expect(changeResult.error).toBe('Dữ liệu học kỳ không hợp lệ');
			expect(mockShowError).toHaveBeenCalledWith(
				'Cập nhật học kỳ thất bại',
				'Dữ liệu học kỳ không hợp lệ'
			);

			// Should not update state when validation fails
			expect(mockSetCalendar).not.toHaveBeenCalled();
			expect(mockSetStudent).not.toHaveBeenCalled();
			expect(mockSaveData).not.toHaveBeenCalled();
		});

		test('should fail when semesters data is null', async () => {
			mockFetchCalendarWithPost.mockResolvedValue('<html>response</html>');
			mockProcessCalendar.mockResolvedValue({ data_subject: [] });
			mockProcessStudent.mockReturnValue({ name: 'Test Student' });
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			mockProcessSemesters.mockReturnValue(null); // Invalid semesters

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(false);
			expect(changeResult.error).toBe('Dữ liệu học kỳ không hợp lệ');
			expect(mockSetCalendar).not.toHaveBeenCalled();
		});

		test('should fail when semester did not change as expected', async () => {
			mockFetchCalendarWithPost.mockResolvedValue('<html>response</html>');
			mockProcessCalendar.mockResolvedValue({ data_subject: [] });
			mockProcessStudent.mockReturnValue({ name: 'Test Student' });
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			// Server returned different semester than requested
			mockProcessSemesters.mockReturnValue({ currentSemester: '20231', semesters: [] });

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(false);
			expect(changeResult.error).toBe('Không thể chuyển đổi sang học kỳ được chọn');
			expect(mockSetCalendar).not.toHaveBeenCalled();
		});

		test('should fail when calendar data has wrong structure', async () => {
			mockFetchCalendarWithPost.mockResolvedValue('<html>response</html>');
			mockProcessCalendar.mockResolvedValue({ wrong_property: [] }); // Missing data_subject
			mockProcessStudent.mockReturnValue({ name: 'Test Student' });
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			mockProcessSemesters.mockReturnValue({ currentSemester: '20232', semesters: [] });

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(false);
			expect(changeResult.error).toBe('Dữ liệu lịch học không đúng định dạng');
			expect(mockSetCalendar).not.toHaveBeenCalled();
		});
	});

	describe('Network and processing failures', () => {
		test('should handle fetch failures gracefully', async () => {
			mockFetchCalendarWithPost.mockRejectedValue(new Error('Network error'));

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(false);
			expect(changeResult.error).toBe('Network error');
			expect(mockShowError).toHaveBeenCalledWith('Cập nhật học kỳ thất bại', 'Network error');
			expect(mockSetCalendar).not.toHaveBeenCalled();
		});

		test('should handle processing failures gracefully', async () => {
			mockFetchCalendarWithPost.mockResolvedValue('<html>response</html>');
			mockProcessCalendar.mockRejectedValue(new Error('Processing failed'));

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(false);
			expect(changeResult.error).toBe('Processing failed');
			expect(mockSetCalendar).not.toHaveBeenCalled();
		});

		test('should handle unknown errors gracefully', async () => {
			mockFetchCalendarWithPost.mockRejectedValue('Unknown error'); // Not an Error object

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(false);
			expect(changeResult.error).toBe('Có lỗi xảy ra khi lấy dữ liệu!');
			expect(mockSetCalendar).not.toHaveBeenCalled();
		});
	});

	describe('State management', () => {
		test('should not change state when semester is the same', async () => {
			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20231', mockCurrentData); // Same semester
			});

			expect(changeResult.success).toBe(true);
			expect(changeResult.data).toBe(null);
			expect(mockFetchCalendarWithPost).not.toHaveBeenCalled();
			expect(mockSetCalendar).not.toHaveBeenCalled();
		});

		test('should set processing state correctly', async () => {
			mockFetchCalendarWithPost.mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve('<html>response</html>'), 100))
			);
			mockProcessCalendar.mockResolvedValue({ data_subject: [] });
			mockProcessStudent.mockReturnValue({ name: 'Test Student' });
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			mockProcessSemesters.mockReturnValue({ currentSemester: '20232', semesters: [] });

			const { result } = renderHook(() => useCalendarData());

			// Start the change
			const changePromise = act(async () => {
				return result.current.changeSemester('20232', mockCurrentData);
			});

			// Should be processing
			expect(result.current.isProcessing).toBe(true);

			// Wait for completion
			await changePromise;

			// Should not be processing anymore
			expect(result.current.isProcessing).toBe(false);
		});
	});

	describe('Edge cases', () => {
		test('should handle empty calendar data gracefully', async () => {
			mockFetchCalendarWithPost.mockResolvedValue('<html>response</html>');
			mockProcessCalendar.mockResolvedValue({ data_subject: [] }); // Empty but valid
			mockProcessStudent.mockReturnValue({ name: 'Test Student' });
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			mockProcessSemesters.mockReturnValue({ currentSemester: '20232', semesters: [] });

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(true);
			expect(mockSetCalendar).toHaveBeenCalledWith({ data_subject: [] });
		});

		test('should handle null student data gracefully', async () => {
			mockFetchCalendarWithPost.mockResolvedValue('<html>response</html>');
			mockProcessCalendar.mockResolvedValue({ data_subject: [] });
			mockProcessStudent.mockReturnValue(null); // Null student is OK
			mockProcessMainForm.mockReturnValue({ drpSemester: '20232' });
			mockProcessSemesters.mockReturnValue({ currentSemester: '20232', semesters: [] });

			const { result } = renderHook(() => useCalendarData());

			let changeResult: any;
			await act(async () => {
				changeResult = await result.current.changeSemester('20232', mockCurrentData);
			});

			expect(changeResult.success).toBe(true);
			expect(mockSetStudent).toHaveBeenCalledWith(null);
		});
	});
});
