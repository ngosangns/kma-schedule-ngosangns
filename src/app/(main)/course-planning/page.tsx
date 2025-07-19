'use client';

import React, { useState } from 'react';
import { BookOpen, Calendar, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { loadCoursePlanningData } from '@/lib/ts/storage';

export default function CoursePlanningPage() {
	const { state, clearStoredData } = useCoursePlanning();
	const [activeTab, setActiveTab] = useState('subjects');
	const [hasStoredData, setHasStoredData] = useState(false);

	// Check for stored data on mount
	React.useEffect(() => {
		const storedData = loadCoursePlanningData();
		setHasStoredData(storedData?.calendar !== null);
	}, []);

	// Auto-advance tabs based on progress
	React.useEffect(() => {
		if (!state.calendar && activeTab === 'calendar') {
			setActiveTab('subjects');
		}
	}, [state.calendar, activeTab]);

	const handleClearData = React.useCallback(() => {
		clearStoredData();
		setHasStoredData(false);
		setActiveTab('subjects');
	}, [clearStoredData]);

	const hasSelectedSubjects = Object.values(state.selectedClasses).some((majorData) =>
		Object.values(majorData).some((subject) => subject.show)
	);

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="text-center space-y-2">
				<div className="flex items-center justify-center gap-4">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<BookOpen className="h-8 w-8" />
						Lập lịch tín chỉ
					</h1>
					{hasStoredData && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Xóa dữ liệu
								</Button>
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
				<p className="text-muted-foreground">Tạo lịch học tối ưu từ file Excel môn học tín chỉ</p>
			</div>

			{/* Main Content */}
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
		</div>
	);
}
