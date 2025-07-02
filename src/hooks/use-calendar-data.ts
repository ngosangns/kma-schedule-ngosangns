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

export function useCalendarData() {
	const { login: authLogin, logout: authLogout, setLoading, setError } = useAuth();
	const { setCalendar, setStudent } = useCalendar();
	const { showSuccess, showError } = useNotifications();
	const [isProcessing, setIsProcessing] = useState(false);

	const loginWithCredentials = useCallback(
		async (username: string, password: string) => {
			setLoading();

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
					semesters,
					calendar,
					student
				});

				authLogin(userData, signInToken);
				setCalendar(calendar as any);
				setStudent(student);

				showSuccess('Đăng nhập thành công!');
				return { success: true, data: { calendar, student, mainForm, semesters } };
			} catch (error) {
				console.error('Login error:', error);
				const errorMessage = getErrorMessage(error);
				setError(errorMessage);
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
					semesters,
					calendar,
					student
				});

				authLogin(userData, '');
				setCalendar(calendar as any);
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
			currentData: { semesters: any; mainForm: any; signInToken: any }
		) => {
			const { semesters, mainForm, signInToken } = currentData;
			const oldValue = semesters.currentSemester;

			if (newSemester === oldValue) {
				return { success: true, data: null };
			}

			setIsProcessing(true);

			try {
				const updatedMainForm = { ...mainForm, drpSemester: newSemester };

				const response = await fetchCalendarWithPost(updatedMainForm, signInToken);
				const filteredResponse = filterTrashInHtml(response);
				const newCalendar = await processCalendar(filteredResponse);
				const newStudent = processStudent(filteredResponse);
				const newMainForm = processMainForm(filteredResponse);
				const newSemesters = processSemesters(filteredResponse);

				const newData = {
					mainForm: newMainForm,
					semesters: newSemesters,
					calendar: newCalendar,
					student: newStudent
				};

				setCalendar(newCalendar as any);
				setStudent(newStudent);
				saveData(newData);

				showSuccess('Đã cập nhật học kỳ thành công!');
				return { success: true, data: newData };
			} catch (error) {
				console.error('Semester change error:', error);
				const errorMessage = 'Có lỗi xảy ra khi lấy dữ liệu!';
				showError('Cập nhật học kỳ thất bại', errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setIsProcessing(false);
			}
		},
		[setCalendar, setStudent, showSuccess, showError]
	);

	const exportCalendar = useCallback(
		(student: string, calendar: any) => {
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
