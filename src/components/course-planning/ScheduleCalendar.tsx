'use client';

import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, User, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';
import { numToDate, getTotalDaysBetweenDates } from '@/lib/ts/course-planning/schedule-generator';
import { CalendarTableItem } from '@/types/course-planning';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const SHIFTS = [
	{
		name: 'Sáng',
		sessions: [1, 2, 3, 4, 5, 6],
		color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
	},
	{
		name: 'Chiều',
		sessions: [7, 8, 9, 10, 11, 12],
		color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
	},
	{
		name: 'Tối',
		sessions: [13, 14, 15, 16],
		color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
	}
];

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

	const calendarData = getCalendarTableData();
	const hasSelectedSubjects = Object.values(state.selectedClasses).some((majorData) =>
		Object.values(majorData).some((subject) => subject.show)
	);

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

	const minDate = numToDate(state.calendar.minDate);
	const maxDate = numToDate(state.calendar.maxDate);

	// Create weekly view
	const weeks: Date[][] = [];
	const currentDate = new Date(minDate);

	// Find the Monday of the first week
	while (currentDate.getDay() !== 1) {
		currentDate.setDate(currentDate.getDate() - 1);
	}

	while (currentDate <= maxDate) {
		const week: Date[] = [];
		for (let i = 0; i < 7; i++) {
			week.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		weeks.push(week);
	}

	const getSessionsForDay = (date: Date) => {
		const dayIndex = getTotalDaysBetweenDates(minDate, date);
		if (dayIndex < 0 || dayIndex >= calendarData.data.length) return [];

		return calendarData.data[dayIndex] || [];
	};

	const getSessionsByShift = (sessions: CalendarTableItem[][], shiftSessions: number[]) => {
		const shiftItems: CalendarTableItem[] = [];

		sessions.forEach((sessionRow) => {
			sessionRow.forEach((session) => {
				// Check if session overlaps with this shift
				const sessionStart = session.startSession;
				const sessionEnd = session.endSession;

				const hasOverlap = shiftSessions.some(
					(shiftSession) => sessionStart <= shiftSession && sessionEnd >= shiftSession
				);

				if (hasOverlap) {
					shiftItems.push(session);
				}
			});
		});

		return shiftItems;
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

	const getSessionColor = (subjectName: string) => {
		// Generate consistent color based on subject name
		const colors = [
			'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
			'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
			'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700',
			'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700',
			'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-700',
			'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-700',
			'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700',
			'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700'
		];

		let hash = 0;
		for (let i = 0; i < subjectName.length; i++) {
			hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
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

				{/* Calendar Grid */}
				<div className="space-y-6">
					{weeks.map((week, weekIndex) => (
						<div key={weekIndex} className="border rounded-lg overflow-hidden">
							{/* Week Header */}
							<div className="bg-muted/50 p-3 border-b">
								<h3 className="font-medium">
									Tuần {weekIndex + 1}: {week[0]?.toLocaleDateString('vi-VN')} -{' '}
									{week[6]?.toLocaleDateString('vi-VN')}
								</h3>
							</div>

							{/* Days Grid */}
							<div className="grid grid-cols-7 gap-0 min-h-[600px]">
								{week.map((date, dayIndex) => {
									const sessions = getSessionsForDay(date);
									const isToday = date.toDateString() === new Date().toDateString();
									const isWeekend = dayIndex === 0 || dayIndex === 6;

									return (
										<div
											key={dayIndex}
											className={`border-r last:border-r-0 flex flex-col ${
												isToday ? 'bg-primary/5' : isWeekend ? 'bg-muted/20' : ''
											}`}
										>
											{/* Day Header */}
											<div
												className={`p-2 border-b text-center ${
													isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/30'
												}`}
											>
												<div className="text-xs font-medium">{DAYS_OF_WEEK[dayIndex]}</div>
												<div className="text-sm">{date.getDate()}</div>
											</div>

											{/* Sessions by Shifts */}
											<div className="flex-1 flex flex-col">
												{SHIFTS.map((shift, shiftIndex) => {
													const shiftSessions = getSessionsByShift(sessions, shift.sessions);

													return (
														<div
															key={shiftIndex}
															className={`border-b last:border-b-0 flex-1 flex flex-col ${shift.color}`}
														>
															<div className="px-2 py-1 text-xs font-medium text-center border-b bg-background/50 flex-shrink-0">
																{shift.name}
															</div>
															<div className="p-2 flex-1 overflow-hidden">
																{shiftSessions.length > 0 ? (
																	<div className="space-y-1 h-full overflow-y-auto">
																		{shiftSessions.map((session, sessionIndex) => (
																			<div
																				key={sessionIndex}
																				onClick={() =>
																					handleSessionClick(session, date, dayIndex, shift.name)
																				}
																				className={`text-xs p-1.5 rounded border ${getSessionColor(session.subjectName)} flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow`}
																			>
																				<div
																					className="font-medium truncate text-xs leading-tight"
																					title={session.subjectName}
																				>
																					{session.subjectName}
																				</div>
																				<div className="text-xs opacity-75 truncate">
																					{session.classCode}
																				</div>
																				<div className="flex items-center gap-1 text-xs opacity-75">
																					<Clock className="h-2 w-2 flex-shrink-0" />
																					<span className="truncate">
																						Tiết {session.startSession}
																						{session.startSession !== session.endSession &&
																							`-${session.endSession}`}
																					</span>
																				</div>
																			</div>
																		))}
																	</div>
																) : (
																	<div className="text-xs text-muted-foreground text-center py-4 italic h-full flex items-center justify-center">
																		Không có tiết học
																	</div>
																)}
															</div>
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>

				{/* Legend */}
				<div className="text-xs text-muted-foreground">
					<p>
						<strong>Chú thích:</strong>
					</p>
					<ul className="list-disc list-inside space-y-1 ml-2">
						<li>Mỗi màu đại diện cho một môn học khác nhau</li>
						<li>Tiết học được hiển thị theo thời gian thực tế</li>
						<li>Các tiết trùng nhau sẽ được cảnh báo ở trên</li>
						<li>Click vào thẻ môn học để xem thông tin chi tiết</li>
					</ul>
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
		</Card>
	);
}
