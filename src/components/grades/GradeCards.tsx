'use client';

import React, { useState, useMemo } from 'react';
import { Filter, AlertTriangle, CheckCircle, Calculator, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { GradeRecord, GradeFilterConfig } from '@/types/grades';
import { filterGrades } from '@/lib/ts/grades/validation';

interface GradeCardsProps {
	grades: GradeRecord[];
	onGradeEdit?: (grade: GradeRecord) => void;
	onGradeDelete?: (gradeId: string) => void;
	className?: string;
}

export function GradeCards({
	grades,
	onGradeEdit: _onGradeEdit,
	onGradeDelete: _onGradeDelete,
	className
}: GradeCardsProps) {
	const [filterConfig, setFilterConfig] = useState<GradeFilterConfig>({});
	const [showInvalidOnly, setShowInvalidOnly] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	// Get unique semesters for filter
	const semesters = useMemo(() => {
		const uniqueSemesters = Array.from(new Set(grades.map((g) => g.ky))).sort((a, b) => a - b);
		return uniqueSemesters;
	}, [grades]);

	// Apply filters
	const processedGrades = useMemo(() => {
		let filtered = filterGrades(grades, filterConfig);

		if (showInvalidOnly) {
			filtered = filtered.filter((grade) => !grade.isValid);
		}

		// Sort by semester and then by subject name
		filtered.sort((a, b) => {
			if (a.ky !== b.ky) return a.ky - b.ky;
			return a.tenMon.localeCompare(b.tenMon, 'vi');
		});

		return filtered;
	}, [grades, filterConfig, showInvalidOnly]);

	// Group by semester
	const gradesBySemester = useMemo(() => {
		const grouped = processedGrades.reduce(
			(acc, grade) => {
				if (!acc[grade.ky]) {
					acc[grade.ky] = [];
				}
				acc[grade.ky]!.push(grade);
				return acc;
			},
			{} as Record<number, GradeRecord[]>
		);

		return Object.entries(grouped)
			.map(([semester, grades]) => ({
				semester: parseInt(semester),
				grades
			}))
			.sort((a, b) => a.semester - b.semester);
	}, [processedGrades]);

	const handleFilterChange = (key: keyof GradeFilterConfig, value: any) => {
		setFilterConfig((prev) => ({
			...prev,
			[key]: value === '' || value === 'all' ? undefined : value
		}));
	};

	const clearFilters = () => {
		setFilterConfig({});
		setShowInvalidOnly(false);
	};

	const getGradeColor = (grade: GradeRecord) => {
		if (!grade.kthp) return 'text-muted-foreground';
		if (grade.kthp >= 8.5) return 'text-green-600 dark:text-green-400';
		if (grade.kthp >= 7.0) return 'text-blue-600 dark:text-blue-400';
		if (grade.kthp >= 5.0) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	};

	const getGradeBadgeVariant = (grade: GradeRecord) => {
		if (!grade.kthp) return 'secondary';
		return grade.kthp >= 5 ? 'default' : 'destructive';
	};

	const invalidGradesCount = grades.filter((g) => !g.isValid).length;

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5" />
								Bảng điểm
								<Badge variant="secondary">{processedGrades.length} môn</Badge>
							</CardTitle>
							<CardDescription>Xem điểm số các môn học theo từng kỳ</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center gap-2"
						>
							<Filter className="h-4 w-4" />
							Lọc
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Filters */}
					<Collapsible open={showFilters} onOpenChange={setShowFilters}>
						<CollapsibleContent className="space-y-4">
							<div className="space-y-4 p-4 bg-muted/30 rounded-lg">
								<div className="flex items-center justify-between">
									<span className="font-medium text-sm">Bộ lọc</span>
									{(Object.keys(filterConfig).length > 0 || showInvalidOnly) && (
										<Button variant="ghost" size="sm" onClick={clearFilters}>
											Xóa bộ lọc
										</Button>
									)}
								</div>

								<div className="space-y-3">
									<div className="space-y-2">
										<label className="text-sm font-medium">Tìm kiếm môn học</label>
										<Input
											placeholder="Nhập tên môn học..."
											value={filterConfig.searchTerm || ''}
											onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
											className="h-9"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<label className="text-sm font-medium">Kỳ học</label>
											<Select
												value={filterConfig.semester?.toString() || 'all'}
												onValueChange={(value) =>
													handleFilterChange(
														'semester',
														value === 'all' ? undefined : parseInt(value)
													)
												}
											>
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Tất cả" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">Tất cả kỳ</SelectItem>
													{semesters.map((semester) => (
														<SelectItem key={semester} value={semester.toString()}>
															Kỳ {semester}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium">Điểm KTHP</label>
											<div className="flex gap-1">
												<Input
													type="number"
													placeholder="Từ"
													step="0.1"
													min="0"
													max="10"
													value={filterConfig.minGPA || ''}
													onChange={(e) =>
														handleFilterChange(
															'minGPA',
															e.target.value ? parseFloat(e.target.value) : undefined
														)
													}
													className="h-9 text-xs"
												/>
												<Input
													type="number"
													placeholder="Đến"
													step="0.1"
													min="0"
													max="10"
													value={filterConfig.maxGPA || ''}
													onChange={(e) =>
														handleFilterChange(
															'maxGPA',
															e.target.value ? parseFloat(e.target.value) : undefined
														)
													}
													className="h-9 text-xs"
												/>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Bộ lọc nhanh</label>
										<div className="grid grid-cols-2 gap-2">
											<div className="flex items-center space-x-2">
												<Checkbox
													id="failed-mobile"
													checked={filterConfig.onlyFailed || false}
													onCheckedChange={(checked) => handleFilterChange('onlyFailed', checked)}
												/>
												<label htmlFor="failed-mobile" className="text-sm">
													Môn rớt
												</label>
											</div>
											<div className="flex items-center space-x-2">
												<Checkbox
													id="excellent-mobile"
													checked={filterConfig.onlyExcellent || false}
													onCheckedChange={(checked) =>
														handleFilterChange('onlyExcellent', checked)
													}
												/>
												<label htmlFor="excellent-mobile" className="text-sm">
													Xuất sắc
												</label>
											</div>
											<div className="flex items-center space-x-2">
												<Checkbox
													id="invalid-mobile"
													checked={showInvalidOnly}
													onCheckedChange={(checked) => setShowInvalidOnly(checked === true)}
												/>
												<label htmlFor="invalid-mobile" className="text-sm">
													Lỗi dữ liệu ({invalidGradesCount})
												</label>
											</div>
										</div>
									</div>
								</div>
							</div>
							<Separator />
						</CollapsibleContent>
					</Collapsible>

					{/* Validation Alert */}
					{invalidGradesCount > 0 && !showInvalidOnly && (
						<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
							<AlertTriangle className="h-4 w-4 text-yellow-600" />
							<AlertDescription className="text-sm">
								Có {invalidGradesCount} bản ghi có lỗi dữ liệu.
								<Button
									variant="link"
									className="p-0 h-auto text-yellow-700 dark:text-yellow-300 text-sm"
									onClick={() => setShowInvalidOnly(true)}
								>
									Xem chi tiết
								</Button>
							</AlertDescription>
						</Alert>
					)}

					{/* Grade Cards by Semester */}
					{gradesBySemester.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>Không có dữ liệu phù hợp với bộ lọc</p>
						</div>
					) : (
						<div className="space-y-6">
							{gradesBySemester.map(({ semester, grades: semesterGrades }) => (
								<div key={semester} className="space-y-3">
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-lg">Kỳ {semester}</h3>
										<Badge variant="outline">{semesterGrades.length} môn</Badge>
									</div>

									<div className="space-y-3">
										{semesterGrades.map((grade) => (
											<Card
												key={grade.id}
												className={`${!grade.isValid ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : ''}`}
											>
												<CardContent className="p-4">
													<div className="space-y-3">
														{/* Header */}
														<div className="flex items-start justify-between">
															<div className="flex-1 min-w-0">
																<h4 className="font-medium text-sm leading-tight">
																	{grade.tenMon}
																</h4>
																<div className="flex items-center gap-2 mt-1">
																	<Badge variant="outline" className="text-xs">
																		{grade.tin} TC
																	</Badge>
																	{grade.excludeFromGPA && (
																		<Badge variant="outline" className="text-xs">
																			Không tính GPA
																		</Badge>
																	)}
																</div>
															</div>
															<div className="flex items-center gap-2 ml-2">
																{grade.diemChu && (
																	<Badge
																		variant={getGradeBadgeVariant(grade)}
																		className="font-medium"
																	>
																		{grade.diemChu}
																	</Badge>
																)}
																{grade.isValid ? (
																	<CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
																) : (
																	<AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
																)}
															</div>
														</div>

														{/* Grades */}
														<div className="grid grid-cols-3 gap-3 text-sm">
															<div className="text-center p-2 bg-muted/50 rounded">
																<div className="text-xs text-muted-foreground">TP1</div>
																<div className="font-medium">{grade.tp1 ?? '-'}</div>
															</div>
															<div className="text-center p-2 bg-muted/50 rounded">
																<div className="text-xs text-muted-foreground">TP2</div>
																<div className="font-medium">{grade.tp2 ?? '-'}</div>
															</div>
															<div className="text-center p-2 bg-muted/50 rounded">
																<div className="text-xs text-muted-foreground">Thi</div>
																<div className="font-medium">{grade.thi ?? '-'}</div>
															</div>
														</div>

														{/* Calculated Grades */}
														<div className="grid grid-cols-3 gap-3 text-sm">
															<div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
																<div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
																	<Calculator className="h-3 w-3" />
																	ĐQT
																</div>
																<div className="font-medium">{grade.dqt ?? '-'}</div>
															</div>
															<div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
																<div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
																	<TrendingUp className="h-3 w-3" />
																	KTHP
																</div>
																<div className={`font-medium ${getGradeColor(grade)}`}>
																	{grade.kthp ?? '-'}
																</div>
															</div>
															<div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
																<div className="text-xs text-muted-foreground">Hệ 4</div>
																<div className="font-medium">{grade.kthpHe4 ?? '-'}</div>
															</div>
														</div>

														{/* Errors */}
														{grade.errors && grade.errors.length > 0 && (
															<Alert className="mt-2">
																<AlertTriangle className="h-4 w-4" />
																<AlertDescription className="text-xs">
																	{grade.errors.join(', ')}
																</AlertDescription>
															</Alert>
														)}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Summary */}
					{processedGrades.length > 0 && (
						<div className="text-sm text-muted-foreground text-center pt-4 border-t">
							Hiển thị {processedGrades.length} / {grades.length} môn học
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
