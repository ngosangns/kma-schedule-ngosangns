'use client';

import { useState, useEffect } from 'react';
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { LoadingSpinner, PageLoader } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
	Download,
	LogOut,
	ChevronLeft,
	ChevronRight,
	Calendar as CalendarIcon,
	MapPin,
	BookOpen,
	Grid3X3,
	List
} from 'lucide-react';
import { useAuth, useCalendar } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/use-notifications';
import { loadData, saveData } from '@/lib/ts/storage';
import {
	fetchCalendarWithPost,
	processCalendar,
	processMainForm,
	processSemesters,
	processStudent,
	filterTrashInHtml,
	exportToGoogleCalendar
} from '@/lib/ts/calendar';
import { logout } from '@/lib/ts/user';
import { formatDate, getShiftTime, getShiftSession, getDayName } from '@/lib/utils';
import { Subject } from '@/types';

type ViewMode = 'calendar' | 'list' | 'agenda';

export default function CalendarPage() {
	const router = useRouter();
	const { user, logout: authLogout } = useAuth();
	const { calendar, student, setCalendar, setStudent } = useCalendar();
	const { showSuccess, showError } = useNotifications();

	const [loading, setLoading] = useState(false);
	const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
	const [currentWeek, setCurrentWeek] = useState<any[]>([]);
	const [viewMode, setViewMode] = useState<ViewMode>('calendar');
	const [selectedSession, setSelectedSession] = useState<string>('all');

	// Tạo function để generate tuần trống
	const generateEmptyWeeks = (startWeekOffset = 0, numWeeks = 4) => {
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
	};

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

	useEffect(() => {
		const storedData = loadData();

		if (
			storedData &&
			storedData.calendar &&
			storedData.calendar.weeks &&
			storedData.calendar.weeks.length > 0
		) {
			// Có dữ liệu thật từ storage với weeks
			setData(storedData);
			updateCurrentWeek(0, storedData.calendar);
		} else if (storedData && storedData.calendar) {
			// Có dữ liệu nhưng không có weeks, giữ dữ liệu và tạo empty weeks
			const emptyWeeks = generateEmptyWeeks(-1, 4);
			const updatedCalendar = {
				...storedData.calendar,
				weeks: emptyWeeks
			};

			const newData = {
				...storedData,
				calendar: updatedCalendar
			};

			setData(newData);
			setCurrentWeek(emptyWeeks[1]);
			setCurrentWeekIndex(1);
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
			setCurrentWeek(emptyWeeks[1]);
			setCurrentWeekIndex(1);
		}
	}, []);

	const updateCurrentWeek = (weekIndex: number, calendarData?: any) => {
		const cal = calendarData || data.calendar;
		if (!cal || !cal.weeks || cal.weeks.length === 0) return;

		const validIndex = Math.max(0, Math.min(weekIndex, cal.weeks.length - 1));
		const week = cal.weeks[validIndex];
		setCurrentWeek(week);
		setCurrentWeekIndex(validIndex);
	};

	const handleSemesterChange = async (newSemester: string) => {
		if (!data.semesters || !data.mainForm || !data.signInToken) return;

		const { semesters, mainForm, signInToken } = data;
		const oldValue = semesters.currentSemester;

		if (newSemester === oldValue) return;

		setLoading(true);

		try {
			const updatedMainForm = { ...mainForm, drpSemester: newSemester };
			const updatedSemesters = { ...semesters, currentSemester: newSemester };

			setData((prev) => ({ ...prev, semesters: updatedSemesters }));

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

			setData((prev) => ({ ...prev, ...newData }));
			setCalendar(newCalendar as any);
			setStudent(newStudent);
			saveData(newData);

			updateCurrentWeek(0, newCalendar);
			showSuccess('Đã cập nhật học kỳ thành công!');
		} catch (error) {
			console.error('Semester change error:', error);
			showError('Có lỗi xảy ra khi lấy dữ liệu!');
			const revertedSemesters = { ...semesters, currentSemester: oldValue };
			setData((prev) => ({ ...prev, semesters: revertedSemesters }));
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		logout();
		authLogout();
		router.push('/login');
	};

	const handleExportCalendar = () => {
		if (student && calendar) {
			exportToGoogleCalendar(student, calendar);
			showSuccess('Đã xuất lịch thành công!');
		}
	};

	const getFilteredSubjects = () => {
		if (!currentWeek || !currentWeek.length) return [];

		let subjects: Subject[] = [];
		currentWeek.forEach((day: any) => {
			if (day.shift && day.shift.length > 0) {
				subjects = [...subjects, ...day.shift];
			}
		});

		if (selectedSession !== 'all') {
			subjects = subjects.filter((subject) => {
				const session = getShiftSession(subject.shift);
				return session === selectedSession;
			});
		}

		return subjects.sort((a, b) => {
			if (a.day !== b.day) return a.day - b.day;
			return a.shift - b.shift;
		});
	};

	if (!data.calendar) {
		return <PageLoader text="Đang tải thời khóa biểu..." />;
	}

	// Kiểm tra nếu không có dữ liệu môn học, tạo lịch trống
	const hasSubjects = data.calendar.data_subject && data.calendar.data_subject.length > 0;
	const hasWeeks = data.calendar.weeks && data.calendar.weeks.length > 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Thời khóa biểu</h1>
					<p className="text-muted-foreground">{student || user?.name || 'Sinh viên'}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={handleExportCalendar}
						variant="outline"
						size="sm"
						disabled={!student || !calendar || !calendar.data_subject?.length}
					>
						<Download className="w-4 h-4 mr-2" />
						Xuất Google Calendar
					</Button>
					<Button onClick={handleLogout} variant="outline" size="sm">
						<LogOut className="w-4 h-4 mr-2" />
						Đăng xuất
					</Button>
				</div>
			</div>

			{/* Controls */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						{/* Semester Selection */}
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">Học kỳ:</span>
							{data.semesters && data.semesters.semesters && (
								<Select
									value={data.semesters.currentSemester}
									onValueChange={handleSemesterChange}
									disabled={loading}
								>
									<SelectTrigger className="w-[200px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{data.semesters.semesters.map((semester: any) => (
											<SelectItem key={semester.value} value={semester.value}>
												{semester.th}_{semester.from}_{semester.to}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						{/* View Mode and Filters */}
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1 border rounded-md">
								<Button
									variant={viewMode === 'calendar' ? 'default' : 'ghost'}
									size="sm"
									onClick={() => setViewMode('calendar')}
								>
									<Grid3X3 className="w-4 h-4" />
								</Button>
								<Button
									variant={viewMode === 'list' ? 'default' : 'ghost'}
									size="sm"
									onClick={() => setViewMode('list')}
								>
									<List className="w-4 h-4" />
								</Button>
							</div>

							<Select value={selectedSession} onValueChange={setSelectedSession}>
								<SelectTrigger className="w-[140px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả</SelectItem>
									<SelectItem value="morning">Buổi sáng</SelectItem>
									<SelectItem value="afternoon">Buổi chiều</SelectItem>
									<SelectItem value="evening">Buổi tối</SelectItem>
								</SelectContent>
							</Select>
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

			{/* Week Navigation */}
			{(hasWeeks || (currentWeek && currentWeek.length > 0)) && (
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<Button
								variant="outline"
								size="sm"
								onClick={() => updateCurrentWeek(currentWeekIndex - 1)}
								disabled={!data.calendar.weeks || currentWeekIndex === 0}
							>
								<ChevronLeft className="w-4 h-4 mr-2" />
								Tuần trước
							</Button>

							<div className="text-center">
								<p className="font-medium">
									{data.calendar.weeks && data.calendar.weeks.length > 0 ? (
										<>
											Tuần {currentWeekIndex + 1} / {data.calendar.weeks.length}
										</>
									) : (
										<>Tuần hiện tại</>
									)}
								</p>
								{currentWeek && currentWeek.length > 0 && (
									<p className="text-sm text-muted-foreground">
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
							>
								Tuần sau
								<ChevronRight className="w-4 h-4 ml-2" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Calendar Content */}
			{viewMode === 'calendar' &&
				(currentWeek && currentWeek.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
						{currentWeek.map((day: any, dayIndex: number) => (
							<Card key={dayIndex} className="min-h-[200px]">
								<CardContent className="p-3">
									<div className="text-center mb-3">
										<p className="font-medium text-sm">{getDayName(new Date(day.time).getDay())}</p>
										<p className="text-xs text-muted-foreground">{formatDate(day.time, 'DD/MM')}</p>
									</div>
									<div className="space-y-2">
										{day.shift && day.shift.length > 0 ? (
											day.shift
												.filter((subject: any) => {
													if (selectedSession === 'all') return true;
													const session = getShiftSession(subject.shift);
													return session === selectedSession;
												})
												.map((subject: any, subjectIndex: number) => {
													const shiftTime = getShiftTime(subject.shift);
													const session = getShiftSession(subject.shift);
													return (
														<div
															key={subjectIndex}
															className="p-2 rounded-md border bg-card text-card-foreground text-xs"
														>
															<div className="flex items-center gap-1 mb-1">
																<Badge
																	variant={
																		session === 'morning'
																			? 'default'
																			: session === 'afternoon'
																				? 'secondary'
																				: 'outline'
																	}
																	className="text-xs px-1 py-0"
																>
																	Ca {subject.shift}
																</Badge>
																<span className="text-xs text-muted-foreground">
																	{shiftTime.start}
																</span>
															</div>
															<p className="font-medium text-xs mb-1 line-clamp-2">
																{subject.name}
															</p>
															<div className="flex items-center gap-1 text-xs text-muted-foreground">
																<MapPin className="w-3 h-3" />
																<span className="truncate">{subject.room}</span>
															</div>
														</div>
													);
												})
										) : (
											<p className="text-xs text-muted-foreground text-center py-4">
												Không có lịch học
											</p>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<EmptyState
						icon={CalendarIcon}
						title="Không có dữ liệu lịch học"
						description="Học kỳ này chưa có lịch học hoặc chưa được cập nhật."
					/>
				))}

			{/* List View */}
			{viewMode === 'list' && (
				<Card>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Thời gian</TableHead>
									<TableHead>Môn học</TableHead>
									<TableHead>Phòng</TableHead>
									<TableHead>Giảng viên</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{getFilteredSubjects().map((subject: any, index: number) => {
									const shiftTime = getShiftTime(subject.shift);
									return (
										<TableRow key={index}>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium">
														{getDayName(subject.day)} - Ca {subject.shift}
													</span>
													<span className="text-sm text-muted-foreground">
														{shiftTime.start} - {shiftTime.end}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<BookOpen className="w-4 h-4" />
													<span className="font-medium">{subject.name}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<MapPin className="w-4 h-4" />
													<span>{subject.room}</span>
												</div>
											</TableCell>
											<TableCell>{subject.instructor || 'N/A'}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
						{getFilteredSubjects().length === 0 && (
							<div className="p-8 text-center">
								<EmptyState
									icon={CalendarIcon}
									title="Không có lịch học"
									description={
										hasSubjects
											? 'Không có lịch học nào trong tuần này với bộ lọc đã chọn.'
											: 'Học kỳ này chưa có lịch học hoặc chưa được cập nhật.'
									}
								/>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
