'use client';

import React, { useState, useMemo } from 'react';
import {
	ChevronUp,
	ChevronDown,
	ArrowUpDown,
	Filter,
	AlertTriangle,
	Eye,
	EyeOff,
	Plus,
	Edit,
	Trash2
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

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { GradeRecord, GradeSortConfig, GradeFilterConfig, ImportResult } from '@/types/grades';
import { filterGrades, sortGrades } from '@/lib/ts/grades/validation';
import { GradeEditModal } from './GradeEditModal';
import { SimpleCSVImport } from './SimpleCSVImport';
import { SimpleCSVExport } from './SimpleCSVExport';

interface GradeTableProps {
	grades: GradeRecord[];
	onGradeAdd?: (grade: Omit<GradeRecord, 'id'>) => void;
	onGradeEdit?: (gradeId: string, updatedGrade: Omit<GradeRecord, 'id'>) => void;
	onGradeDelete?: (gradeId: string) => void;
	onImportComplete?: (result: ImportResult) => void;
	editable?: boolean;
	className?: string;
	// State props for persistence across tab switches
	sortConfig: GradeSortConfig | null;
	setSortConfig: (config: GradeSortConfig | null) => void;
	filterConfig: GradeFilterConfig;
	setFilterConfig: (config: GradeFilterConfig) => void;
	showCalculatedColumns: boolean;
	setShowCalculatedColumns: (show: boolean) => void;
}

export function GradeTable({
	grades,
	onGradeAdd,
	onGradeEdit,
	onGradeDelete,
	onImportComplete,
	editable = false,
	className,
	sortConfig,
	setSortConfig,
	filterConfig,
	setFilterConfig,
	showCalculatedColumns,
	setShowCalculatedColumns
}: GradeTableProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);

	// Apply filters and sorting
	const processedGrades = useMemo(() => {
		let filtered = filterGrades(grades, filterConfig);

		if (sortConfig) {
			filtered = sortGrades(filtered, sortConfig);
		}

		return filtered;
	}, [grades, filterConfig, sortConfig]);

	const handleSort = (field: keyof GradeRecord) => {
		if (sortConfig?.field === field) {
			setSortConfig({
				field,
				direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
			});
		} else {
			setSortConfig({ field, direction: 'asc' });
		}
	};

	const handleFilterChange = (key: keyof GradeFilterConfig, value: unknown): void => {
		setFilterConfig({
			...filterConfig,
			[key]: value === '' || value === 'all' ? undefined : value
		});
	};

	const clearFilters = () => {
		setFilterConfig({});
		setSortConfig(null);
	};

	// Modal handlers
	const handleAddNew = () => {
		setEditingGrade(null);
		setIsModalOpen(true);
	};

	const handleEdit = (grade: GradeRecord) => {
		setEditingGrade(grade);
		setIsModalOpen(true);
	};

	const handleDelete = (gradeId: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
			onGradeDelete?.(gradeId);
		}
	};

	const handleModalSave = (gradeData: Omit<GradeRecord, 'id'>) => {
		if (editingGrade) {
			// Editing existing grade
			onGradeEdit?.(editingGrade.id, gradeData);
		} else {
			// Adding new grade
			onGradeAdd?.(gradeData);
		}
		setIsModalOpen(false);
		setEditingGrade(null);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setEditingGrade(null);
	};

	const getSortIcon = (field: keyof GradeRecord) => {
		if (sortConfig?.field !== field) {
			return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
		}
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
							{onImportComplete && <SimpleCSVImport onImportComplete={onImportComplete} />}
							<SimpleCSVExport grades={grades} />
							{editable && (
								<Button onClick={handleAddNew} size="sm" className="flex items-center gap-2">
									<Plus className="h-4 w-4" />
									Thêm môn
								</Button>
							)}
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
							{(Object.keys(filterConfig).length > 0 || sortConfig) && (
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									Xóa bộ lọc
								</Button>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Tìm kiếm</label>
								<Input
									placeholder="Tên môn học..."
									value={filterConfig.searchTerm || ''}
									onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
									className="h-9"
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Validation Alert */}
					{invalidGradesCount > 0 && (
						<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
							<AlertTriangle className="h-4 w-4 text-yellow-600" />
							<AlertDescription>Có {invalidGradesCount} bản ghi có lỗi dữ liệu.</AlertDescription>
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
										<TableHead
											className="cursor-pointer hover:bg-muted/50 text-center"
											onClick={() => handleSort('tp1')}
										>
											<div className="flex items-center justify-center gap-2">
												TP1
												{getSortIcon('tp1')}
											</div>
										</TableHead>
										<TableHead
											className="cursor-pointer hover:bg-muted/50 text-center"
											onClick={() => handleSort('tp2')}
										>
											<div className="flex items-center justify-center gap-2">
												TP2
												{getSortIcon('tp2')}
											</div>
										</TableHead>
										<TableHead
											className="cursor-pointer hover:bg-muted/50 text-center"
											onClick={() => handleSort('thi')}
										>
											<div className="flex items-center justify-center gap-2">
												Thi
												{getSortIcon('thi')}
											</div>
										</TableHead>
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
											</>
										)}

										{editable && <TableHead className="text-center">Thao tác</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{processedGrades.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={showCalculatedColumns ? (editable ? 9 : 8) : editable ? 7 : 6}
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
												<TableCell className="text-center">
													{grade.tp1 !== null ? grade.tp1.toFixed(1) : '-'}
												</TableCell>
												<TableCell className="text-center">
													{grade.tp2 !== null ? grade.tp2.toFixed(1) : '-'}
												</TableCell>
												<TableCell className="text-center">
													{grade.thi !== null ? grade.thi.toFixed(1) : '-'}
												</TableCell>
												{showCalculatedColumns && (
													<>
														<TableCell className="text-center">
															{grade.dqt !== null ? grade.dqt.toFixed(1) : '-'}
														</TableCell>
														<TableCell
															className={`text-center font-medium ${getGradeColor(grade)}`}
														>
															{grade.kthp !== null && grade.kthpHe4 !== null
																? `${grade.kthp.toFixed(1)}/${grade.kthpHe4.toFixed(1)}`
																: grade.kthp !== null
																	? grade.kthp.toFixed(1)
																	: '-'}
														</TableCell>
													</>
												)}

												{editable && (
													<TableCell className="text-center">
														<div className="flex items-center justify-center gap-1">
															<Button
																size="sm"
																variant="ghost"
																onClick={() => handleEdit(grade)}
																className="h-8 w-8 p-0"
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() => handleDelete(grade.id)}
																className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												)}
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

			{/* Edit Modal */}
			{editable && (
				<GradeEditModal
					isOpen={isModalOpen}
					onClose={handleModalClose}
					onSave={handleModalSave}
					editingGrade={editingGrade}
				/>
			)}
		</div>
	);
}
