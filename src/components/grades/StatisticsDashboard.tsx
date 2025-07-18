'use client';

import React, { useMemo } from 'react';
import { 
	TrendingUp, 
	TrendingDown, 
	Award, 
	BookOpen, 
	Calculator,
	Target,
	AlertTriangle,
	CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	Legend
} from 'recharts';
import { GradeRecord, GradeStatistics } from '@/types/grades';
import { calculateOverallStats } from '@/lib/ts/grades/calculations';

interface StatisticsDashboardProps {
	grades: GradeRecord[];
	className?: string;
}

const GRADE_COLORS = {
	'A+': '#10b981', // green-500
	'A': '#059669',  // green-600
	'B+': '#3b82f6', // blue-500
	'B': '#2563eb',  // blue-600
	'C+': '#f59e0b', // amber-500
	'C': '#d97706',  // amber-600
	'D+': '#ef4444', // red-500
	'D': '#dc2626',  // red-600
	'F': '#991b1b'   // red-800
};

export function StatisticsDashboard({ grades, className }: StatisticsDashboardProps) {
	const statistics = useMemo(() => calculateOverallStats(grades), [grades]);

	// Prepare chart data
	const gradeDistributionData = useMemo(() => {
		return Object.entries(statistics.gradeDistribution)
			.map(([grade, count]) => ({
				grade,
				count,
				percentage: ((count / statistics.totalSubjects) * 100).toFixed(1)
			}))
			.sort((a, b) => {
				const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
				return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
			});
	}, [statistics]);

	const semesterProgressData = useMemo(() => {
		return statistics.semesterStats.map(semester => ({
			semester: `Kỳ ${semester.semester}`,
			gpa10: semester.gpa10 || 0,
			gpa4: semester.gpa4 || 0,
			totalCredits: semester.totalCredits,
			passedCredits: semester.passedCredits
		}));
	}, [statistics]);

	const performanceData = useMemo(() => {
		return [
			{ name: 'Xuất sắc (A+, A)', value: statistics.excellentSubjects, color: '#10b981' },
			{ name: 'Giỏi (B+, B)', value: statistics.goodSubjects, color: '#3b82f6' },
			{ name: 'Khá (C+, C)', value: statistics.averageSubjects, color: '#f59e0b' },
			{ name: 'Yếu (D+, D)', value: statistics.weakSubjects, color: '#ef4444' },
			{ name: 'Rớt (F)', value: statistics.failedSubjects, color: '#991b1b' }
		].filter(item => item.value > 0);
	}, [statistics]);

	const passRate = statistics.totalSubjects > 0 
		? ((statistics.passedSubjects / statistics.totalSubjects) * 100).toFixed(1)
		: '0';

	const excellentRate = statistics.totalSubjects > 0 
		? ((statistics.excellentSubjects / statistics.totalSubjects) * 100).toFixed(1)
		: '0';

	return (
		<div className={className}>
			<div className="space-y-6">
				{/* Overview Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">GPA Hệ 10</p>
									<p className="text-2xl font-bold">
										{statistics.overallGPA10?.toFixed(2) || 'N/A'}
									</p>
								</div>
								<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
									<Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
							</div>
							{statistics.overallGPA10 && (
								<div className="mt-2">
									<Progress 
										value={(statistics.overallGPA10 / 10) * 100} 
										className="h-2"
									/>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">GPA Hệ 4</p>
									<p className="text-2xl font-bold">
										{statistics.overallGPA4?.toFixed(2) || 'N/A'}
									</p>
								</div>
								<div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
									<Target className="h-6 w-6 text-green-600 dark:text-green-400" />
								</div>
							</div>
							{statistics.overallGPA4 && (
								<div className="mt-2">
									<Progress 
										value={(statistics.overallGPA4 / 4) * 100} 
										className="h-2"
									/>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Tổng tín chỉ</p>
									<p className="text-2xl font-bold">{statistics.totalCredits}</p>
									<p className="text-xs text-muted-foreground">
										Đạt: {statistics.totalPassedCredits}
									</p>
								</div>
								<div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
									<BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Tỷ lệ đậu</p>
									<p className="text-2xl font-bold">{passRate}%</p>
									<p className="text-xs text-muted-foreground">
										{statistics.passedSubjects}/{statistics.totalSubjects} môn
									</p>
								</div>
								<div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
									{parseFloat(passRate) >= 80 ? (
										<TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
									) : (
										<TrendingDown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
									)}
								</div>
							</div>
							<div className="mt-2">
								<Progress 
									value={parseFloat(passRate)} 
									className="h-2"
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Performance Summary */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Award className="h-5 w-5" />
								Phân loại kết quả học tập
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
										<div className="text-2xl font-bold text-green-600">{statistics.excellentSubjects}</div>
										<div className="text-sm text-muted-foreground">Xuất sắc</div>
										<div className="text-xs text-green-600">{excellentRate}%</div>
									</div>
									<div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
										<div className="text-2xl font-bold text-blue-600">{statistics.goodSubjects}</div>
										<div className="text-sm text-muted-foreground">Giỏi</div>
									</div>
									<div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
										<div className="text-2xl font-bold text-yellow-600">{statistics.averageSubjects}</div>
										<div className="text-sm text-muted-foreground">Khá</div>
									</div>
									<div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
										<div className="text-2xl font-bold text-red-600">{statistics.failedSubjects}</div>
										<div className="text-sm text-muted-foreground">Rớt</div>
									</div>
								</div>

								{/* Performance Chart */}
								{performanceData.length > 0 && (
									<div className="h-64">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={performanceData}
													cx="50%"
													cy="50%"
													innerRadius={60}
													outerRadius={100}
													paddingAngle={5}
													dataKey="value"
												>
													{performanceData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													))}
												</Pie>
												<Tooltip 
													formatter={(value, name) => [value, name]}
													labelFormatter={() => ''}
												/>
												<Legend />
											</PieChart>
										</ResponsiveContainer>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Phân bố điểm chữ</CardTitle>
						</CardHeader>
						<CardContent>
							{gradeDistributionData.length > 0 ? (
								<div className="h-64">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={gradeDistributionData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="grade" />
											<YAxis />
											<Tooltip 
												formatter={(value, name) => [value, 'Số môn']}
												labelFormatter={(label) => `Điểm ${label}`}
											/>
											<Bar 
												dataKey="count" 
												fill="#8884d8"
												radius={[4, 4, 0, 0]}
											>
												{gradeDistributionData.map((entry, index) => (
													<Cell 
														key={`cell-${index}`} 
														fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || '#8884d8'} 
													/>
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="h-64 flex items-center justify-center text-muted-foreground">
									Chưa có dữ liệu điểm
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Semester Progress */}
				{semesterProgressData.length > 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Tiến độ học tập theo kỳ</CardTitle>
							<CardDescription>
								Theo dõi GPA và tín chỉ tích lũy qua các kỳ học
							</CardDescription>
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
														{semester.failedSubjects} rớt
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
							<strong>Khuyến nghị:</strong> GPA hiện tại thấp hơn mức trung bình. 
							Hãy tập trung cải thiện điểm số ở các kỳ tiếp theo để nâng cao kết quả học tập.
						</AlertDescription>
					</Alert>
				)}
			</div>
		</div>
	);
}
