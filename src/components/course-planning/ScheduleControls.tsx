'use client';

import React, { useState, useEffect } from 'react';
import {
	Wand2,
	Sun,
	Sunset,
	Moon,
	RotateCcw,
	Calendar,
	AlertTriangle,
	CheckCircle,
	ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';
import { AutoMode } from '@/types/course-planning';

const AUTO_MODES: { value: AutoMode; label: string; description: string; icon: React.ReactNode }[] =
	[
		{
			value: 'refer-non-overlap',
			label: 'Tối ưu tổng thể',
			description: 'Tìm lịch học với ít xung đột nhất',
			icon: <Calendar className="h-4 w-4" />
		},
		{
			value: 'refer-non-overlap-morning',
			label: 'Ưu tiên buổi sáng',
			description: 'Tối ưu lịch học buổi sáng (tiết 1-6)',
			icon: <Sun className="h-4 w-4" />
		},
		{
			value: 'refer-non-overlap-afternoon',
			label: 'Ưu tiên buổi chiều',
			description: 'Tối ưu lịch học buổi chiều (tiết 7-12)',
			icon: <Sunset className="h-4 w-4" />
		},
		{
			value: 'refer-non-overlap-evening',
			label: 'Ưu tiên buổi tối',
			description: 'Tối ưu lịch học buổi tối (tiết 13-16)',
			icon: <Moon className="h-4 w-4" />
		}
	];

// Step component for the wizard
interface StepProps {
	stepNumber: number;
	title: string;
	description: string;
	isActive: boolean;
	isCompleted: boolean;
	children: React.ReactNode;
}

function Step({ stepNumber, title, description, isActive, isCompleted, children }: StepProps) {
	return (
		<Card className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
							isCompleted
								? 'bg-green-500 text-white'
								: isActive
									? 'bg-primary text-primary-foreground'
									: 'bg-muted text-muted-foreground'
						}`}
					>
						{isCompleted ? <CheckCircle className="h-4 w-4" /> : stepNumber}
					</div>
					<div>
						<CardTitle className="text-lg">{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
				</div>
			</CardHeader>
			{(isActive || isCompleted) && <CardContent>{children}</CardContent>}
		</Card>
	);
}

export function ScheduleControls() {
	const { state, generateSchedule, getCalendarTableData } = useCoursePlanning();
	const [selectedMode, setSelectedMode] = useState<AutoMode>('refer-non-overlap');
	const [currentStep, setCurrentStep] = useState(1);

	const getSelectedSubjectsCount = () => {
		return Object.values(state.selectedClasses).reduce(
			(total, majorData) =>
				total + Object.values(majorData).filter((subject) => subject.show).length,
			0
		);
	};

	const getSelectedClassesCount = () => {
		return Object.values(state.selectedClasses).reduce(
			(total, majorData) =>
				total + Object.values(majorData).filter((subject) => subject.show && subject.class).length,
			0
		);
	};

	const handleGenerateSchedule = async () => {
		setCurrentStep(3);
		await generateSchedule(selectedMode);
	};

	const selectedSubjectsCount = getSelectedSubjectsCount();
	const selectedClassesCount = getSelectedClassesCount();
	const calendarData = getCalendarTableData();
	const hasConflicts = calendarData && calendarData.totalConflictedSessions > 0;

	const canGenerate = state.calendar && selectedSubjectsCount > 0;
	const hasIncompleteSelection = selectedSubjectsCount > selectedClassesCount;

	// Auto-advance steps
	useEffect(() => {
		if (selectedSubjectsCount > 0 && currentStep === 1) {
			setCurrentStep(2);
		}
	}, [selectedSubjectsCount, currentStep]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wand2 className="h-5 w-5" />
						Tạo lịch học tự động
					</CardTitle>
					<CardDescription>
						Làm theo các bước dưới đây để tạo lịch học tối ưu từ các môn đã chọn
					</CardDescription>
				</CardHeader>
			</Card>

			{/* Step 1: Review Selected Subjects */}
			<Step
				stepNumber={1}
				title="Kiểm tra môn học đã chọn"
				description="Xem lại danh sách môn học và lớp học đã chọn"
				isActive={currentStep === 1}
				isCompleted={selectedSubjectsCount > 0}
			>
				<div className="space-y-4">
					<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
						<div className="flex items-center gap-2">
							<Badge variant="outline">{selectedSubjectsCount} môn đã chọn</Badge>
							<Badge
								variant={selectedClassesCount === selectedSubjectsCount ? 'default' : 'secondary'}
							>
								{selectedClassesCount} lớp đã chọn
							</Badge>
						</div>
					</div>

					{hasIncompleteSelection && (
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								Một số môn học chưa được chọn lớp. Hệ thống sẽ tự động chọn lớp tối ưu cho các môn
								này.
							</AlertDescription>
						</Alert>
					)}

					{selectedSubjectsCount === 0 && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								Vui lòng quay lại tab &quot;Chọn môn&quot; để chọn ít nhất một môn học.
							</AlertDescription>
						</Alert>
					)}

					{selectedSubjectsCount > 0 && (
						<div className="flex justify-end">
							<Button onClick={() => setCurrentStep(2)} className="flex items-center gap-2">
								Tiếp tục
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			</Step>

			{/* Step 2: Choose Optimization Mode */}
			<Step
				stepNumber={2}
				title="Chọn chế độ tối ưu hóa"
				description="Chọn cách thức tối ưu hóa lịch học phù hợp với nhu cầu của bạn"
				isActive={currentStep === 2}
				isCompleted={currentStep > 2}
			>
				<div className="space-y-4">
					<div className="grid gap-3">
						{AUTO_MODES.map((mode) => (
							<Card
								key={mode.value}
								className={`cursor-pointer transition-all ${
									selectedMode === mode.value
										? 'ring-2 ring-primary bg-primary/5'
										: 'hover:bg-muted/50'
								}`}
								onClick={() => setSelectedMode(mode.value)}
							>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<input
												type="radio"
												checked={selectedMode === mode.value}
												onChange={() => setSelectedMode(mode.value)}
												className="text-primary"
											/>
											{mode.icon}
										</div>
										<div className="flex-1">
											<h4 className="font-medium">{mode.label}</h4>
											<p className="text-sm text-muted-foreground">{mode.description}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="flex justify-between">
						<Button variant="outline" onClick={() => setCurrentStep(1)}>
							Quay lại
						</Button>
						<Button
							onClick={handleGenerateSchedule}
							disabled={!canGenerate || state.loading}
							className="flex items-center gap-2"
						>
							{state.loading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
									Đang tạo lịch...
								</>
							) : (
								<>
									<Wand2 className="h-4 w-4" />
									Tạo lịch tự động
								</>
							)}
						</Button>
					</div>
				</div>
			</Step>

			{/* Step 3: Results */}
			<Step
				stepNumber={3}
				title="Kết quả tạo lịch"
				description="Xem kết quả và tùy chọn tìm giải pháp khác"
				isActive={currentStep === 3}
				isCompleted={state.autoTh >= 0 && !state.loading}
			>
				<div className="space-y-4">
					{state.autoTh >= 0 && !state.loading && (
						<>
							<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										Giải pháp #{state.autoTh + 1}
									</Badge>
									{hasConflicts ? (
										<Badge variant="destructive" className="flex items-center gap-1">
											<AlertTriangle className="h-3 w-3" />
											{calendarData.totalConflictedSessions} tiết trùng
										</Badge>
									) : (
										<Badge variant="default" className="flex items-center gap-1">
											<CheckCircle className="h-3 w-3" />
											Không có xung đột
										</Badge>
									)}
								</div>
							</div>

							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={handleGenerateSchedule}
									disabled={state.loading}
									className="flex items-center gap-2"
								>
									<RotateCcw className="h-4 w-4" />
									Tìm giải pháp khác
								</Button>
								<Button onClick={() => setCurrentStep(2)} variant="outline">
									Thay đổi chế độ tối ưu
								</Button>
							</div>
						</>
					)}

					{state.loading && (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">Đang tạo lịch học tối ưu...</p>
						</div>
					)}
				</div>
			</Step>
		</div>
	);
}
