'use client';

import React, { useMemo } from 'react';
import { 
	AlertTriangle, 
	CheckCircle, 
	Info, 
	XCircle,
	FileX,
	Calculator,
	Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GradeRecord } from '@/types/grades';
import { 
	validateGradeRecords, 
	getValidationSummary, 
	isDataCompleteForGPA 
} from '@/lib/ts/grades/validation';

interface ValidationSummaryProps {
	grades: GradeRecord[];
	onFixErrors?: (gradeId: string) => void;
	className?: string;
}

export function ValidationSummary({ grades, onFixErrors, className }: ValidationSummaryProps) {
	const validationErrors = useMemo(() => validateGradeRecords(grades), [grades]);
	const validationSummary = useMemo(() => getValidationSummary(validationErrors), [validationErrors]);
	const gpaCompleteness = useMemo(() => isDataCompleteForGPA(grades), [grades]);

	// Group errors by record
	const errorsByRecord = useMemo(() => {
		const grouped = validationErrors.reduce((acc, error) => {
			if (!acc[error.recordId]) {
				acc[error.recordId] = [];
			}
			acc[error.recordId].push(error);
			return acc;
		}, {} as Record<string, typeof validationErrors>);

		return Object.entries(grouped).map(([recordId, errors]) => {
			const grade = grades.find(g => g.id === recordId);
			return {
				recordId,
				grade,
				errors: errors.filter(e => e.severity === 'error'),
				warnings: errors.filter(e => e.severity === 'warning')
			};
		});
	}, [validationErrors, grades]);

	const hasErrors = validationSummary.totalErrors > 0;
	const hasWarnings = validationSummary.totalWarnings > 0;
	const isDataComplete = gpaCompleteness.isComplete;

	if (grades.length === 0) {
		return (
			<div className={className}>
				<Card>
					<CardContent className="p-6 text-center">
						<FileX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground">Chưa có dữ liệu điểm để kiểm tra</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{hasErrors ? (
							<XCircle className="h-5 w-5 text-red-600" />
						) : hasWarnings ? (
							<AlertTriangle className="h-5 w-5 text-yellow-600" />
						) : (
							<CheckCircle className="h-5 w-5 text-green-600" />
						)}
						Kiểm tra dữ liệu
					</CardTitle>
					<CardDescription>
						Tình trạng và chất lượng dữ liệu điểm
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Overall Status */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 bg-muted/30 rounded-lg">
							<div className="text-2xl font-bold">{grades.length}</div>
							<div className="text-sm text-muted-foreground">Tổng số bản ghi</div>
						</div>
						<div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
							<div className="text-2xl font-bold text-red-600">{validationSummary.totalErrors}</div>
							<div className="text-sm text-muted-foreground">Lỗi nghiêm trọng</div>
						</div>
						<div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
							<div className="text-2xl font-bold text-yellow-600">{validationSummary.totalWarnings}</div>
							<div className="text-sm text-muted-foreground">Cảnh báo</div>
						</div>
					</div>

					{/* Status Alerts */}
					{hasErrors && (
						<Alert className="border-red-200 bg-red-50 dark:bg-red-950">
							<XCircle className="h-4 w-4 text-red-600" />
							<AlertDescription>
								<strong>Có {validationSummary.totalErrors} lỗi nghiêm trọng</strong> cần được sửa chữa. 
								Dữ liệu không thể được sử dụng để tính toán chính xác cho đến khi các lỗi này được khắc phục.
							</AlertDescription>
						</Alert>
					)}

					{hasWarnings && !hasErrors && (
						<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
							<AlertTriangle className="h-4 w-4 text-yellow-600" />
							<AlertDescription>
								<strong>Có {validationSummary.totalWarnings} cảnh báo.</strong> 
								Dữ liệu có thể được sử dụng nhưng nên kiểm tra lại để đảm bảo tính chính xác.
							</AlertDescription>
						</Alert>
					)}

					{!hasErrors && !hasWarnings && (
						<Alert className="border-green-200 bg-green-50 dark:bg-green-950">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<AlertDescription>
								<strong>Dữ liệu hoàn toàn hợp lệ!</strong> 
								Tất cả bản ghi đều đạt tiêu chuẩn và sẵn sàng để tính toán.
							</AlertDescription>
						</Alert>
					)}

					{/* GPA Calculation Readiness */}
					<div className="space-y-4">
						<h4 className="font-medium flex items-center gap-2">
							<Calculator className="h-4 w-4" />
							Tính toán GPA
						</h4>
						
						{isDataComplete ? (
							<Alert className="border-green-200 bg-green-50 dark:bg-green-950">
								<Target className="h-4 w-4 text-green-600" />
								<AlertDescription>
									Dữ liệu đầy đủ để tính toán GPA chính xác. 
									Có {gpaCompleteness.totalGradableSubjects} môn học được tính vào GPA.
								</AlertDescription>
							</Alert>
						) : (
							<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
								<Info className="h-4 w-4 text-yellow-600" />
								<AlertDescription>
									<div className="space-y-2">
										<div>
											<strong>Dữ liệu chưa đầy đủ để tính GPA chính xác:</strong>
										</div>
										<ul className="list-disc list-inside space-y-1 text-sm">
											{gpaCompleteness.issues.map((issue, index) => (
												<li key={index}>{issue}</li>
											))}
										</ul>
										<div className="text-sm">
											Có thể tính toán với {gpaCompleteness.totalGradableSubjects - gpaCompleteness.missingDataCount} / {gpaCompleteness.totalGradableSubjects} môn học.
										</div>
									</div>
								</AlertDescription>
							</Alert>
						)}
					</div>

					{/* Error Details */}
					{errorsByRecord.length > 0 && (
						<div className="space-y-4">
							<Separator />
							<div className="flex items-center justify-between">
								<h4 className="font-medium">Chi tiết lỗi và cảnh báo</h4>
								<Badge variant="outline">
									{errorsByRecord.length} bản ghi có vấn đề
								</Badge>
							</div>

							<Collapsible>
								<CollapsibleTrigger asChild>
									<Button variant="outline" className="w-full">
										Xem chi tiết ({errorsByRecord.length} bản ghi)
									</Button>
								</CollapsibleTrigger>
								<CollapsibleContent className="space-y-3 mt-4">
									{errorsByRecord.map(({ recordId, grade, errors, warnings }) => (
										<Card key={recordId} className="p-4">
											<div className="space-y-3">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<h5 className="font-medium">
															{grade?.tenMon || 'Môn học không xác định'}
														</h5>
														<div className="text-sm text-muted-foreground">
															Kỳ {grade?.ky} • {grade?.tin} tín chỉ
														</div>
													</div>
													{onFixErrors && (
														<Button 
															size="sm" 
															variant="outline"
															onClick={() => onFixErrors(recordId)}
														>
															Sửa
														</Button>
													)}
												</div>

												{errors.length > 0 && (
													<div className="space-y-1">
														<div className="text-sm font-medium text-red-600 flex items-center gap-1">
															<XCircle className="h-3 w-3" />
															Lỗi ({errors.length})
														</div>
														{errors.map((error, index) => (
															<div key={index} className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded border-l-4 border-red-500">
																<strong>{error.field}:</strong> {error.message}
															</div>
														))}
													</div>
												)}

												{warnings.length > 0 && (
													<div className="space-y-1">
														<div className="text-sm font-medium text-yellow-600 flex items-center gap-1">
															<AlertTriangle className="h-3 w-3" />
															Cảnh báo ({warnings.length})
														</div>
														{warnings.map((warning, index) => (
															<div key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-950 rounded border-l-4 border-yellow-500">
																<strong>{warning.field}:</strong> {warning.message}
															</div>
														))}
													</div>
												)}
											</div>
										</Card>
									))}
								</CollapsibleContent>
							</Collapsible>
						</div>
					)}

					{/* Field Error Summary */}
					{(Object.keys(validationSummary.errorsByField).length > 0 || Object.keys(validationSummary.warningsByField).length > 0) && (
						<div className="space-y-4">
							<Separator />
							<h4 className="font-medium">Thống kê lỗi theo trường</h4>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{Object.keys(validationSummary.errorsByField).length > 0 && (
									<div className="space-y-2">
										<h5 className="text-sm font-medium text-red-600">Lỗi nghiêm trọng</h5>
										{Object.entries(validationSummary.errorsByField).map(([field, count]) => (
											<div key={field} className="flex justify-between text-sm">
												<span>{field}</span>
												<Badge variant="destructive" className="text-xs">{count}</Badge>
											</div>
										))}
									</div>
								)}

								{Object.keys(validationSummary.warningsByField).length > 0 && (
									<div className="space-y-2">
										<h5 className="text-sm font-medium text-yellow-600">Cảnh báo</h5>
										{Object.entries(validationSummary.warningsByField).map(([field, count]) => (
											<div key={field} className="flex justify-between text-sm">
												<span>{field}</span>
												<Badge variant="outline" className="text-xs">{count}</Badge>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
