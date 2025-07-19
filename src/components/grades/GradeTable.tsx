'use client';

import React, { useState, useMemo } from 'react';
import {
	ChevronUp,
	ChevronDown,
	Filter,
	AlertTriangle,
	CheckCircle,
	Eye,
	EyeOff
} from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
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
import { GradeRecord, GradeSortConfig, GradeFilterConfig } from '@/types/grades';
import { filterGrades, sortGrades } from '@/lib/ts/grades/validation';

interface GradeTableProps {
	grades: GradeRecord[];
	onGradeEdit?: (grade: GradeRecord) => void;
	onGradeDelete?: (gradeId: string) => void;
	className?: string;
}

export function GradeTable({
	grades,
	onGradeEdit: _onGradeEdit,
	onGradeDelete: _onGradeDelete,
	className
}: GradeTableProps) {
	const [sortConfig, setSortConfig] = useState<GradeSortConfig | null>(null);
	const [filterConfig, setFilterConfig] = useState<GradeFilterConfig>({});
	const [showInvalidOnly, setShowInvalidOnly] = useState(false);
	const [showCalculatedColumns, setShowCalculatedColumns] = useState(true);

	// Get unique semesters for filter
	const semesters = useMemo(() => {
		const uniqueSemesters = Array.from(new Set(grades.map((g) => g.ky))).sort((a, b) => a - b);
		return uniqueSemesters;
	}, [grades]);

	// Apply filters and sorting
	const processedGrades = useMemo(() => {
		let filtered = filterGrades(grades, filterConfig);

		if (showInvalidOnly) {
			filtered = filtered.filter((grade) => !grade.isValid);
		}

		if (sortConfig) {
			filtered = sortGrades(filtered, sortConfig);
		}

		return filtered;
	}, [grades, filterConfig, sortConfig, showInvalidOnly]);

	const handleSort = (field: keyof GradeRecord) => {
		setSortConfig((prev) => {
			if (prev?.field === field) {
				return {
					field,
					direction: prev.direction === 'asc' ? 'desc' : 'asc'
				};
			}
			return { field, direction: 'asc' };
		});
	};

	const handleFilterChange = (key: keyof GradeFilterConfig, value: unknown): void => {
		setFilterConfig((prev) => ({
			...prev,
			[key]: value === '' || value === 'all' ? undefined : value
		}));
	};

	const clearFilters = () => {
		setFilterConfig({});
		setSortConfig(null);
		setShowInvalidOnly(false);
	};

	const getSortIcon = (field: keyof GradeRecord) => {
		if (sortConfig?.field !== field) return null;
		return sortConfig.direction === 'asc' ? (
			<ChevronUp className="h-4 w-4" />
		) : (
			<ChevronDown className="h-4 w-4" />
		);
	};

	const getGradeColor = (grade: GradeRecord) => {
		if (!grade.kthp) return '';
		if (grade.kthp >= 8.5) return 'text-green-600 dark:text-green-400';
		if (grade.kthp >= 7.0) return 'text-blue-600 dark:text-blue-400';
		if (grade.kthp >= 5.0) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	};

	const invalidGradesCount = grades.filter((g) => !g.isValid).length;

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								Bảng điểm
								<Badge variant="secondary">{processedGrades.length} môn</Badge>
							</CardTitle>
							<CardDescription>Xem và quản lý điểm số các môn học</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowCalculatedColumns(!showCalculatedColumns)}
								className="flex items-center gap-2"
							>
								{showCalculatedColumns ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
								{showCalculatedColumns ? 'Ẩn' : 'Hiện'} cột tính toán
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Filters */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4" />
							<span className="font-medium">Bộ lọc</span>
							{(Object.keys(filterConfig).length > 0 || sortConfig || showInvalidOnly) && (
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									Xóa bộ lọc
								</Button>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Tìm kiếm</label>
								<Input
									placeholder="Tên môn học..."
									value={filterConfig.searchTerm || ''}
									onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
									className="h-9"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Kỳ học</label>
								<Select
									value={filterConfig.semester?.toString() || 'all'}
									onValueChange={(value) =>
										handleFilterChange('semester', value === 'all' ? undefined : parseInt(value))
									}
								>
									<SelectTrigger className="h-9">
										<SelectValue placeholder="Tất cả kỳ" />
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
								<div className="flex gap-2">
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
										className="h-9"
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
										className="h-9"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Bộ lọc nhanh</label>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="failed"
											checked={filterConfig.onlyFailed || false}
											onCheckedChange={(checked) =>
												handleFilterChange('onlyFailed', checked === true)
											}
										/>
										<label htmlFor="failed" className="text-sm">
											Chỉ môn rớt
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="excellent"
											checked={filterConfig.onlyExcellent || false}
											onCheckedChange={(checked) =>
												handleFilterChange('onlyExcellent', checked === true)
											}
										/>
										<label htmlFor="excellent" className="text-sm">
											Chỉ môn xuất sắc
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="invalid"
											checked={showInvalidOnly}
											onCheckedChange={(checked) => setShowInvalidOnly(checked === true)}
										/>
										<label htmlFor="invalid" className="text-sm">
											Chỉ dữ liệu lỗi ({invalidGradesCount})
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>

					<Separator />

					{/* Validation Alert */}
					{invalidGradesCount > 0 && !showInvalidOnly && (
						<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
							<AlertTriangle className="h-4 w-4 text-yellow-600" />
							<AlertDescription>
								Có {invalidGradesCount} bản ghi có lỗi dữ liệu.
								<Button
									variant="link"
									className="p-0 h-auto text-yellow-700 dark:text-yellow-300"
									onClick={() => setShowInvalidOnly(true)}
								>
									Xem chi tiết
								</Button>
							</AlertDescription>
						</Alert>
					)}

					{/* Table */}
					<div className="rounded-md border overflow-hidden">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('tenMon')}
										>
											<div className="flex items-center gap-2">
												Tên môn
												{getSortIcon('tenMon')}
											</div>
										</TableHead>
										<TableHead
											className="cursor-pointer hover:bg-muted/50 text-center"
											onClick={() => handleSort('ky')}
										>
											<div className="flex items-center justify-center gap-2">
												Kỳ
												{getSortIcon('ky')}
											</div>
										</TableHead>
										<TableHead
											className="cursor-pointer hover:bg-muted/50 text-center"
											onClick={() => handleSort('tin')}
										>
											<div className="flex items-center justify-center gap-2">
												TC
												{getSortIcon('tin')}
											</div>
										</TableHead>
										<TableHead className="text-center">TP1</TableHead>
										<TableHead className="text-center">TP2</TableHead>
										<TableHead className="text-center">Thi</TableHead>
										{showCalculatedColumns && (
											<>
												<TableHead
													className="cursor-pointer hover:bg-muted/50 text-center"
													onClick={() => handleSort('dqt')}
												>
													<div className="flex items-center justify-center gap-2">
														ĐQT
														{getSortIcon('dqt')}
													</div>
												</TableHead>
												<TableHead
													className="cursor-pointer hover:bg-muted/50 text-center"
													onClick={() => handleSort('kthp')}
												>
													<div className="flex items-center justify-center gap-2">
														KTHP
														{getSortIcon('kthp')}
													</div>
												</TableHead>
												<TableHead className="text-center">Hệ 4</TableHead>
												<TableHead className="text-center">Điểm chữ</TableHead>
											</>
										)}
										<TableHead className="text-center">Trạng thái</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{processedGrades.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={showCalculatedColumns ? 11 : 7}
												className="text-center py-8 text-muted-foreground"
											>
												Không có dữ liệu phù hợp với bộ lọc
											</TableCell>
										</TableRow>
									) : (
										processedGrades.map((grade) => (
											<TableRow
												key={grade.id}
												className={`${!grade.isValid ? 'bg-red-50 dark:bg-red-950/20' : ''} hover:bg-muted/50`}
											>
												<TableCell className="font-medium max-w-48">
													<div className="truncate" title={grade.tenMon}>
														{grade.tenMon}
													</div>
													{grade.excludeFromGPA && (
														<Badge variant="outline" className="mt-1 text-xs">
															Không tính GPA
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-center">{grade.ky}</TableCell>
												<TableCell className="text-center">{grade.tin}</TableCell>
												<TableCell className="text-center">{grade.tp1 ?? '-'}</TableCell>
												<TableCell className="text-center">{grade.tp2 ?? '-'}</TableCell>
												<TableCell className="text-center">{grade.thi ?? '-'}</TableCell>
												{showCalculatedColumns && (
													<>
														<TableCell className="text-center">{grade.dqt ?? '-'}</TableCell>
														<TableCell
															className={`text-center font-medium ${getGradeColor(grade)}`}
														>
															{grade.kthp ?? '-'}
														</TableCell>
														<TableCell className="text-center">{grade.kthpHe4 ?? '-'}</TableCell>
														<TableCell className="text-center">
															{grade.diemChu && (
																<Badge
																	variant={
																		grade.kthp && grade.kthp >= 5 ? 'default' : 'destructive'
																	}
																	className="font-medium"
																>
																	{grade.diemChu}
																</Badge>
															)}
														</TableCell>
													</>
												)}
												<TableCell className="text-center">
													{grade.isValid ? (
														<CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
													) : (
														<AlertTriangle className="h-4 w-4 text-red-600 mx-auto" />
													)}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>

					{/* Summary */}
					{processedGrades.length > 0 && (
						<div className="text-sm text-muted-foreground text-center">
							Hiển thị {processedGrades.length} / {grades.length} môn học
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
