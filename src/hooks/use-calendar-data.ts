import { useState, useCallback } from 'react';
import { useAuth, useCalendar } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/use-notifications';
import { saveData } from '@/lib/ts/storage';
import {
	fetchCalendarWithGet,
	fetchCalendarWithPost,
	processCalendar,
	processMainForm,
	processSemesters,
	processStudent,
	filterTrashInHtml,
	exportToGoogleCalendar
} from '@/lib/ts/calendar';
import { login as loginUser, logout as logoutUser } from '@/lib/ts/user';
import { getErrorMessage } from '@/lib/utils';
import { UseCalendarDataReturn, ProcessedCalendarData, SemesterData, MainFormData } from '@/types';

export function useCalendarData(): UseCalendarDataReturn {
	const { login: authLogin, logout: authLogout, setLoading, setError } = useAuth();
	const { setCalendar, setStudent } = useCalendar();
	const { showSuccess, showError } = useNotifications();
	const [isProcessing, setIsProcessing] = useState(false);

	const loginWithCredentials = useCallback(
		async (username: string, password: string, setGlobalLoading: boolean = true) => {
			if (setGlobalLoading) {
				setLoading();
			}

			try {
				const signInToken = await loginUser(username, password);
				const response = filterTrashInHtml(await fetchCalendarWithGet(signInToken));
				const calendar = await processCalendar(response);
				const student = processStudent(response);
				const mainForm = processMainForm(response);
				const semesters = processSemesters(response);

				const userData = {
					id: username,
					name: student || username
				};

				saveData({
					signInToken,
					mainForm,
					semesters: semesters || null,
					calendar,
					student
				});

				authLogin(userData, signInToken);
				setCalendar(calendar);
				setStudent(student);

				if (setGlobalLoading) {
					showSuccess('Đăng nhập thành công!');
				}
				return { success: true, data: { calendar, student, mainForm, semesters } };
			} catch (error) {
				console.error('Login error:', error);
				const errorMessage = getErrorMessage(error);
				if (setGlobalLoading) {
					setError(errorMessage);
				}
				showError('Đăng nhập thất bại', errorMessage);
				logoutUser();
				return { success: false, error: errorMessage };
			}
		},
		[authLogin, setCalendar, setStudent, setLoading, setError, showSuccess, showError]
	);

	const processManualData = useCallback(
		async (userResponse: string) => {
			setLoading();

			try {
				const response = filterTrashInHtml(userResponse);
				const calendar = await processCalendar(response);
				const student = processStudent(response);
				const mainForm = processMainForm(response);
				const semesters = processSemesters(response);

				const userData = {
					id: 'manual-user',
					name: student || 'Manual User'
				};

				saveData({
					mainForm,
					semesters: semesters || null,
					calendar,
					student
				});

				authLogin(userData, '');
				setCalendar(calendar);
				setStudent(student);

				showSuccess('Dữ liệu đã được xử lý thành công!');
				return { success: true, data: { calendar, student, mainForm, semesters } };
			} catch (error) {
				console.error('Manual response processing error:', error);
				const errorMessage = 'Có lỗi xảy ra khi xử lý dữ liệu!';
				setError(errorMessage);
				showError('Xử lý dữ liệu thất bại', errorMessage);
				logoutUser();
				return { success: false, error: errorMessage };
			}
		},
		[authLogin, setCalendar, setStudent, setLoading, setError, showSuccess, showError]
	);

	const changeSemester = useCallback(
		async (
			newSemester: string,
			currentData: { semesters: SemesterData; mainForm: MainFormData; signInToken: string }
		) => {
			const { semesters, mainForm, signInToken } = currentData;
			const oldValue = semesters.currentSemester;

			if (newSemester === oldValue) {
				return { success: true, data: null };
			}

			setIsProcessing(true);

			try {
				const updatedMainForm = { ...mainForm, drpSemester: newSemester };

				// Fetch dữ liệu mới trước khi cập nhật state
				const response = await fetchCalendarWithPost(updatedMainForm, signInToken);
				const filteredResponse = filterTrashInHtml(response);
				const newCalendar = await processCalendar(filteredResponse);
				const newStudent = processStudent(filteredResponse);
				const newMainForm = processMainForm(filteredResponse);
				const newSemesters = processSemesters(filteredResponse);

				// Validate dữ liệu trước khi cập nhật
				if (!newCalendar || !newSemesters) {
					throw new Error('Dữ liệu học kỳ không hợp lệ');
				}

				if (newSemesters.currentSemester !== newSemester) {
					throw new Error('Không thể chuyển đổi sang học kỳ được chọn');
				}

				if (!newCalendar.hasOwnProperty('data_subject')) {
					throw new Error('Dữ liệu lịch học không đúng định dạng');
				}

				// Chỉ cập nhật state khi validation thành công
				const newData = {
					mainForm: newMainForm,
					semesters: newSemesters,
					calendar: newCalendar,
					student: newStudent,
					signInToken: signInToken // Giữ lại signInToken
				};

				setCalendar(newCalendar);
				setStudent(newStudent);
				saveData(newData);

				showSuccess('Đã cập nhật học kỳ thành công!');
				return { success: true, data: newData };
			} catch (error) {
				console.error('Semester change error:', error);
				const errorMessage =
					error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy dữ liệu!';
				showError('Cập nhật học kỳ thất bại', errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setIsProcessing(false);
			}
		},
		[setCalendar, setStudent, showSuccess, showError]
	);

	const exportCalendar = useCallback(
		(student: string, calendar: ProcessedCalendarData) => {
			try {
				exportToGoogleCalendar(student, calendar);
				showSuccess('Đã xuất lịch thành công!');
				return { success: true };
			} catch (error) {
				console.error('Export calendar error:', error);
				const errorMessage = 'Có lỗi xảy ra khi xuất lịch!';
				showError('Xuất lịch thất bại', errorMessage);
				return { success: false, error: errorMessage };
			}
		},
		[showSuccess, showError]
	);

	const logout = useCallback(() => {
		logoutUser();
		authLogout();
		showSuccess('Đã đăng xuất thành công!');
	}, [authLogout, showSuccess]);

	return {
		isProcessing,
		loginWithCredentials,
		processManualData,
		changeSemester,
		exportCalendar,
		logout
	};
}
