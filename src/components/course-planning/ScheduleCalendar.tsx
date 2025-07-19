'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
	Calendar,
	Clock,
	AlertTriangle,
	User,
	BookOpen,
	ChevronLeft,
	ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';
import { numToDate, getTotalDaysBetweenDates } from '@/lib/ts/course-planning/schedule-generator';
import { CalendarTableItem } from '@/types/course-planning';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Interface for detailed session info
interface DetailedSessionInfo extends CalendarTableItem {
	date: Date;
	dayOfWeek: string;
	shift: string;
	teacher: string;
	majorKey: string;
}

export function ScheduleCalendar() {
	const { state, getCalendarTableData } = useCoursePlanning();
	const [selectedSession, setSelectedSession] = useState<DetailedSessionInfo | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
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

	// Get calendar data
	const calendarData = state.calendar ? getCalendarTableData() : null;

	// Auto-adjust month when calendar data changes
	useEffect(() => {
		if (state.calendar && calendarData) {
			const minDate = numToDate(state.calendar.minDate);
			// Always navigate to the first month of the calendar when data is available
			setCurrentMonthDate(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
		}
	}, [state.calendar?.minDate]); // eslint-disable-line react-hooks/exhaustive-deps
	const hasSelectedSubjects = Object.values(state.selectedClasses).some((majorData) =>
		Object.values(majorData).some((subject) => subject.show)
	);

	// Generate month calendar data - moved here to avoid conditional hook call
	const minDate = state.calendar ? numToDate(state.calendar.minDate) : new Date();
	const maxDate = state.calendar ? numToDate(state.calendar.maxDate) : new Date();

	const getMonthCalendarData = useMemo(() => {
		if (!calendarData || !state.calendar) return [];

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

		// Generate 6 weeks of calendar data
		for (let week = 0; week < 6; week++) {
			const weekData: any[] = [];
			for (let day = 0; day < 7; day++) {
				const currentDate = new Date(startDate);
				currentDate.setDate(startDate.getDate() + week * 7 + day);

				const isCurrentMonth = currentDate.getMonth() === currentMonth;
				const isToday = currentDate.toDateString() === today.toDateString();

				// Get sessions for this day
				const dayIndex = getTotalDaysBetweenDates(minDate, currentDate);
				const dayData =
					dayIndex >= 0 && dayIndex < calendarData.data.length
						? calendarData.data[dayIndex] || []
						: [];

				// Flatten the 2D array of sessions for this day
				const sessions: CalendarTableItem[] = [];
				dayData.forEach((sessionRow) => {
					if (Array.isArray(sessionRow)) {
						sessions.push(...sessionRow);
					}
				});

				// Sort sessions by start session time
				sessions.sort((a, b) => a.startSession - b.startSession);

				// Group sessions by shift
				const sessionsByShift = {
					morning: sessions.filter(
						(session) => session && session.startSession >= 1 && session.startSession <= 6
					),
					afternoon: sessions.filter(
						(session) => session && session.startSession >= 7 && session.startSession <= 12
					),
					evening: sessions.filter(
						(session) => session && session.startSession >= 13 && session.startSession <= 16
					)
				};

				weekData.push({
					date: currentDate,
					isCurrentMonth,
					isToday,
					sessions,
					sessionsByShift,
					hasClasses: sessions.length > 0
				});
			}
			monthData.push(weekData);
		}

		return monthData;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		calendarData,
		currentMonthDate.getMonth(),
		currentMonthDate.getFullYear(),
		state.calendar?.minDate,
		state.calendar?.maxDate
	]);

	if (!state.calendar) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>Vui lòng tải lên file Excel để xem lịch học</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!hasSelectedSubjects) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Lịch học
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						<Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>Chọn môn học để xem lịch học</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!calendarData) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Lịch học
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						<p>Đang tải dữ liệu lịch học...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Month navigation functions
	const canGoToPreviousMonth = () => {
		const newDate = new Date(currentMonthDate);
		newDate.setMonth(newDate.getMonth() - 1);
		const firstStudyMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
		return newDate.getTime() >= firstStudyMonth.getTime();
	};

	const canGoToNextMonth = () => {
		const newDate = new Date(currentMonthDate);
		newDate.setMonth(newDate.getMonth() + 1);
		const lastStudyMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
		return newDate.getTime() <= lastStudyMonth.getTime();
	};

	const goToPreviousMonth = () => {
		if (canGoToPreviousMonth()) {
			const newDate = new Date(currentMonthDate);
			newDate.setMonth(newDate.getMonth() - 1);
			setCurrentMonthDate(newDate);
		}
	};

	const goToNextMonth = () => {
		if (canGoToNextMonth()) {
			const newDate = new Date(currentMonthDate);
			newDate.setMonth(newDate.getMonth() + 1);
			setCurrentMonthDate(newDate);
		}
	};

	// Handle day cell click for mobile
	const handleDayClick = (day: any) => {
		if (isMobile && day.hasClasses) {
			setSelectedDayData(day);
			setShowDayDetails(true);
		}
	};

	// Get detailed session information
	const getDetailedSessionInfo = (
		session: CalendarTableItem,
		date: Date,
		dayIndex: number,
		shiftName: string
	): DetailedSessionInfo => {
		// Find the teacher and major for this session
		let teacher = 'Chưa có thông tin';
		let majorKey = 'Chưa xác định';

		if (state.calendar) {
			// Search through all majors and subjects to find teacher info
			Object.entries(state.calendar.majors).forEach(([major, subjects]) => {
				Object.entries(subjects).forEach(([subjectName, subjectData]) => {
					if (subjectName === session.subjectName) {
						majorKey = major;
						Object.entries(subjectData).forEach(([classCode, classData]) => {
							if (classCode === session.classCode) {
								teacher = classData.teacher || 'Chưa có thông tin';
							}
						});
					}
				});
			});
		}

		return {
			...session,
			date,
			dayOfWeek: DAYS_OF_WEEK[dayIndex] || 'Không xác định',
			shift: shiftName,
			teacher,
			majorKey
		};
	};

	// Handle session click
	const handleSessionClick = (
		session: CalendarTableItem,
		date: Date,
		dayIndex: number,
		shiftName: string
	) => {
		const detailedInfo = getDetailedSessionInfo(session, date, dayIndex, shiftName);
		setSelectedSession(detailedInfo);
		setIsDialogOpen(true);
	};

	const getSessionColorByShift = (startSession: number) => {
		// Color based on shift (morning, afternoon, evening)
		if (startSession >= 1 && startSession <= 6) {
			// Morning (Sáng) - Yellow/Orange theme
			return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700';
		} else if (startSession >= 7 && startSession <= 12) {
			// Afternoon (Chiều) - Blue theme
			return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700';
		} else if (startSession >= 13 && startSession <= 16) {
			// Evening (Tối) - Purple theme
			return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700';
		} else {
			// Default fallback
			return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-700';
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Lịch học
				</CardTitle>
				<CardDescription>Lịch học được tạo từ các môn đã chọn</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Conflict Warning */}
				{calendarData.totalConflictedSessions > 0 && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Có {calendarData.totalConflictedSessions} tiết học bị trùng thời gian. Hãy thử chọn
							lớp khác hoặc sử dụng tính năng tạo lịch tự động.
						</AlertDescription>
					</Alert>
				)}

				{/* Month Navigation */}
				<div className="flex items-center justify-between">
					<Button
						variant="outline"
						size="sm"
						onClick={goToPreviousMonth}
						disabled={!canGoToPreviousMonth()}
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
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={goToNextMonth}
						disabled={!canGoToNextMonth()}
						className="flex-shrink-0"
					>
						<span className="hidden sm:inline">Tháng sau</span>
						<ChevronRight className="w-4 h-4 sm:ml-2" />
					</Button>
				</div>

				{/* Month Calendar Grid */}
				<div className="space-y-4">
					{/* Calendar Grid */}
					<div className="space-y-1 sm:space-y-2">
						{/* Day Headers */}
						<div className="grid grid-cols-7 gap-1 sm:gap-2">
							{DAYS_OF_WEEK.map((day) => (
								<div
									key={day}
									className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-muted-foreground bg-muted/50 rounded-md"
								>
									{day}
								</div>
							))}
						</div>

						{/* Calendar Weeks */}
						{getMonthCalendarData.map((week, weekIndex) => (
							<div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
								{week.map((day: any, dayIndex: number) => (
									<div
										key={`${weekIndex}-${dayIndex}`}
										onClick={() => handleDayClick(day)}
										className={`p-1 sm:p-2 border rounded-lg transition-all hover:shadow-md cursor-pointer touch-manipulation ${
											day.isCurrentMonth
												? 'bg-background border-border'
												: 'bg-muted/20 border-muted text-muted-foreground'
										} ${day.isToday ? 'ring-2 ring-primary bg-primary/5' : ''} ${
											day.hasClasses ? 'hover:bg-muted/10' : ''
										}`}
									>
										<div
											className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${day.isToday ? 'text-primary' : ''}`}
										>
											{day.date.getDate()}
										</div>

										{/* Sessions Display */}
										<div className="space-y-1">
											{/* Desktop: Show all session details */}
											<div className="hidden sm:block space-y-1">
												{day.sessions.map((session: CalendarTableItem, index: number) => {
													if (!session || !session.subjectName) return null;
													return (
														<div
															key={index}
															onClick={(e) => {
																e.stopPropagation();
																handleSessionClick(session, day.date, day.date.getDay(), 'Tự động');
															}}
															className={`text-xs p-1.5 rounded border ${getSessionColorByShift(session.startSession)} cursor-pointer hover:shadow-sm transition-shadow mb-1`}
														>
															<div className="font-medium truncate" title={session.subjectName}>
																{session.subjectName}
															</div>
															<div className="text-xs opacity-75">
																Tiết {session.startSession}
																{session.startSession !== session.endSession &&
																	`-${session.endSession}`}
															</div>
														</div>
													);
												})}
											</div>

											{/* Mobile: Show dots for all sessions */}
											<div className="block sm:hidden">
												{day.hasClasses && (
													<div className="flex flex-wrap gap-1 justify-center">
														{day.sessions
															.filter(
																(session: CalendarTableItem) => session && session.subjectName
															)
															.map((session: CalendarTableItem, index: number) => (
																<div
																	key={index}
																	className={`w-2 h-2 rounded-full ${(() => {
																		const color = getSessionColorByShift(session.startSession);
																		return color && color.includes('bg-')
																			? color.split(' ')[0]
																			: 'bg-primary';
																	})()} opacity-75`}
																></div>
															))}
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						))}
					</div>
				</div>

				{/* Legend */}
				<div className="text-xs text-muted-foreground space-y-2">
					<p>
						💡 <strong>Gợi ý:</strong> Nhấp vào tiết học để xem chi tiết. Trên mobile, nhấp vào ngày
						để xem danh sách tiết học.
					</p>

					{/* Color Legend */}
					<div className="flex flex-wrap gap-4 text-xs">
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
							<span>Sáng (Tiết 1-6)</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
							<span>Chiều (Tiết 7-12)</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-3 h-3 rounded bg-purple-200 border border-purple-300"></div>
							<span>Tối (Tiết 13-16)</span>
						</div>
					</div>
				</div>
			</CardContent>

			{/* Subject Detail Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Thông tin môn học
						</DialogTitle>
					</DialogHeader>

					{selectedSession && (
						<div className="space-y-4">
							{/* Subject Name */}
							<div>
								<h3 className="font-semibold text-lg">{selectedSession.subjectName}</h3>
								<Badge variant="outline" className="mt-1">
									{selectedSession.majorKey}
								</Badge>
							</div>

							{/* Basic Info */}
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">Ngày:</span>
									</div>
									<p className="text-muted-foreground ml-6">
										{selectedSession.dayOfWeek}, {selectedSession.date.toLocaleDateString('vi-VN')}
									</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">Ca học:</span>
									</div>
									<p className="text-muted-foreground ml-6">{selectedSession.shift}</p>
								</div>
							</div>

							{/* Session Details */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Tiết học:</span>
								</div>
								<p className="text-muted-foreground ml-6">
									Tiết {selectedSession.startSession}
									{selectedSession.startSession !== selectedSession.endSession &&
										` - ${selectedSession.endSession}`}
								</p>
							</div>

							{/* Class Code */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<BookOpen className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Mã lớp:</span>
								</div>
								<p className="text-muted-foreground ml-6">{selectedSession.classCode}</p>
							</div>

							{/* Teacher */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Giảng viên:</span>
								</div>
								<p className="text-muted-foreground ml-6">{selectedSession.teacher}</p>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Mobile Day Details Dialog */}
			<Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
				<DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Lịch học ngày {selectedDayData?.date.toLocaleDateString('vi-VN')}
						</DialogTitle>
					</DialogHeader>
					{selectedDayData && (
						<div className="space-y-2">
							{selectedDayData.sessions
								.filter((session: CalendarTableItem) => session && session.subjectName)
								.sort(
									(a: CalendarTableItem, b: CalendarTableItem) => a.startSession - b.startSession
								)
								.map((session: CalendarTableItem, index: number) => (
									<div
										key={index}
										onClick={() => {
											const detailedInfo = getDetailedSessionInfo(
												session,
												selectedDayData.date,
												selectedDayData.date.getDay(),
												'Tự động'
											);
											setSelectedSession(detailedInfo);
											setShowDayDetails(false);
											setIsDialogOpen(true);
										}}
										className={`p-3 rounded-lg border ${getSessionColorByShift(session.startSession)} cursor-pointer hover:shadow-md transition-shadow`}
									>
										<div className="font-medium text-sm mb-1">{session.subjectName}</div>
										<div className="text-xs text-muted-foreground mb-1">{session.classCode}</div>
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<Clock className="h-3 w-3" />
											<span>
												Tiết {session.startSession}
												{session.startSession !== session.endSession && `-${session.endSession}`}
											</span>
										</div>
									</div>
								))}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</Card>
	);
}
