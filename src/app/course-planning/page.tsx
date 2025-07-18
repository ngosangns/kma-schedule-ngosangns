'use client';

import React, { useState } from 'react';
import { BookOpen, Upload, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/course-planning/FileUpload';
import { SubjectSelection } from '@/components/course-planning/SubjectSelection';
import { ScheduleCalendar } from '@/components/course-planning/ScheduleCalendar';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';

export default function CoursePlanningPage() {
	const { state } = useCoursePlanning();
	const [activeTab, setActiveTab] = useState('upload');

	// Auto-advance tabs based on progress
	React.useEffect(() => {
		if (state.calendar && activeTab === 'upload') {
			setActiveTab('subjects');
		}
	}, [state.calendar, activeTab]);

	const hasSelectedSubjects = Object.values(state.selectedClasses).some((majorData) =>
		Object.values(majorData).some((subject) => subject.show)
	);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b bg-card">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link href="/calendar">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Quay lại
								</Button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold flex items-center gap-2">
									<BookOpen className="h-6 w-6" />
									Lập lịch tín chỉ
								</h1>
								<p className="text-muted-foreground">
									Tạo lịch học tối ưu từ file Excel môn học tín chỉ
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					{/* Tab Navigation */}
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="upload" className="flex items-center gap-2">
							<Upload className="h-4 w-4" />
							<span className="hidden sm:inline">Tải file</span>
						</TabsTrigger>
						<TabsTrigger
							value="subjects"
							disabled={!state.calendar}
							className="flex items-center gap-2"
						>
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
						{/* Upload Tab */}
						<TabsContent value="upload" className="space-y-6">
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
						</TabsContent>

						{/* Subjects Tab */}
						<TabsContent value="subjects" className="space-y-6">
							<SubjectSelection onContinue={() => setActiveTab('calendar')} />
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
