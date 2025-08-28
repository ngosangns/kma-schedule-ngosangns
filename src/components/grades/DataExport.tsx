'use client';

import React, { useState } from 'react';
import {
	Download,
	FileText,
	Database,
	Settings,
	AlertCircle,
	Calendar,
	BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { GradeRecord, GradeStatistics, ExportOptions } from '@/types/grades';
import { exportToCSV, exportToJSON, downloadFile } from '@/lib/ts/grades/import-export';

interface DataExportProps {
	grades: GradeRecord[];
	statistics?: GradeStatistics;
	className?: string;
}

export function DataExport({ grades, statistics, className }: DataExportProps) {
	const [exportOptions, setExportOptions] = useState<ExportOptions>({
		format: 'csv',
		includeCalculated: true,
		includeSemesterStats: false,
		includeOverallStats: false
	});
	const [isExporting, setIsExporting] = useState(false);
	const [selectedSemester, setSelectedSemester] = useState<string>('all');

	// Get unique semesters
	const semesters = Array.from(new Set(grades.map((g) => g.ky))).sort((a, b) => a - b);

	// Filter grades by semester if selected
	const filteredGrades =
		selectedSemester === 'all' ? grades : grades.filter((g) => g.ky === parseInt(selectedSemester));

	const handleExport = async () => {
		if (filteredGrades.length === 0) {
			alert('Không có dữ liệu để xuất');
			return;
		}

		setIsExporting(true);

		try {
			const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
			const semesterSuffix = selectedSemester === 'all' ? 'all' : `ky${selectedSemester}`;

			if (exportOptions.format === 'csv') {
				const csvContent = exportToCSV(filteredGrades, exportOptions);
				const filename = `grades_${semesterSuffix}_${timestamp}.csv`;
				downloadFile(csvContent, filename, 'text/csv');
			} else {
				const jsonContent = exportToJSON(filteredGrades, statistics, exportOptions);
				const filename = `grades_${semesterSuffix}_${timestamp}.json`;
				downloadFile(jsonContent, filename, 'application/json');
			}
		} catch (error) {
			console.error('Export error:', error);
			alert('Có lỗi xảy ra khi xuất dữ liệu');
		} finally {
			setIsExporting(false);
		}
	};

	const updateExportOption = (key: keyof ExportOptions, value: any) => {
		setExportOptions((prev) => ({
			...prev,
			[key]: value
		}));
	};

	const validGrades = filteredGrades.filter((g) => g.isValid);
	const invalidGrades = filteredGrades.filter((g) => !g.isValid);

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Download className="h-5 w-5" />
						Xuất dữ liệu
					</CardTitle>
					<CardDescription>Tải xuống dữ liệu điểm dưới định dạng CSV hoặc JSON</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Data Summary */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="text-center p-3 bg-muted/30 rounded-lg">
							<div className="text-2xl font-bold">{filteredGrades.length}</div>
							<div className="text-sm text-muted-foreground">Tổng số bản ghi</div>
						</div>
						<div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
							<div className="text-2xl font-bold text-green-600">{validGrades.length}</div>
							<div className="text-sm text-muted-foreground">Hợp lệ</div>
						</div>
						<div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
							<div className="text-2xl font-bold text-red-600">{invalidGrades.length}</div>
							<div className="text-sm text-muted-foreground">Có lỗi</div>
						</div>
						<div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
							<div className="text-2xl font-bold text-blue-600">{semesters.length}</div>
							<div className="text-sm text-muted-foreground">Số kỳ học</div>
						</div>
					</div>

					{/* Export Configuration */}
					<Tabs
						value={exportOptions.format}
						onValueChange={(value) => updateExportOption('format', value)}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="csv" className="flex items-center gap-2">
								<FileText className="h-4 w-4" />
								CSV
							</TabsTrigger>
							<TabsTrigger value="json" className="flex items-center gap-2">
								<Database className="h-4 w-4" />
								JSON
							</TabsTrigger>
						</TabsList>

						<TabsContent value="csv" className="space-y-4">
							<div className="space-y-4">
								<h4 className="font-medium flex items-center gap-2">
									<Settings className="h-4 w-4" />
									Tùy chọn xuất CSV
								</h4>

								<div className="space-y-3">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="include-calculated-csv"
											checked={exportOptions.includeCalculated}
											onCheckedChange={(checked) =>
												updateExportOption('includeCalculated', checked)
											}
										/>
										<Label htmlFor="include-calculated-csv" className="text-sm">
											Bao gồm cột tính toán (ĐQT, KTHP, Hệ 4, Điểm chữ)
										</Label>
									</div>
								</div>

								<div className="p-4 bg-muted/30 rounded-lg">
									<h5 className="font-medium mb-2">Cấu trúc file CSV:</h5>
									<div className="text-sm text-muted-foreground space-y-1">
										<div>• Các cột cơ bản: Tên môn, Kỳ, Tín, TP1, TP2, Thi</div>
										{exportOptions.includeCalculated && (
											<div>• Các cột tính toán: ĐQT, KTHP, KTHP hệ 4, Điểm chữ</div>
										)}
										<div>• Định dạng: UTF-8, phân tách bằng dấu phẩy</div>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="json" className="space-y-4">
							<div className="space-y-4">
								<h4 className="font-medium flex items-center gap-2">
									<Settings className="h-4 w-4" />
									Tùy chọn xuất JSON
								</h4>

								<div className="space-y-3">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="include-calculated-json"
											checked={exportOptions.includeCalculated}
											onCheckedChange={(checked) =>
												updateExportOption('includeCalculated', checked)
											}
										/>
										<Label htmlFor="include-calculated-json" className="text-sm">
											Bao gồm dữ liệu tính toán
										</Label>
									</div>

									{statistics && (
										<>
											<div className="flex items-center space-x-2">
												<Checkbox
													id="include-semester-stats"
													checked={exportOptions.includeSemesterStats}
													onCheckedChange={(checked) =>
														updateExportOption('includeSemesterStats', checked)
													}
												/>
												<Label
													htmlFor="include-semester-stats"
													className="text-sm flex items-center gap-1"
												>
													<Calendar className="h-3 w-3" />
													Bao gồm thống kê theo kỳ
												</Label>
											</div>

											<div className="flex items-center space-x-2">
												<Checkbox
													id="include-overall-stats"
													checked={exportOptions.includeOverallStats}
													onCheckedChange={(checked) =>
														updateExportOption('includeOverallStats', checked)
													}
												/>
												<Label
													htmlFor="include-overall-stats"
													className="text-sm flex items-center gap-1"
												>
													<BarChart3 className="h-3 w-3" />
													Bao gồm thống kê tổng quan
												</Label>
											</div>
										</>
									)}
								</div>

								<div className="p-4 bg-muted/30 rounded-lg">
									<h5 className="font-medium mb-2">Cấu trúc file JSON:</h5>
									<div className="text-sm text-muted-foreground space-y-1">
										<div>• Metadata: Ngày xuất, tổng số bản ghi</div>
										<div>• Mảng grades: Dữ liệu điểm chi tiết</div>
										{exportOptions.includeSemesterStats && (
											<div>• semesterStatistics: Thống kê theo từng kỳ</div>
										)}
										{exportOptions.includeOverallStats && (
											<div>• overallStatistics: Thống kê tổng quan, GPA</div>
										)}
										<div>• Định dạng: JSON chuẩn, UTF-8</div>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>

					{/* Semester Filter */}
					<div className="space-y-4">
						<Separator />
						<div className="space-y-2">
							<Label className="text-sm font-medium">Chọn kỳ học để xuất</Label>
							<Select value={selectedSemester} onValueChange={setSelectedSemester}>
								<SelectTrigger>
									<SelectValue placeholder="Chọn kỳ học" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả các kỳ</SelectItem>
									{semesters.map((semester) => (
										<SelectItem key={semester} value={semester.toString()}>
											Kỳ {semester}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Warnings */}
					{invalidGrades.length > 0 && (
						<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
							<AlertCircle className="h-4 w-4 text-yellow-600" />
							<AlertDescription>
								<strong>Cảnh báo:</strong> Có {invalidGrades.length} bản ghi có lỗi dữ liệu. Các bản
								ghi này sẽ được bao gồm trong file xuất nhưng có thể không chính xác.
							</AlertDescription>
						</Alert>
					)}

					{filteredGrades.length === 0 && (
						<Alert className="border-red-200 bg-red-50 dark:bg-red-950">
							<AlertCircle className="h-4 w-4 text-red-600" />
							<AlertDescription>
								Không có dữ liệu để xuất. Vui lòng kiểm tra lại bộ lọc hoặc nhập dữ liệu.
							</AlertDescription>
						</Alert>
					)}

					{/* Export Button */}
					<div className="flex items-center justify-between pt-4 border-t">
						<div className="text-sm text-muted-foreground">
							Sẽ xuất {filteredGrades.length} bản ghi
							{selectedSemester !== 'all' && ` từ kỳ ${selectedSemester}`}
						</div>
						<Button
							onClick={handleExport}
							disabled={isExporting || filteredGrades.length === 0}
							className="flex items-center gap-2"
						>
							{isExporting ? (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							) : (
								<Download className="h-4 w-4" />
							)}
							{isExporting ? 'Đang xuất...' : `Xuất ${exportOptions.format.toUpperCase()}`}
						</Button>
					</div>

					{/* Export Preview */}
					{filteredGrades.length > 0 && (
						<div className="space-y-4">
							<Separator />
							<div className="space-y-2">
								<h4 className="font-medium">Xem trước dữ liệu xuất</h4>
								<div className="text-sm text-muted-foreground">
									{filteredGrades.slice(0, 3).map((grade, index) => (
										<div key={grade.id} className="p-2 bg-muted/30 rounded text-xs">
											{index + 1}. {grade.tenMon} - Kỳ {grade.ky} - {grade.tin} TC
											{exportOptions.includeCalculated && grade.kthp && (
												<span> - KTHP: {grade.kthp}</span>
											)}
										</div>
									))}
									{filteredGrades.length > 3 && (
										<div className="text-center text-muted-foreground">
											... và {filteredGrades.length - 3} bản ghi khác
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
