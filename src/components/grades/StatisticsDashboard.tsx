'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	Legend
} from 'recharts';
import { GradeRecord } from '@/types/grades';
import { calculateOverallStats } from '@/lib/ts/grades/calculations';

interface StatisticsDashboardProps {
	grades: GradeRecord[];
	className?: string;
}

export function StatisticsDashboard({ grades, className }: StatisticsDashboardProps) {
	const statistics = useMemo(() => calculateOverallStats(grades), [grades]);

	const semesterProgressData = useMemo(() => {
		return statistics.semesterStats.map((semester) => ({
			semester: `Kỳ ${semester.semester}`,
			gpa10: semester.gpa10 || 0,
			gpa4: semester.gpa4 || 0,
			totalCredits: semester.totalCredits,
			passedCredits: semester.passedCredits
		}));
	}, [statistics]);

	return (
		<div className={className}>
			<div className="space-y-6">
				{/* Semester Progress */}
				{semesterProgressData.length > 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Tiến độ học tập theo kỳ</CardTitle>
							<CardDescription>Theo dõi GPA và tín chỉ tích lũy qua các kỳ học</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={semesterProgressData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="semester" />
										<YAxis yAxisId="gpa" domain={[0, 10]} />
										<YAxis yAxisId="credits" orientation="right" />
										<Tooltip />
										<Legend />
										<Line
											yAxisId="gpa"
											type="monotone"
											dataKey="gpa10"
											stroke="#8884d8"
											strokeWidth={2}
											name="GPA Hệ 10"
										/>
										<Line
											yAxisId="credits"
											type="monotone"
											dataKey="totalCredits"
											stroke="#82ca9d"
											strokeWidth={2}
											name="Tổng tín chỉ"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Semester Details */}
				<Card>
					<CardHeader>
						<CardTitle>Chi tiết theo kỳ học</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{statistics.semesterStats.map((semester, index) => (
								<div key={semester.semester}>
									{index > 0 && <Separator />}
									<div className="grid grid-cols-1 md:grid-cols-6 gap-4 py-4">
										<div className="md:col-span-1">
											<div className="font-medium">Kỳ {semester.semester}</div>
											<div className="text-sm text-muted-foreground">
												{semester.grades.length} môn
											</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-semibold">
												{semester.gpa10?.toFixed(2) || 'N/A'}
											</div>
											<div className="text-xs text-muted-foreground">GPA 10</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-semibold">
												{semester.gpa4?.toFixed(2) || 'N/A'}
											</div>
											<div className="text-xs text-muted-foreground">GPA 4</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-semibold">{semester.totalCredits}</div>
											<div className="text-xs text-muted-foreground">Tổng TC</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-semibold text-green-600">
												{semester.passedCredits}
											</div>
											<div className="text-xs text-muted-foreground">TC đạt</div>
										</div>
										<div className="text-center">
											<div className="flex items-center justify-center gap-2">
												{semester.failedSubjects > 0 ? (
													<Badge variant="destructive" className="text-xs">
														{semester.failedSubjects} chưa đạt
													</Badge>
												) : (
													<Badge variant="default" className="text-xs">
														<CheckCircle className="h-3 w-3 mr-1" />
														Đạt
													</Badge>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Recommendations */}
				{statistics.overallGPA10 && statistics.overallGPA10 < 6.5 && (
					<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
						<AlertTriangle className="h-4 w-4 text-yellow-600" />
						<AlertDescription>
							<strong>Khuyến nghị:</strong> GPA hiện tại thấp hơn mức trung bình. Hãy tập trung cải
							thiện điểm số ở các kỳ tiếp theo để nâng cao kết quả học tập.
						</AlertDescription>
					</Alert>
				)}
			</div>
		</div>
	);
}
