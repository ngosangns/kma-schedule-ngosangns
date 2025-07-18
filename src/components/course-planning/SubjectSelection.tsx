'use client';

import React, { useState, useEffect } from 'react';
import {
	BookOpen,
	Users,
	Clock,
	CheckCircle2,
	Circle,
	Wand2,
	Sun,
	Sunset,
	Moon,
	RotateCcw,
	Calendar,
	AlertTriangle,
	ChevronDown,
	ChevronRight,
	ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';
import { Field, AutoMode, ClassData } from '@/types/course-planning';

// Type for subject data (Record of class code to ClassData)
type SubjectData = Record<string, ClassData>;

// AUTO_MODES configuration
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

// SubjectCard component for individual subjects
interface SubjectCardProps {
	majorKey: string;
	subjectName: string;
	subjectData: SubjectData;
	isSelected: boolean;
	selectedClass: string | null;
	onToggleSubject: (checked: boolean) => void;
	onSelectClass: (classCode: string) => void;
	onCardClick: () => void;
	isActive: boolean;
}

function SubjectCard({
	majorKey: _majorKey,
	subjectName,
	subjectData,
	isSelected,
	selectedClass,
	onToggleSubject,
	onSelectClass: _onSelectClass,
	onCardClick,
	isActive
}: SubjectCardProps) {
	const totalClasses = Object.keys(subjectData).length;
	const firstClass = Object.values(subjectData)[0];
	const teacher = firstClass?.[Field.Teacher] || 'N/A';

	const handleCardClick = () => {
		onToggleSubject(!isSelected);
		if (!isSelected) {
			onCardClick();
		}
	};

	return (
		<Card
			className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
				isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'
			} ${isActive ? 'ring-2 ring-blue-500' : ''}`}
			onClick={handleCardClick}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-start gap-3 flex-1">
						<div className="mt-1">
							{isSelected ? (
								<CheckCircle2 className="h-5 w-5 text-primary" />
							) : (
								<Circle className="h-5 w-5 text-muted-foreground" />
							)}
						</div>
						<div className="flex-1 space-y-2">
							<h4 className="font-medium text-sm leading-tight">{subjectName}</h4>
							<div className="flex items-center gap-3 text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									{totalClasses} lớp
								</span>
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									GV: {teacher}
								</span>
							</div>
							{isSelected && selectedClass && (
								<Badge variant="secondary" className="text-xs">
									Lớp: {selectedClass}
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// MajorSection component to group subjects by major
interface MajorSectionProps {
	majorKey: string;
	subjects: Array<{
		majorKey: string;
		subjectName: string;
		subjectData: SubjectData;
		isSelected: boolean;
		selectedClass: string | null;
		totalClasses: number;
	}>;
	onToggleSubject: (majorKey: string, subjectName: string, checked: boolean) => void;
	onSelectAllMajor: (majorKey: string) => void;
	onSubjectClick: () => void;
	isExpanded: boolean;
	onToggleExpanded: (majorKey: string) => void;
}

function MajorSection({
	majorKey,
	subjects,
	onToggleSubject,
	onSelectAllMajor,
	onSubjectClick,
	isExpanded,
	onToggleExpanded
}: MajorSectionProps) {
	const selectedCount = subjects.filter((s) => s.isSelected).length;
	const totalCount = subjects.length;
	const allSelected = selectedCount === totalCount;

	return (
		<Card>
			<Collapsible open={isExpanded} onOpenChange={() => onToggleExpanded(majorKey)}>
				<CollapsibleTrigger asChild>
					<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								{isExpanded ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
								<div>
									<CardTitle className="text-lg">{majorKey}</CardTitle>
									<CardDescription>
										{selectedCount}/{totalCount} môn đã chọn
									</CardDescription>
								</div>
							</div>
							<Button
								variant={allSelected ? 'default' : 'outline'}
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									onSelectAllMajor(majorKey);
								}}
								className="flex items-center gap-2"
							>
								{allSelected ? (
									<>
										<CheckCircle2 className="h-4 w-4" />
										Bỏ chọn tất cả
									</>
								) : (
									<>
										<Circle className="h-4 w-4" />
										Chọn tất cả
									</>
								)}
							</Button>
						</div>
					</CardHeader>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent className="pt-4">
						<div className="grid gap-3 sm:grid-cols-2">
							{subjects.map((subject) => (
								<SubjectCard
									key={`${subject.majorKey}-${subject.subjectName}`}
									majorKey={subject.majorKey}
									subjectName={subject.subjectName}
									subjectData={subject.subjectData}
									isSelected={subject.isSelected}
									selectedClass={subject.selectedClass}
									onToggleSubject={(checked) =>
										onToggleSubject(subject.majorKey, subject.subjectName, checked)
									}
									onSelectClass={() => {}}
									onCardClick={onSubjectClick}
									isActive={false}
								/>
							))}
						</div>
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	);
}

// ScheduleWizard component for schedule generation
interface ScheduleWizardProps {
	selectedSubjectsCount: number;
	selectedClassesCount: number;
	onGenerateSchedule: (mode: AutoMode) => void;
	isLoading: boolean;
	autoTh: number;
	hasConflicts: boolean;
	conflictCount: number;
	onContinue: () => void;
}

function ScheduleWizard({
	selectedSubjectsCount,
	selectedClassesCount,
	onGenerateSchedule,
	isLoading,
	autoTh,
	hasConflicts,
	conflictCount,
	onContinue
}: ScheduleWizardProps) {
	const [selectedMode, setSelectedMode] = useState<AutoMode>('refer-non-overlap');
	const [currentStep, setCurrentStep] = useState(1);

	const canGenerate = selectedSubjectsCount > 0;
	const hasIncompleteSelection = selectedSubjectsCount > selectedClassesCount;

	// Auto-advance steps
	useEffect(() => {
		if (selectedSubjectsCount > 0 && currentStep === 1) {
			setCurrentStep(2);
		}
	}, [selectedSubjectsCount, currentStep]);

	const handleGenerateSchedule = () => {
		onGenerateSchedule(selectedMode);
	};

	if (selectedSubjectsCount === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wand2 className="h-5 w-5" />
						Tạo lịch học tự động
					</CardTitle>
					<CardDescription>Chọn ít nhất một môn học để bắt đầu tạo lịch</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wand2 className="h-5 w-5" />
					Tạo lịch học tự động
				</CardTitle>
				<CardDescription>{selectedSubjectsCount} môn đã chọn</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Summary */}
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="outline">{selectedSubjectsCount} môn</Badge>
						<Badge
							variant={selectedClassesCount === selectedSubjectsCount ? 'default' : 'secondary'}
						>
							{selectedClassesCount} lớp
						</Badge>
					</div>
					{autoTh >= 0 && (
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								Giải pháp #{autoTh + 1}
							</Badge>
							{hasConflicts ? (
								<Badge variant="destructive" className="flex items-center gap-1">
									<AlertTriangle className="h-3 w-3" />
									{conflictCount} tiết trùng
								</Badge>
							) : (
								<Badge variant="default" className="flex items-center gap-1">
									<CheckCircle2 className="h-3 w-3" />
									Không xung đột
								</Badge>
							)}
						</div>
					)}
				</div>

				{/* Warnings */}
				{hasIncompleteSelection && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription className="text-xs">
							Hệ thống sẽ tự động chọn lớp cho các môn chưa chọn lớp.
						</AlertDescription>
					</Alert>
				)}

				{/* Mode Selection */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Chế độ tối ưu:</label>
					<Select value={selectedMode} onValueChange={(value: AutoMode) => setSelectedMode(value)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="start">
							{AUTO_MODES.map((mode) => (
								<SelectItem key={mode.value} value={mode.value}>
									<div className="flex items-center gap-2 text-left">
										<div className="flex-shrink-0">{mode.icon}</div>
										<div className="text-left">
											<div className="font-medium text-left">{mode.label}</div>
											<div className="text-xs text-muted-foreground text-left">
												{mode.description}
											</div>
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Action Buttons */}
				<div className="space-y-2">
					<Button
						onClick={handleGenerateSchedule}
						disabled={!canGenerate || isLoading}
						className="w-full"
					>
						{isLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
								Đang tạo lịch...
							</>
						) : autoTh >= 0 ? (
							<>
								<RotateCcw className="h-4 w-4 mr-2" />
								Tìm giải pháp khác
							</>
						) : (
							<>
								<Wand2 className="h-4 w-4 mr-2" />
								Tạo lịch tự động
							</>
						)}
					</Button>

					<Button onClick={onContinue} variant="outline" className="w-full">
						<ArrowRight className="h-4 w-4 mr-2" />
						Tiếp tục
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// SubjectSummary component for the sidebar
interface SubjectSummaryProps {
	selectedSubjects: Array<{
		majorKey: string;
		subjectName: string;
		selectedClass: string | null;
		totalClasses: number;
		subjectData: SubjectData;
	}>;
	onClassSelect: (majorKey: string, subjectName: string, classCode: string) => void;
}

function SubjectSummary({ selectedSubjects, onClassSelect }: SubjectSummaryProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BookOpen className="h-5 w-5" />
					Môn đã chọn
				</CardTitle>
				<CardDescription>{selectedSubjects.length} môn học</CardDescription>
			</CardHeader>
			<CardContent>
				{selectedSubjects.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-8">
						Chưa có môn học nào được chọn
					</p>
				) : (
					<div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
						{selectedSubjects.map(({ majorKey, subjectName, selectedClass, subjectData }) => {
							const availableClasses = Object.keys(subjectData);

							return (
								<div
									key={`${majorKey}-${subjectName}`}
									className="p-3 rounded-lg border bg-muted/30 space-y-2"
								>
									{/* Subject Info */}
									<div>
										<h5 className="font-medium text-sm truncate" title={subjectName}>
											{subjectName}
										</h5>
										<p className="text-xs text-muted-foreground">{majorKey}</p>
									</div>

									{/* Class Selection */}
									<Select
										value={selectedClass || ''}
										onValueChange={(value) => onClassSelect(majorKey, subjectName, value)}
									>
										<SelectTrigger className="h-8 text-xs">
											<SelectValue placeholder="Chọn lớp" />
										</SelectTrigger>
										<SelectContent>
											{availableClasses.map((classCode) => {
												const classData = subjectData[classCode];
												const teacher = classData?.[Field.Teacher] || 'N/A';

												return (
													<SelectItem key={classCode} value={classCode}>
														<div className="flex items-center justify-between w-full">
															<span className="font-medium">{classCode}</span>
															<span className="text-xs text-muted-foreground ml-2 truncate">
																{teacher}
															</span>
														</div>
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface SubjectSelectionProps {
	onContinue?: () => void;
}

export function SubjectSelection({ onContinue }: SubjectSelectionProps = {}) {
	const {
		state,
		updateSelectedClass,
		updateShowSubject,
		selectMajor,
		generateSchedule,
		getCalendarTableData
	} = useCoursePlanning();

	// Persistent state
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedMajor, setSelectedMajor] = useState<string>('all');
	const [expandedMajors, setExpandedMajors] = useState<Set<string>>(new Set());
	const [isMainSectionExpanded, setIsMainSectionExpanded] = useState(false);

	if (!state.calendar) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>Vui lòng tải lên file Excel để bắt đầu chọn môn học</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Get all subjects from all majors
	const allSubjects = Object.entries(state.calendar.majors).flatMap(([majorKey, majorData]) =>
		Object.entries(majorData).map(([subjectName, subjectData]) => ({
			majorKey,
			subjectName,
			subjectData,
			isSelected: state.selectedClasses[majorKey]?.[subjectName]?.show || false,
			selectedClass: state.selectedClasses[majorKey]?.[subjectName]?.class || null,
			totalClasses: Object.keys(subjectData).length
		}))
	);

	// Filter subjects based on search and major selection
	const filteredSubjects = allSubjects.filter((subject) => {
		const matchesSearch =
			subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			subject.majorKey.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesMajor = selectedMajor === 'all' || subject.majorKey === selectedMajor;
		return matchesSearch && matchesMajor;
	});

	// Get selected subjects for summary (with subjectData included)
	const selectedSubjects = allSubjects
		.filter((subject) => subject.isSelected)
		.map((subject) => ({
			majorKey: subject.majorKey,
			subjectName: subject.subjectName,
			selectedClass: subject.selectedClass,
			totalClasses: subject.totalClasses,
			subjectData: subject.subjectData
		}));

	// Get unique majors for filter
	const majors = Array.from(new Set(allSubjects.map((s) => s.majorKey)));

	const handleSubjectToggle = (majorKey: string, subjectName: string, checked: boolean) => {
		updateShowSubject(majorKey, subjectName, checked);
	};

	const handleClassSelect = (majorKey: string, subjectName: string, classCode: string) => {
		updateSelectedClass(majorKey, subjectName, classCode);
	};

	const handleSubjectClick = () => {
		// No longer needed since we removed activeSubject functionality
	};

	const handleSelectAllMajor = (majorKey: string) => {
		// Check if all subjects in this major are already selected
		const majorSubjects = allSubjects.filter((s) => s.majorKey === majorKey);
		const selectedCount = majorSubjects.filter((s) => s.isSelected).length;
		const allSelected = selectedCount === majorSubjects.length;

		// If all selected, deselect all; otherwise select all
		selectMajor(majorKey, !allSelected);
	};

	const handleGenerateSchedule = async (mode: AutoMode) => {
		await generateSchedule(mode);
	};

	const handleToggleExpanded = (majorKey: string) => {
		const newExpanded = new Set(expandedMajors);
		if (newExpanded.has(majorKey)) {
			newExpanded.delete(majorKey);
		} else {
			newExpanded.add(majorKey);
		}
		setExpandedMajors(newExpanded);
	};

	const handleContinue = () => {
		if (onContinue) {
			onContinue();
		} else {
			console.log('Continue to calendar view');
		}
	};

	// Get schedule data for wizard
	const calendarData = getCalendarTableData();
	const hasConflicts = calendarData && calendarData.totalConflictedSessions > 0;
	const conflictCount = calendarData?.totalConflictedSessions || 0;

	// Group subjects by major
	const subjectsByMajor = majors.reduce(
		(acc, majorKey) => {
			acc[majorKey] = allSubjects.filter((s) => s.majorKey === majorKey);
			return acc;
		},
		{} as Record<string, typeof allSubjects>
	);

	return (
		<div className="space-y-6">
			{/* Header and Search */}
			<Card>
				<Collapsible open={isMainSectionExpanded} onOpenChange={setIsMainSectionExpanded}>
					<CollapsibleTrigger asChild>
						<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									{isMainSectionExpanded ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
									<div>
										<CardTitle className="flex items-center gap-2">
											<BookOpen className="h-5 w-5" />
											Chọn môn học và tạo lịch
										</CardTitle>
										<CardDescription>
											Chọn các môn học bạn muốn đăng ký, sau đó tạo lịch học tối ưu.
										</CardDescription>
									</div>
								</div>
								<div className="flex gap-4 text-sm text-muted-foreground">
									<span>Tổng: {filteredSubjects.length} môn</span>
									<span>Đã chọn: {selectedSubjects.length} môn</span>
								</div>
							</div>
						</CardHeader>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<CardContent className="space-y-4 pt-4">
							{/* Search and Filter */}
							<div className="flex gap-4">
								<div className="flex-1">
									<Input
										placeholder="Tìm kiếm môn học..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full"
									/>
								</div>
								<Select value={selectedMajor} onValueChange={setSelectedMajor}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Chọn chuyên ngành" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tất cả chuyên ngành</SelectItem>
										{majors.map((major) => (
											<SelectItem key={major} value={major}>
												{major}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Subjects by Major */}
							<div className="space-y-4">
								{selectedMajor === 'all' ? (
									// Show all majors with their subjects
									majors.map((majorKey) => {
										const majorSubjects = (subjectsByMajor[majorKey] || []).filter((subject) => {
											const matchesSearch = subject.subjectName
												.toLowerCase()
												.includes(searchTerm.toLowerCase());
											return matchesSearch;
										});

										if (majorSubjects.length === 0) return null;

										return (
											<MajorSection
												key={majorKey}
												majorKey={majorKey}
												subjects={majorSubjects}
												onToggleSubject={handleSubjectToggle}
												onSelectAllMajor={handleSelectAllMajor}
												onSubjectClick={handleSubjectClick}
												isExpanded={expandedMajors.has(majorKey)}
												onToggleExpanded={handleToggleExpanded}
											/>
										);
									})
								) : (
									// Show only selected major
									<MajorSection
										majorKey={selectedMajor}
										subjects={filteredSubjects}
										onToggleSubject={handleSubjectToggle}
										onSelectAllMajor={handleSelectAllMajor}
										onSubjectClick={handleSubjectClick}
										isExpanded={expandedMajors.has(selectedMajor)}
										onToggleExpanded={handleToggleExpanded}
									/>
								)}

								{filteredSubjects.length === 0 && (
									<Card>
										<CardContent className="p-8">
											<div className="text-center text-muted-foreground">
												<BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
												<p>Không tìm thấy môn học nào phù hợp</p>
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</CardContent>
					</CollapsibleContent>
				</Collapsible>
			</Card>

			{/* Selected Subjects Summary */}
			<SubjectSummary selectedSubjects={selectedSubjects} onClassSelect={handleClassSelect} />

			{/* Schedule Generation Wizard */}
			<ScheduleWizard
				selectedSubjectsCount={selectedSubjects.length}
				selectedClassesCount={selectedSubjects.filter((s) => s.selectedClass).length}
				onGenerateSchedule={handleGenerateSchedule}
				isLoading={state.loading || false}
				autoTh={state.autoTh}
				hasConflicts={hasConflicts || false}
				conflictCount={conflictCount}
				onContinue={handleContinue}
			/>
		</div>
	);
}
