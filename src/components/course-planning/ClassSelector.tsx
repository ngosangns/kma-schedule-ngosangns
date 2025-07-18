'use client';

import React from 'react';
import { Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';
import { Field } from '@/types/course-planning';

interface ClassSelectorProps {
	majorKey: string;
	subjectName: string;
	onClassSelect: (majorKey: string, subjectName: string, classCode: string) => void;
}

export function ClassSelector({ majorKey, subjectName, onClassSelect }: ClassSelectorProps) {
	const { state } = useCoursePlanning();

	if (!state.calendar) return null;

	const subjectData = state.calendar.majors[majorKey]?.[subjectName];
	if (!subjectData) return null;

	const selectedClass = state.selectedClasses[majorKey]?.[subjectName]?.class;
	const availableClasses = Object.keys(subjectData);

	const handleClassSelect = (classCode: string) => {
		onClassSelect(majorKey, subjectName, classCode);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Chi tiết lớp học</CardTitle>
				<CardDescription>
					{subjectName} - {majorKey}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Class Selection */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Chọn lớp học</label>
					<Select value={selectedClass || ''} onValueChange={handleClassSelect}>
						<SelectTrigger>
							<SelectValue placeholder="Chọn lớp học" />
						</SelectTrigger>
						<SelectContent>
							{availableClasses.map((classCode) => {
								const classData = subjectData[classCode];
								if (!classData) return null;
								const scheduleCount = classData.schedules.length;
								const teacher = classData[Field.Teacher] || 'N/A';

								return (
									<SelectItem key={classCode} value={classCode}>
										<div className="flex items-center justify-between w-full">
											<div>
												<div className="font-medium">{classCode}</div>
												<div className="text-xs text-muted-foreground">GV: {teacher}</div>
											</div>
											<div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
												<Clock className="h-3 w-3" />
												{scheduleCount} buổi
											</div>
										</div>
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>
				</div>

				{/* Selected Class Details */}
				{selectedClass && subjectData[selectedClass] && (
					<div className="space-y-3 p-4 bg-muted/50 rounded-lg">
						<h4 className="font-medium">Thông tin lớp {selectedClass}</h4>

						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-muted-foreground" />
								<span>Giảng viên: {subjectData[selectedClass]![Field.Teacher]}</span>
							</div>

							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span>Số buổi học: {subjectData[selectedClass]!.schedules.length}</span>
							</div>
						</div>

						{/* Schedule Preview */}
						<div className="space-y-2">
							<h5 className="font-medium text-sm">Lịch học:</h5>
							<div className="space-y-1">
								{subjectData[selectedClass]!.schedules.slice(0, 3).map(
									(schedule, index: number) => (
										<div
											key={index}
											className="text-xs text-muted-foreground flex items-center gap-2"
										>
											<Badge variant="outline" className="text-xs">
												Tiết {schedule[Field.StartSession]}
												{schedule[Field.StartSession] !== schedule[Field.EndSession] &&
													`-${schedule[Field.EndSession]}`}
											</Badge>
										</div>
									)
								)}
								{subjectData[selectedClass]!.schedules.length > 3 && (
									<div className="text-xs text-muted-foreground">
										... và {subjectData[selectedClass]!.schedules.length - 3} buổi khác
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{!selectedClass && (
					<div className="text-center py-4 text-muted-foreground text-sm">
						Chọn lớp học để xem chi tiết
					</div>
				)}
			</CardContent>
		</Card>
	);
}
