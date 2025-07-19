'use client';

import React, { useState } from 'react';
import { BookOpen, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { FileUpload } from '@/components/course-planning/FileUpload';
import { SubjectSelection } from '@/components/course-planning/SubjectSelection';
import { ScheduleCalendar } from '@/components/course-planning/ScheduleCalendar';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';

export default function CoursePlanningPage() {
	const { state, clearStoredData } = useCoursePlanning();
	const [activeTab, setActiveTab] = useState('subjects');
	const [isInitialLoading, setIsInitialLoading] = useState(true);

	// Check for initial loading
	React.useEffect(() => {
		// Simulate loading time for better UX
		setTimeout(() => {
			setIsInitialLoading(false);
		}, 500);
	}, []);

	// Auto-advance tabs based on progress
	React.useEffect(() => {
		if (!state.calendar && activeTab === 'calendar') {
			setActiveTab('subjects');
		}
	}, [state.calendar, activeTab]);

	const handleClearData = React.useCallback(() => {
		clearStoredData();
		setActiveTab('subjects');
	}, [clearStoredData]);

	const hasSelectedSubjects = Object.values(state.selectedClasses).some((majorData) =>
		Object.values(majorData).some((subject) => subject.show)
	);

	// Calculate stats for quick stats display
	const getStats = () => {
		if (!state.calendar) return null;

		const totalMajors = Object.keys(state.calendar.majors).length;
		const selectedSubjectsCount = Object.values(state.selectedClasses).reduce(
			(total, majorData) =>
				total + Object.values(majorData).filter((subject) => subject.show).length,
			0
		);
		const selectedClassesCount = Object.values(state.selectedClasses).reduce(
			(total, majorData) =>
				total + Object.values(majorData).filter((subject) => subject.show && subject.class).length,
			0
		);

		return {
			totalMajors,
			selectedSubjectsCount,
			selectedClassesCount
		};
	};

	const stats = getStats();

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Lập lịch tín chỉ</h1>
						<p className="text-muted-foreground">
							Tạo lịch học tối ưu từ file Excel môn học tín chỉ
						</p>
					</div>
					{state.calendar && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">Xóa tất cả dữ liệu</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Xác nhận xóa dữ liệu</AlertDialogTitle>
									<AlertDialogDescription>
										Bạn có chắc chắn muốn xóa tất cả dữ liệu lập lịch? Hành động này không thể hoàn
										tác.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Hủy</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleClearData}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Xóa dữ liệu
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>

				{/* Quick Stats */}
				{stats && stats.selectedSubjectsCount > 0 && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold">{stats.totalMajors}</div>
								<div className="text-sm text-muted-foreground">Ngành học</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600">
									{stats.selectedSubjectsCount}
								</div>
								<div className="text-sm text-muted-foreground">Môn đã chọn</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600">
									{stats.selectedClassesCount}
								</div>
								<div className="text-sm text-muted-foreground">Lớp đã chọn</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-purple-600">
									{stats.selectedClassesCount === stats.selectedSubjectsCount ? '✓' : '⚠'}
								</div>
								<div className="text-sm text-muted-foreground">Trạng thái</div>
							</div>
						</Card>
					</div>
				)}
			</div>

			{/* Main Content */}
			{isInitialLoading ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<LoadingSpinner size="lg" text="Đang tải dữ liệu lập lịch..." />
				</div>
			) : (
				<div className="space-y-6">
					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
						{/* Tab Navigation */}
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="subjects" className="flex items-center gap-2">
								<BookOpen className="h-4 w-4" />
								<span className="hidden sm:inline">Chọn môn & Tạo lịch</span>
							</TabsTrigger>
							<TabsTrigger
								value="calendar"
								disabled={!hasSelectedSubjects}
								className="flex items-center gap-2"
							>
								<Calendar className="h-4 w-4" />
								<span className="hidden sm:inline">Xem lịch</span>
							</TabsTrigger>
						</TabsList>

						{/* Tab Content */}
						<div className="space-y-6">
							{/* Subjects Tab */}
							<TabsContent value="subjects" className="space-y-6">
								{!state.calendar ? (
									<div className="max-w-4xl mx-auto">
										<FileUpload onSuccess={() => setActiveTab('subjects')} />

										{/* Instructions */}
										<Card className="mt-6">
											<CardHeader>
												<CardTitle>Hướng dẫn sử dụng</CardTitle>
												<CardDescription>Các bước để tạo lịch học tối ưu</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid gap-4 md:grid-cols-2">
													<div className="space-y-2">
														<h4 className="font-medium flex items-center gap-2">
															<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
																1
															</div>
															Tải lên file Excel
														</h4>
														<p className="text-sm text-muted-foreground ml-8">
															Tải lên file Excel chứa thông tin các môn học và lớp học từ trường
														</p>
													</div>
													<div className="space-y-2">
														<h4 className="font-medium flex items-center gap-2">
															<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
																2
															</div>
															Chọn môn học
														</h4>
														<p className="text-sm text-muted-foreground ml-8">
															Chọn các môn học bạn muốn đăng ký và lớp học tương ứng
														</p>
													</div>
													<div className="space-y-2">
														<h4 className="font-medium flex items-center gap-2">
															<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
																3
															</div>
															Tạo lịch tự động
														</h4>
														<p className="text-sm text-muted-foreground ml-8">
															Sử dụng thuật toán tối ưu để tạo lịch học không xung đột
														</p>
													</div>
													<div className="space-y-2">
														<h4 className="font-medium flex items-center gap-2">
															<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
																4
															</div>
															Xem và xuất lịch
														</h4>
														<p className="text-sm text-muted-foreground ml-8">
															Xem lịch học đã tạo và có thể in hoặc lưu lại
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									</div>
								) : (
									<SubjectSelection onContinue={() => setActiveTab('calendar')} />
								)}
							</TabsContent>

							{/* Calendar Tab */}
							<TabsContent value="calendar" className="space-y-6">
								<ScheduleCalendar />
							</TabsContent>
						</div>
					</Tabs>
				</div>
			)}
		</div>
	);
}
