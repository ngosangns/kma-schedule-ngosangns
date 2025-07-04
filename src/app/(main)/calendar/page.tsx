'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

import { LoadingSpinner, PageLoader } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { NotificationSettings } from '@/components/ui/notification-settings';
import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import {
	LogOut,
	ChevronLeft,
	ChevronRight,
	Calendar as CalendarIcon,
	MapPin,
	BookOpen,
	Grid3X3,
	List,
	CalendarDays,
	User,
	RefreshCw,
	Bell
} from 'lucide-react';
import { useAuth, useCalendar } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/use-notifications';
import { notificationService } from '@/lib/ts/notifications';
import { loadData, saveData } from '@/lib/ts/storage';
import {
	fetchCalendarWithGet,
	fetchCalendarWithPost,
	processCalendar,
	processMainForm,
	processSemesters,
	processStudent,
	filterTrashInHtml
} from '@/lib/ts/calendar';
import { logout } from '@/lib/ts/user';
import {
	formatDate,
	getDayName,
	formatSemesterName,
	formatShiftDisplay,
	formatTimeDisplay
} from '@/lib/utils';

type ViewMode = 'calendar' | 'list' | 'month';

export default function CalendarPage() {
	const router = useRouter();
	const { user, logout: authLogout } = useAuth();
	const { student, setCalendar, setStudent } = useCalendar();
	const { showSuccess, showError } = useNotifications();

	const [loading, setLoading] = useState(false);
	const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
	const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
	const [currentWeek, setCurrentWeek] = useState<any[]>([]);
	const [viewMode, setViewMode] = useState<ViewMode>('calendar');
	const [showNotificationSettings, setShowNotificationSettings] = useState(false);
	const [selectedDayData, setSelectedDayData] = useState<any>(null);
	const [showDayDetails, setShowDayDetails] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Check if mobile on mount and resize
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 667);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Handle day cell click for mobile
	const handleDayClick = (day: any) => {
		if (isMobile && day.subjects.length > 0) {
			setSelectedDayData(day);
			setShowDayDetails(true);
		}
	};

	// Tạo function để generate tuần trống
	const generateEmptyWeeks = useCallback((startWeekOffset = 0, numWeeks = 4) => {
		const weeks = [];
		const today = new Date();

		for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
			const weekStart = new Date(today);
			weekStart.setDate(today.getDate() - today.getDay() + 1 + (startWeekOffset + weekIndex) * 7); // Thứ 2

			const week = [];
			for (let i = 0; i < 7; i++) {
				const day = new Date(weekStart);
				day.setDate(weekStart.getDate() + i);
				week.push({
					time: day.getTime(),
					shift: []
				});
			}
			weeks.push(week);
		}
		return weeks;
	}, []);

	// Load initial data
	const [data, setData] = useState<{
		calendar: any;
		student: string | null;
		semesters: any;
		mainForm: any;
		signInToken: string | null;
	}>({
		calendar: null,
		student: null,
		semesters: null,
		mainForm: null,
		signInToken: null
	});

	const updateCurrentWeek = useCallback(
		(weekIndex: number, calendarData?: any) => {
			const cal = calendarData || data.calendar;
			if (!cal || !cal.weeks || cal.weeks.length === 0) return;

			const validIndex = Math.max(0, Math.min(weekIndex, cal.weeks.length - 1));
			const week = cal.weeks[validIndex];
			setCurrentWeek(week);
			setCurrentWeekIndex(validIndex);
		},
		[data.calendar]
	);

	useEffect(() => {
		const storedData = loadData();

		if (
			storedData &&
			storedData.calendar &&
			storedData.calendar.weeks &&
			storedData.calendar.weeks.length > 0
		) {
			// Có dữ liệu thật từ storage với weeks
			setData({
				calendar: storedData.calendar || null,
				student: storedData.student || null,
				semesters: storedData.semesters || null,
				mainForm: storedData.mainForm || null,
				signInToken: storedData.signInToken || null
			});
			// Inline updateCurrentWeek logic to avoid dependency cycle
			if (
				storedData.calendar &&
				storedData.calendar.weeks &&
				storedData.calendar.weeks.length > 0
			) {
				const validIndex = Math.max(0, Math.min(0, storedData.calendar.weeks.length - 1));
				const week = storedData.calendar.weeks[validIndex];
				if (week) {
					setCurrentWeek(week as any[]);
					setCurrentWeekIndex(validIndex);
				}
			}
		} else if (storedData && storedData.calendar && storedData.calendar.data_subject) {
			// Có dữ liệu nhưng không có weeks, kiểm tra xem data_subject có phải là weeks không
			let weeks = storedData.calendar.weeks;

			// Nếu data_subject là array của weeks (từ restructureTKB cũ)
			if (
				Array.isArray(storedData.calendar.data_subject) &&
				storedData.calendar.data_subject.length > 0 &&
				Array.isArray(storedData.calendar.data_subject[0]) &&
				storedData.calendar.data_subject[0][0] &&
				typeof storedData.calendar.data_subject[0][0].time === 'number'
			) {
				weeks = storedData.calendar.data_subject as any;
			}

			// Nếu vẫn không có weeks, tạo empty weeks
			if (!weeks || weeks.length === 0) {
				weeks = generateEmptyWeeks(-1, 4);
			}

			const updatedCalendar = {
				...storedData.calendar,
				weeks: weeks
			};

			setData({
				calendar: updatedCalendar,
				student: storedData.student || null,
				semesters: storedData.semesters || null,
				mainForm: storedData.mainForm || null,
				signInToken: storedData.signInToken || null
			});
			// Inline updateCurrentWeek logic to avoid dependency cycle
			if (updatedCalendar && updatedCalendar.weeks && updatedCalendar.weeks.length > 0) {
				const validIndex = Math.max(0, Math.min(0, updatedCalendar.weeks.length - 1));
				const week = updatedCalendar.weeks[validIndex];
				if (week) {
					setCurrentWeek(week as any[]);
					setCurrentWeekIndex(validIndex);
				}
			}
		} else {
			// Không có dữ liệu gì, tạo hoàn toàn mới
			const emptyWeeks = generateEmptyWeeks(-1, 4);
			const emptyCalendar = {
				data_subject: [],
				weeks: emptyWeeks
			};

			const newData = {
				calendar: emptyCalendar,
				student: null,
				semesters: null,
				mainForm: null,
				signInToken: null
			};

			setData(newData);
			setCurrentWeek(emptyWeeks[1] || []);
			setCurrentWeekIndex(1);
		}
	}, [generateEmptyWeeks]);

	const handleSemesterChange = async (newSemester: string) => {
		if (!data.semesters || !data.mainForm || !data.signInToken) return;

		const { semesters, mainForm, signInToken } = data;
		const oldValue = semesters.currentSemester;

		if (newSemester === oldValue) return;

		setLoading(true);

		try {
			const updatedMainForm = { ...mainForm, drpSemester: newSemester };

			// Fetch dữ liệu mới trước khi cập nhật UI
			const response = await fetchCalendarWithPost(updatedMainForm, signInToken);
			const filteredResponse = filterTrashInHtml(response);
			const newCalendar = await processCalendar(filteredResponse);
			const newStudent = processStudent(filteredResponse);
			const newMainForm = processMainForm(filteredResponse);
			const newSemesters = processSemesters(filteredResponse);

			// Kiểm tra xem có dữ liệu hợp lệ không
			if (!newCalendar || !newSemesters) {
				throw new Error('Dữ liệu học kỳ không hợp lệ');
			}

			// Kiểm tra xem học kỳ có thay đổi thành công không
			if (newSemesters.currentSemester !== newSemester) {
				throw new Error('Không thể chuyển đổi sang học kỳ được chọn');
			}

			// Kiểm tra xem có dữ liệu lịch học không (có thể rỗng nhưng phải có structure)
			if (!newCalendar.hasOwnProperty('data_subject')) {
				throw new Error('Dữ liệu lịch học không đúng định dạng');
			}

			// Chỉ cập nhật state khi fetch thành công
			const newData = {
				mainForm: newMainForm,
				semesters: newSemesters,
				calendar: newCalendar,
				student: newStudent,
				signInToken: signInToken // Giữ lại signInToken
			};

			setData(newData); // Thay thế hoàn toàn dữ liệu cũ
			setCalendar(newCalendar as any);
			setStudent(newStudent);
			saveData(newData);

			updateCurrentWeek(0, newCalendar);
			showSuccess('Đã cập nhật học kỳ thành công!');
		} catch (error) {
			console.error('Semester change error:', error);

			// Hiển thị thông báo lỗi chi tiết hơn
			const errorMessage =
				error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy dữ liệu!';
			showError('Cập nhật học kỳ thất bại', errorMessage);

			// Không cần revert vì chưa cập nhật state
			// State vẫn giữ nguyên giá trị cũ
		} finally {
			setLoading(false);
		}
	};

	const handleSync = async () => {
		if (!data.signInToken) {
			showError('Lỗi đồng bộ', 'Không tìm thấy thông tin đăng nhập');
			return;
		}

		setLoading(true);

		try {
			// Fetch fresh data from server
			const response = await fetchCalendarWithGet(data.signInToken);
			const filteredResponse = filterTrashInHtml(response);
			const newCalendar = await processCalendar(filteredResponse);
			const newStudent = processStudent(filteredResponse);
			const newMainForm = processMainForm(filteredResponse);
			const newSemesters = processSemesters(filteredResponse);

			// Validate the new data
			if (!newCalendar) {
				throw new Error('Dữ liệu lịch học không hợp lệ');
			}

			// Update the data
			const newData = {
				...data,
				calendar: newCalendar,
				student: newStudent,
				mainForm: newMainForm,
				semesters: newSemesters
			};

			setData(newData);
			setCalendar(newCalendar as any);
			setStudent(newStudent);
			saveData({
				signInToken: data.signInToken || null,
				mainForm: newMainForm,
				semesters: newSemesters,
				calendar: newCalendar,
				student: newStudent
			});

			// Maintain current week position if possible
			updateCurrentWeek(currentWeekIndex, newCalendar);

			showSuccess('Đã đồng bộ dữ liệu thành công!');
		} catch (error) {
			console.error('Sync error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Có lỗi xảy ra khi đồng bộ dữ liệu!';
			showError('Đồng bộ thất bại', errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		logout();
		authLogout();
		router.push('/login');
	};

	const getFilteredSubjects = () => {
		if (!currentWeek || !currentWeek.length) return [];

		let subjects: any[] = [];
		currentWeek.forEach((day: any, dayIndex: number) => {
			if (day.shift && day.shift.length > 0) {
				day.shift.forEach((subject: any, shiftIndex: number) => {
					if (subject.name) {
						// Chỉ lấy các ca có môn học
						subjects.push({
							...subject,
							day: dayIndex,
							shift: shiftIndex + 1,
							shiftNumber: shiftIndex + 1,
							dayTime: day.time
						});
					}
				});
			}
		});

		return subjects.sort((a, b) => {
			if (a.day !== b.day) return a.day - b.day;
			return a.shift - b.shift;
		});
	};

	// Get first and last study dates from calendar data
	const getStudyDateRange = useCallback(() => {
		if (!data.calendar || !data.calendar.weeks) return { firstDate: null, lastDate: null };

		let firstDate: Date | null = null;
		let lastDate: Date | null = null;

		data.calendar.weeks.forEach((week: any) => {
			if (Array.isArray(week)) {
				week.forEach((day: any) => {
					if (day && day.time && day.shift) {
						const hasSubjects = day.shift.some((subject: any) => subject && subject.name);
						if (hasSubjects) {
							const dayDate = new Date(day.time);
							if (!firstDate || dayDate < firstDate) {
								firstDate = dayDate;
							}
							if (!lastDate || dayDate > lastDate) {
								lastDate = dayDate;
							}
						}
					}
				});
			}
		});

		return { firstDate, lastDate };
	}, [data.calendar]);

	// Month navigation functions with study date range limits
	const goToPreviousMonth = () => {
		const { firstDate } = getStudyDateRange();
		if (!firstDate) return;

		const newDate = new Date(currentMonthDate);
		newDate.setMonth(newDate.getMonth() - 1);

		// Check if new month is before first study month
		const firstStudyMonth = new Date(
			(firstDate as Date).getFullYear(),
			(firstDate as Date).getMonth(),
			1
		);
		if (newDate.getTime() >= firstStudyMonth.getTime()) {
			setCurrentMonthDate(newDate);
		}
	};

	const goToNextMonth = () => {
		const { lastDate } = getStudyDateRange();
		if (!lastDate) return;

		const newDate = new Date(currentMonthDate);
		newDate.setMonth(newDate.getMonth() + 1);

		// Check if new month is after last study month
		const lastStudyMonth = new Date(
			(lastDate as Date).getFullYear(),
			(lastDate as Date).getMonth(),
			1
		);
		if (newDate.getTime() <= lastStudyMonth.getTime()) {
			setCurrentMonthDate(newDate);
		}
	};

	// Check if navigation buttons should be disabled
	const isNavigationDisabled = () => {
		const { firstDate, lastDate } = getStudyDateRange();
		if (!firstDate || !lastDate) return { prevDisabled: true, nextDisabled: true };

		const currentMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
		const firstStudyMonth = new Date(
			(firstDate as Date).getFullYear(),
			(firstDate as Date).getMonth(),
			1
		);
		const lastStudyMonth = new Date(
			(lastDate as Date).getFullYear(),
			(lastDate as Date).getMonth(),
			1
		);

		return {
			prevDisabled: currentMonth.getTime() <= firstStudyMonth.getTime(),
			nextDisabled: currentMonth.getTime() >= lastStudyMonth.getTime()
		};
	};

	// Auto-adjust month when switching to month view
	useEffect(() => {
		if (viewMode === 'month') {
			// Inline getStudyDateRange logic to avoid dependency cycle
			let firstDate: Date | null = null;
			let lastDate: Date | null = null;

			if (data.calendar && data.calendar.weeks) {
				data.calendar.weeks.forEach((week: any) => {
					if (Array.isArray(week)) {
						week.forEach((day: any) => {
							if (day && day.time && day.shift) {
								const hasSubjects = day.shift.some((subject: any) => subject && subject.name);
								if (hasSubjects) {
									const dayDate = new Date(day.time);
									if (!firstDate || dayDate < firstDate) {
										firstDate = dayDate;
									}
									if (!lastDate || dayDate > lastDate) {
										lastDate = dayDate;
									}
								}
							}
						});
					}
				});
			}

			const today = new Date();

			if (firstDate && today.getTime() < (firstDate as Date).getTime()) {
				// If current date is before first study date, go to first study month
				setCurrentMonthDate(
					new Date((firstDate as Date).getFullYear(), (firstDate as Date).getMonth(), 1)
				);
			} else if (lastDate && today.getTime() > (lastDate as Date).getTime()) {
				// If current date is after last study date, go to last study month
				setCurrentMonthDate(
					new Date((lastDate as Date).getFullYear(), (lastDate as Date).getMonth(), 1)
				);
			}
		}
	}, [viewMode, data.calendar]);

	// Schedule notifications when calendar data changes
	useEffect(() => {
		if (data.calendar && data.calendar.data_subject && Array.isArray(data.calendar.data_subject)) {
			// Clear existing notifications
			notificationService.clearAllNotifications();

			// Schedule notifications for each subject
			data.calendar.data_subject.forEach((subject: any) => {
				if (subject && subject.tkb && Array.isArray(subject.tkb)) {
					subject.tkb.forEach((timeSlot: any) => {
						if (timeSlot && timeSlot.dayOfWeek && Array.isArray(timeSlot.dayOfWeek)) {
							timeSlot.dayOfWeek.forEach((dayInfo: any) => {
								// Convert to Subject format for notification service
								const subjectForNotification = {
									id: `${subject.lop_hoc_phan}-${dayInfo.dow}`,
									name: subject.hoc_phan || 'Môn học',
									code: subject.lop_hoc_phan || '',
									instructor: subject.giang_vien || '',
									room: timeSlot.address || '',
									day: dayInfo.dow,
									startTime: timeSlot.startTime
										? new Date(timeSlot.startTime).toTimeString().slice(0, 5)
										: '07:00',
									endTime: timeSlot.endTime
										? new Date(timeSlot.endTime).toTimeString().slice(0, 5)
										: '09:30',
									shift: 1, // Default shift
									week: 1 // Default week
								};

								notificationService.scheduleNotificationsForSubject(subjectForNotification);
							});
						}
					});
				}
			});
		}
	}, [data.calendar]);

	// Generate month calendar data
	const getMonthCalendarData = () => {
		if (!data.calendar || !data.calendar.weeks) return [];

		const monthData: any[] = [];
		const today = new Date();
		const currentMonth = currentMonthDate.getMonth();
		const currentYear = currentMonthDate.getFullYear();

		// Get first day of month
		const firstDay = new Date(currentYear, currentMonth, 1);

		// Get first day of week for the first day of month (0 = Sunday, 1 = Monday, etc.)
		const firstDayOfWeek = firstDay.getDay();
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDayOfWeek);

		// Generate 6 weeks (42 days) to cover the entire month view
		for (let week = 0; week < 6; week++) {
			const weekData: any[] = [];
			for (let day = 0; day < 7; day++) {
				const currentDate = new Date(startDate);
				currentDate.setDate(startDate.getDate() + week * 7 + day);

				// Find subjects for this date
				const daySubjects: any[] = [];

				// Search through all weeks and days in calendar data
				if (data.calendar.weeks && Array.isArray(data.calendar.weeks)) {
					data.calendar.weeks.forEach((calendarWeek: any) => {
						if (Array.isArray(calendarWeek)) {
							calendarWeek.forEach((dayData: any) => {
								if (dayData && dayData.time) {
									const dayDate = new Date(dayData.time);
									// Compare dates by setting time to 00:00:00 for accurate comparison
									const currentDateNormalized = new Date(
										currentDate.getFullYear(),
										currentDate.getMonth(),
										currentDate.getDate()
									);
									const dayDateNormalized = new Date(
										dayDate.getFullYear(),
										dayDate.getMonth(),
										dayDate.getDate()
									);

									if (currentDateNormalized.getTime() === dayDateNormalized.getTime()) {
										if (dayData.shift && Array.isArray(dayData.shift)) {
											dayData.shift.forEach((subject: any, shiftIndex: number) => {
												if (subject && subject.name) {
													daySubjects.push({
														...subject,
														shiftNumber: shiftIndex + 1,
														time: dayData.time
													});
												}
											});
										}
									}
								}
							});
						}
					});
				}

				weekData.push({
					date: new Date(currentDate),
					isCurrentMonth: currentDate.getMonth() === currentMonth,
					isToday: currentDate.toDateString() === today.toDateString(),
					subjects: daySubjects
				});
			}
			monthData.push(weekData);
		}

		return monthData;
	};

	if (!data.calendar) {
		return <PageLoader text="Đang tải thời khóa biểu..." />;
	}

	// Kiểm tra nếu không có dữ liệu môn học, tạo lịch trống
	const hasSubjects =
		data.calendar.data_subject &&
		Array.isArray(data.calendar.data_subject) &&
		data.calendar.data_subject.length > 0;
	const hasWeeks = data.calendar.weeks && data.calendar.weeks.length > 0;

	// Kiểm tra xem có dữ liệu lịch học thực sự hay không
	const hasRealScheduleData =
		hasSubjects &&
		hasWeeks &&
		currentWeek &&
		currentWeek.some(
			(day: any) => day.shift && day.shift.some((subject: any) => subject && subject.name)
		);

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<div className="text-center sm:text-left">
					<h1 className="text-xl sm:text-2xl font-bold">Thời khóa biểu</h1>
					<p className="text-sm sm:text-base text-muted-foreground">
						{student || user?.name || 'Sinh viên'}
					</p>
				</div>

				{/* Mobile Action Buttons */}
				<div className="flex flex-col sm:hidden gap-2">
					<div className="flex gap-2">
						<Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="flex-1">
									<Bell className="w-4 h-4 mr-2" />
									Thông báo
								</Button>
							</DialogTrigger>
							<DialogContent
								className="max-w-md mx-4"
								onOpenAutoFocus={(e) => e.preventDefault()}
								onCloseAutoFocus={(e) => e.preventDefault()}
							>
								<DialogHeader>
									<DialogTitle>Cài đặt thông báo</DialogTitle>
									<DialogDescription>
										Cấu hình thông báo nhắc nhở cho các lớp học của bạn
									</DialogDescription>
								</DialogHeader>
								<NotificationSettings />
							</DialogContent>
						</Dialog>
						<Button
							onClick={handleSync}
							variant="outline"
							size="sm"
							className="flex-1"
							disabled={loading || !data.signInToken}
						>
							<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
							Đồng bộ
						</Button>
					</div>
					<div className="flex gap-2">
						<Button onClick={handleLogout} variant="outline" size="sm" className="flex-1">
							<LogOut className="w-4 h-4 mr-2" />
							Đăng xuất
						</Button>
					</div>
				</div>

				{/* Desktop Action Buttons */}
				<div className="hidden sm:flex items-center justify-end gap-2">
					<Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm">
								<Bell className="w-4 h-4 mr-2" />
								Thông báo
							</Button>
						</DialogTrigger>
						<DialogContent
							className="max-w-md"
							onOpenAutoFocus={(e) => e.preventDefault()}
							onCloseAutoFocus={(e) => e.preventDefault()}
						>
							<DialogHeader>
								<DialogTitle>Cài đặt thông báo</DialogTitle>
								<DialogDescription>
									Cấu hình thông báo nhắc nhở cho các lớp học của bạn
								</DialogDescription>
							</DialogHeader>
							<NotificationSettings />
						</DialogContent>
					</Dialog>
					<Button
						onClick={handleSync}
						variant="outline"
						size="sm"
						disabled={loading || !data.signInToken}
					>
						<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
						Đồng bộ
					</Button>

					<Button onClick={handleLogout} variant="outline" size="sm">
						<LogOut className="w-4 h-4 mr-2" />
						Đăng xuất
					</Button>
				</div>
			</div>

			{/* Controls */}
			<Card>
				<CardContent className="p-3 sm:p-4">
					<div className="flex flex-col gap-4">
						{/* Semester Selection */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-2">
							<span className="text-sm font-medium whitespace-nowrap">Học kỳ:</span>
							{data.semesters && data.semesters.semesters && (
								<Select
									value={data.semesters.currentSemester}
									onValueChange={handleSemesterChange}
									disabled={loading}
								>
									<SelectTrigger className="w-full sm:w-[200px]">
										{loading ? (
											<div className="flex items-center gap-2">
												<LoadingSpinner size="sm" />
												<span className="text-sm text-muted-foreground">Đang tải...</span>
											</div>
										) : (
											<SelectValue />
										)}
									</SelectTrigger>
									<SelectContent>
										{data.semesters.semesters.map((semester: any) => (
											<SelectItem key={semester.value} value={semester.value}>
												{formatSemesterName(`${semester.th}_${semester.from}_${semester.to}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
							{loading && (
								<span className="text-xs text-muted-foreground">
									Đang cập nhật dữ liệu học kỳ...
								</span>
							)}
						</div>

						{/* View Mode Buttons */}
						<div className="flex justify-center sm:justify-end">
							<div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20">
								<Button
									variant={viewMode === 'calendar' ? 'default' : 'ghost'}
									size="sm"
									onClick={() => setViewMode('calendar')}
									className="flex-1 sm:flex-none"
								>
									<Grid3X3 className="w-4 h-4 sm:mr-2" />
									<span className="hidden sm:inline">Tuần</span>
								</Button>
								<Button
									variant={viewMode === 'list' ? 'default' : 'ghost'}
									size="sm"
									onClick={() => setViewMode('list')}
									className="flex-1 sm:flex-none"
								>
									<List className="w-4 h-4 sm:mr-2" />
									<span className="hidden sm:inline">Danh sách</span>
								</Button>
								<Button
									variant={viewMode === 'month' ? 'default' : 'ghost'}
									size="sm"
									onClick={() => setViewMode('month')}
									className="flex-1 sm:flex-none"
								>
									<CalendarDays className="w-4 h-4 sm:mr-2" />
									<span className="hidden sm:inline">Tháng</span>
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{loading && (
				<Card>
					<CardContent className="p-8">
						<LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
					</CardContent>
				</Card>
			)}

			{/* Week/Month Navigation */}
			{hasRealScheduleData && (
				<Card>
					<CardContent className="p-3 sm:p-4">
						{viewMode === 'month' ? (
							/* Month Navigation */
							<div className="flex items-center justify-between">
								<Button
									variant="outline"
									size="sm"
									onClick={goToPreviousMonth}
									disabled={isNavigationDisabled().prevDisabled}
									className="flex-shrink-0"
								>
									<ChevronLeft className="w-4 h-4 sm:mr-2" />
									<span className="hidden sm:inline">Tháng trước</span>
								</Button>

								<div className="text-center flex-1 px-2">
									<p className="font-medium text-sm sm:text-base">
										{currentMonthDate.toLocaleDateString('vi-VN', {
											month: 'long',
											year: 'numeric'
										})}
									</p>
									<p className="text-xs sm:text-sm text-muted-foreground">Xem theo tháng</p>
								</div>

								<Button
									variant="outline"
									size="sm"
									onClick={goToNextMonth}
									disabled={isNavigationDisabled().nextDisabled}
									className="flex-shrink-0"
								>
									<span className="hidden sm:inline">Tháng sau</span>
									<ChevronRight className="w-4 h-4 sm:ml-2" />
								</Button>
							</div>
						) : (
							/* Week Navigation */
							<div className="flex items-center justify-between">
								<Button
									variant="outline"
									size="sm"
									onClick={() => updateCurrentWeek(currentWeekIndex - 1)}
									disabled={!data.calendar.weeks || currentWeekIndex === 0}
									className="flex-shrink-0"
								>
									<ChevronLeft className="w-4 h-4 sm:mr-2" />
									<span className="hidden sm:inline">Tuần trước</span>
								</Button>

								<div className="text-center flex-1 px-2">
									<p className="font-medium text-sm sm:text-base">
										{data.calendar.weeks && data.calendar.weeks.length > 0 ? (
											<>
												Tuần {currentWeekIndex + 1} / {data.calendar.weeks.length}
											</>
										) : (
											<>Tuần hiện tại</>
										)}
									</p>
									{currentWeek && currentWeek.length > 0 && (
										<p className="text-xs sm:text-sm text-muted-foreground">
											{formatDate(currentWeek[0].time)} -{' '}
											{formatDate(currentWeek[currentWeek.length - 1].time)}
										</p>
									)}
								</div>

								<Button
									variant="outline"
									size="sm"
									onClick={() => updateCurrentWeek(currentWeekIndex + 1)}
									disabled={
										!data.calendar.weeks || currentWeekIndex === data.calendar.weeks.length - 1
									}
									className="flex-shrink-0"
								>
									<span className="hidden sm:inline">Tuần sau</span>
									<ChevronRight className="w-4 h-4 sm:ml-2" />
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Calendar Content */}
			{viewMode === 'calendar' &&
				(hasRealScheduleData ? (
					<div className="space-y-6">
						{/* Desktop Layout - Horizontal Timeline */}
						<div className="hidden lg:block">
							<div className="space-y-4">
								{currentWeek.map((day: any, dayIndex: number) => {
									const daySubjects = day.shift
										? day.shift
												.map((subject: any, shiftIndex: number) => ({
													...subject,
													shiftNumber: shiftIndex + 1
												}))
												.filter((subject: any) => subject.name)
										: [];

									if (daySubjects.length === 0) return null;

									return (
										<Card key={dayIndex} className="overflow-hidden">
											<CardContent className="p-0">
												{/* Day Header */}
												<div className="bg-muted/50 px-4 py-3 border-b">
													<div className="flex items-center justify-between">
														<div>
															<h3 className="font-semibold text-base">
																{getDayName(new Date(day.time).getDay())}
															</h3>
															<p className="text-sm text-muted-foreground">
																{formatDate(day.time, 'DD/MM/YYYY')}
															</p>
														</div>
														<Badge variant="outline" className="text-xs">
															{daySubjects.length} môn học
														</Badge>
													</div>
												</div>

												{/* Subjects Timeline */}
												<div className="p-4">
													<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
														{daySubjects.map((subject: any, subjectIndex: number) => {
															const shiftDisplay = formatShiftDisplay(
																subject.shiftNumber,
																subject.length || 1
															);
															const timeDisplay = formatTimeDisplay(
																subject.shiftNumber,
																subject.length || 1
															);

															return (
																<div
																	key={subjectIndex}
																	className="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
																>
																	{/* Time and Session Badge */}
																	<div className="flex items-center justify-between mb-3">
																		<Badge variant="default" className="text-xs font-medium">
																			{shiftDisplay}
																		</Badge>
																		<span className="text-xs text-muted-foreground font-mono">
																			{timeDisplay}
																		</span>
																	</div>

																	{/* Subject Name */}
																	<h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
																		{subject.name}
																	</h4>

																	{/* Location */}
																	{subject.address && (
																		<div className="flex items-center gap-2 text-xs text-muted-foreground">
																			<MapPin className="w-3 h-3 flex-shrink-0" />
																			<span className="truncate">{subject.address}</span>
																		</div>
																	)}

																	{/* Session Indicator */}
																	<div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-primary" />
																</div>
															);
														})}
													</div>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>

						{/* Mobile/Tablet Layout - Compact Cards */}
						<div className="lg:hidden">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
								{currentWeek.map((day: any, dayIndex: number) => {
									const daySubjects = day.shift
										? day.shift
												.map((subject: any, shiftIndex: number) => ({
													...subject,
													shiftNumber: shiftIndex + 1
												}))
												.filter((subject: any) => subject.name)
										: [];

									return (
										<Card key={dayIndex} className="min-h-[180px] sm:min-h-[200px] overflow-hidden">
											<CardContent className="p-3 sm:p-4">
												{/* Day Header */}
												<div className="text-center mb-3 sm:mb-4 pb-2 border-b border-border/50">
													<p className="font-semibold text-sm sm:text-base">
														{getDayName(new Date(day.time).getDay())}
													</p>
													<p className="text-xs sm:text-sm text-muted-foreground">
														{formatDate(day.time, 'DD/MM')}
													</p>
												</div>

												{/* Subjects */}
												<div className="space-y-2 sm:space-y-3">
													{daySubjects.length > 0 ? (
														daySubjects.map((subject: any, subjectIndex: number) => {
															const shiftDisplay = formatShiftDisplay(
																subject.shiftNumber,
																subject.length || 1
															);
															const timeDisplay = formatTimeDisplay(
																subject.shiftNumber,
																subject.length || 1
															);

															return (
																<div
																	key={subjectIndex}
																	className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors touch-manipulation"
																>
																	{/* Time and Badge */}
																	<div className="flex items-center justify-between mb-2">
																		<Badge
																			variant="default"
																			className="text-xs px-2 py-1 font-medium"
																		>
																			{shiftDisplay}
																		</Badge>
																		<span className="text-xs text-muted-foreground font-mono">
																			{timeDisplay}
																		</span>
																	</div>

																	{/* Subject Name */}
																	<p className="font-medium text-sm mb-2 line-clamp-2 leading-relaxed">
																		{subject.name}
																	</p>

																	{/* Location */}
																	{subject.address && (
																		<div className="flex items-center gap-1 text-xs text-muted-foreground">
																			<MapPin className="w-3 h-3 flex-shrink-0" />
																			<span className="truncate">{subject.address}</span>
																		</div>
																	)}
																</div>
															);
														})
													) : (
														<div className="text-center py-8">
															<p className="text-xs sm:text-sm text-muted-foreground">
																Không có lịch học
															</p>
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>
					</div>
				) : (
					<EmptyState
						icon={CalendarIcon}
						title="Không có dữ liệu lịch học"
						description={
							hasSubjects
								? 'Học kỳ này không có lịch học trong tuần hiện tại.'
								: 'Học kỳ này chưa có lịch học hoặc chưa được cập nhật.'
						}
					/>
				))}

			{/* List View */}
			{viewMode === 'list' && (
				<div className="space-y-3 sm:space-y-4">
					{getFilteredSubjects().length > 0 ? (
						getFilteredSubjects().map((subject: any, index: number) => {
							const shiftDisplay = formatShiftDisplay(subject.shiftNumber, subject.length || 1);
							const timeDisplay = formatTimeDisplay(subject.shiftNumber, subject.length || 1);
							const dayOfWeek = new Date(subject.dayTime).getDay();

							return (
								<Card key={index} className="hover:shadow-md transition-shadow touch-manipulation">
									<CardContent className="p-3 sm:p-4">
										{/* Mobile Layout */}
										<div className="sm:hidden">
											{/* Header with day and time */}
											<div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
												<div className="flex items-center gap-2">
													<CalendarIcon className="w-4 h-4 text-primary" />
													<span className="font-semibold text-primary text-sm">
														{getDayName(dayOfWeek)}
													</span>
												</div>
												<Badge variant="default" className="text-xs px-2 py-1">
													{shiftDisplay}
												</Badge>
											</div>

											{/* Subject name */}
											<div className="flex items-start gap-2 mb-3">
												<BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
												<h3 className="font-semibold text-base leading-tight">{subject.name}</h3>
											</div>

											{/* Time */}
											<div className="text-sm text-muted-foreground font-mono mb-2">
												{timeDisplay}
											</div>

											{/* Details */}
											<div className="space-y-2 text-sm">
												{/* Location */}
												<div className="flex items-center gap-2">
													<MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
													<span className="truncate">
														{subject.address || 'Chưa có thông tin phòng'}
													</span>
												</div>

												{/* Instructor */}
												<div className="flex items-center gap-2">
													<User className="w-4 h-4 text-green-600 flex-shrink-0" />
													<span className="truncate">
														{subject.instructor || 'Chưa có thông tin GV'}
													</span>
												</div>
											</div>
										</div>

										{/* Desktop/Tablet Layout */}
										<div className="hidden sm:flex sm:items-center gap-4">
											{/* Time Info */}
											<div className="flex-shrink-0 lg:w-48">
												<div className="flex items-center gap-2 mb-1">
													<CalendarIcon className="w-4 h-4 text-primary" />
													<span className="font-semibold text-primary">
														{getDayName(dayOfWeek)}
													</span>
												</div>
												<div className="text-sm text-muted-foreground ml-6">
													<div className="font-mono">{timeDisplay}</div>
												</div>
											</div>

											{/* Subject Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-2">
													<BookOpen className="w-5 h-5 text-blue-600" />
													<h3 className="font-semibold text-lg truncate">{subject.name}</h3>
												</div>

												<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
													{/* Location */}
													<div className="flex items-center gap-2">
														<MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
														<span className="truncate">
															{subject.address || 'Chưa có thông tin phòng'}
														</span>
													</div>

													{/* Instructor */}
													<div className="flex items-center gap-2">
														<User className="w-4 h-4 text-green-600 flex-shrink-0" />
														<span className="truncate">
															{subject.instructor || 'Chưa có thông tin GV'}
														</span>
													</div>
												</div>
											</div>

											{/* Badge */}
											<div className="flex-shrink-0">
												<Badge variant="default" className="text-xs">
													{shiftDisplay}
												</Badge>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})
					) : (
						<Card>
							<CardContent className="p-6 sm:p-8 text-center">
								<EmptyState
									icon={CalendarIcon}
									title="Không có lịch học"
									description={
										hasSubjects
											? 'Không có lịch học nào trong tuần này.'
											: 'Học kỳ này chưa có lịch học hoặc chưa được cập nhật.'
									}
								/>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* Month View */}
			{viewMode === 'month' && (
				<Card>
					<CardContent className="p-3 sm:p-4">
						<div className="space-y-4">
							{/* Month Header */}
							<div className="text-center">
								<h3 className="text-lg font-semibold">
									{currentMonthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
								</h3>
							</div>

							{/* Calendar Grid */}
							<div className="grid grid-cols-7 gap-1 sm:gap-2">
								{/* Day Headers */}
								{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
									<div
										key={day}
										className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-muted-foreground bg-muted/50 rounded-md"
									>
										{day}
									</div>
								))}

								{/* Calendar Days */}
								{getMonthCalendarData().map((week, weekIndex) =>
									week.map((day: any, dayIndex: number) => (
										<div
											key={`${weekIndex}-${dayIndex}`}
											onClick={() => handleDayClick(day)}
											className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border rounded-lg transition-all hover:shadow-md cursor-pointer touch-manipulation ${
												day.isCurrentMonth
													? 'bg-background border-border'
													: 'bg-muted/20 border-muted text-muted-foreground'
											} ${day.isToday ? 'ring-2 ring-primary bg-primary/5' : ''} ${
												day.subjects.length > 0 ? 'hover:bg-muted/10' : ''
											}`}
										>
											<div
												className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${day.isToday ? 'text-primary' : ''}`}
											>
												{day.date.getDate()}
											</div>

											{/* Desktop/Tablet View - Show subject details */}
											<div className="hidden min-[667px]:block space-y-1">
												{day.subjects.slice(0, 3).map((subject: any, index: number) => (
													<Popover key={index}>
														<PopoverTrigger asChild>
															<div className="text-xs p-1.5 bg-primary/10 hover:bg-primary/20 rounded border-l-2 border-primary transition-colors cursor-pointer">
																<div className="font-medium truncate">{subject.name}</div>
																<div className="text-muted-foreground text-xs">
																	{formatTimeDisplay(subject.shiftNumber, subject.length || 1)}
																</div>
																{subject.address && (
																	<div className="text-muted-foreground truncate">
																		{subject.address}
																	</div>
																)}
															</div>
														</PopoverTrigger>
														<PopoverContent className="w-80">
															<div className="space-y-3">
																<div className="flex items-center gap-2">
																	<BookOpen className="w-5 h-5 text-blue-600" />
																	<h3 className="font-semibold text-lg">{subject.name}</h3>
																</div>

																<div className="grid grid-cols-1 gap-2 text-sm">
																	<div className="flex items-center gap-2">
																		<CalendarIcon className="w-4 h-4 text-primary" />
																		<span className="font-medium">Thời gian:</span>
																		<span>
																			{formatTimeDisplay(subject.shiftNumber, subject.length || 1)}
																		</span>
																	</div>

																	<div className="flex items-center gap-2">
																		<Badge variant="outline" className="text-xs">
																			Tiết {subject.shiftNumber}
																		</Badge>
																		<span className="text-muted-foreground">
																			({subject.length || 1} tiết)
																		</span>
																	</div>

																	{subject.address && (
																		<div className="flex items-center gap-2">
																			<MapPin className="w-4 h-4 text-orange-600" />
																			<span className="font-medium">Phòng:</span>
																			<span>{subject.address}</span>
																		</div>
																	)}

																	{subject.instructor && (
																		<div className="flex items-center gap-2">
																			<User className="w-4 h-4 text-green-600" />
																			<span className="font-medium">Giảng viên:</span>
																			<span>{subject.instructor}</span>
																		</div>
																	)}

																	{subject.note && (
																		<div className="mt-2 p-2 bg-muted/50 rounded">
																			<span className="font-medium">Ghi chú:</span>
																			<p className="text-muted-foreground mt-1">{subject.note}</p>
																		</div>
																	)}
																</div>
															</div>
														</PopoverContent>
													</Popover>
												))}
												{day.subjects.length > 3 && (
													<div className="text-xs text-muted-foreground font-medium p-1">
														+{day.subjects.length - 3} môn khác
													</div>
												)}
												{day.subjects.length === 0 && day.isCurrentMonth && (
													<div className="text-xs text-muted-foreground/50 italic">
														Không có lịch
													</div>
												)}
											</div>

											{/* Mobile View - Show dots for subjects */}
											<div className="min-[667px]:hidden">
												{day.subjects.length > 0 && (
													<div className="flex flex-wrap gap-1 mt-1">
														{day.subjects.slice(0, 6).map((_: any, index: number) => (
															<div
																key={index}
																className="w-2 h-2 rounded-full bg-primary"
																title={`${day.subjects.length} môn học`}
															/>
														))}
														{day.subjects.length > 6 && (
															<div className="text-xs text-muted-foreground font-medium">
																+{day.subjects.length - 6}
															</div>
														)}
													</div>
												)}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Mobile Day Details Bottom Sheet */}
			<BottomSheet
				isOpen={showDayDetails}
				onClose={() => setShowDayDetails(false)}
				title={
					selectedDayData
						? `${selectedDayData.date.toLocaleDateString('vi-VN', {
								weekday: 'long',
								day: 'numeric',
								month: 'long'
							})}`
						: ''
				}
			>
				<BottomSheetContent>
					{selectedDayData && selectedDayData.subjects.length > 0 && (
						<div className="space-y-4">
							{selectedDayData.subjects.map((subject: any, index: number) => {
								const shiftDisplay = formatShiftDisplay(subject.shiftNumber, subject.length || 1);
								const timeDisplay = formatTimeDisplay(subject.shiftNumber, subject.length || 1);

								return (
									<div
										key={index}
										className="p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors"
									>
										{/* Subject Header */}
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2">
												<BookOpen className="w-5 h-5 text-blue-600" />
												<h3 className="font-semibold text-lg">{subject.name}</h3>
											</div>
											<Badge variant="default" className="text-xs">
												{shiftDisplay}
											</Badge>
										</div>

										{/* Subject Details */}
										<div className="space-y-2 text-sm">
											<div className="flex items-center gap-2">
												<CalendarIcon className="w-4 h-4 text-primary" />
												<span className="font-medium">Thời gian:</span>
												<span className="font-mono">{timeDisplay}</span>
											</div>

											{subject.address && (
												<div className="flex items-center gap-2">
													<MapPin className="w-4 h-4 text-orange-600" />
													<span className="font-medium">Phòng:</span>
													<span>{subject.address}</span>
												</div>
											)}

											{subject.instructor && (
												<div className="flex items-center gap-2">
													<User className="w-4 h-4 text-green-600" />
													<span className="font-medium">Giảng viên:</span>
													<span>{subject.instructor}</span>
												</div>
											)}

											{subject.note && (
												<div className="mt-3 p-3 bg-muted/50 rounded">
													<span className="font-medium">Ghi chú:</span>
													<p className="text-muted-foreground mt-1">{subject.note}</p>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</BottomSheetContent>
			</BottomSheet>
		</div>
	);
}
