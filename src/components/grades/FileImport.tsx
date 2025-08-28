'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Separator } from '@/components/ui/separator';
import { parseCSV, parseJSON } from '@/lib/ts/grades/import-export';
import { ImportResult } from '@/types/grades';

interface FileImportProps {
	onImportComplete: (result: ImportResult) => void;
	onImportStart?: () => void;
	className?: string;
}

export function FileImport({ onImportComplete, onImportStart, className }: FileImportProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);
	const [dragActive, setDragActive] = useState(false);

	const processFile = useCallback(
		async (file: File) => {
			setIsProcessing(true);
			setImportResult(null);
			onImportStart?.();

			try {
				const content = await file.text();
				let result: ImportResult;

				if (file.name.toLowerCase().endsWith('.csv')) {
					result = await parseCSV(content);
				} else if (file.name.toLowerCase().endsWith('.json')) {
					result = parseJSON(content);
				} else {
					result = {
						success: false,
						data: [],
						errors: ['Định dạng file không được hỗ trợ. Chỉ chấp nhận file .csv hoặc .json'],
						warnings: [],
						totalRecords: 0,
						validRecords: 0,
						invalidRecords: 0
					};
				}

				setImportResult(result);
				onImportComplete(result);
			} catch (error) {
				const errorResult: ImportResult = {
					success: false,
					data: [],
					errors: [
						`Lỗi đọc file: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
					],
					warnings: [],
					totalRecords: 0,
					validRecords: 0,
					invalidRecords: 0
				};
				setImportResult(errorResult);
				onImportComplete(errorResult);
			} finally {
				setIsProcessing(false);
			}
		},
		[onImportComplete, onImportStart]
	);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0 && acceptedFiles[0]) {
				processFile(acceptedFiles[0]);
			}
		},
		[processFile]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'text/csv': ['.csv'],
			'application/json': ['.json']
		},
		multiple: false,
		disabled: isProcessing,
		onDragEnter: () => setDragActive(true),
		onDragLeave: () => setDragActive(false)
	});

	const clearResult = () => {
		setImportResult(null);
	};

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Nhập dữ liệu điểm
					</CardTitle>
					<CardDescription>Tải lên file CSV hoặc JSON chứa dữ liệu điểm của bạn</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* File Upload Area */}
					<div
						{...getRootProps()}
						className={`
							border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
							${
								isDragActive || dragActive
									? 'border-primary bg-primary/5'
									: 'border-muted-foreground/25 hover:border-primary/50'
							}
							${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
						`}
					>
						<input {...getInputProps()} />
						<div className="flex flex-col items-center gap-4">
							<div className="p-4 rounded-full bg-muted">
								<FileText className="h-8 w-8 text-muted-foreground" />
							</div>
							<div>
								<p className="text-lg font-medium">
									{isDragActive || dragActive
										? 'Thả file vào đây...'
										: 'Kéo thả file hoặc click để chọn'}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									Hỗ trợ file .csv và .json (tối đa 10MB)
								</p>
							</div>
							{isProcessing && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
									Đang xử lý file...
								</div>
							)}
						</div>
					</div>

					{/* Format Guide */}
					<div className="space-y-4">
						<h4 className="font-medium">Định dạng dữ liệu yêu cầu:</h4>
						<div className="grid md:grid-cols-2 gap-4">
							<Card className="p-4">
								<h5 className="font-medium mb-2">File CSV</h5>
								<div className="text-sm text-muted-foreground space-y-1">
									<p>Các cột bắt buộc:</p>
									<ul className="list-disc list-inside space-y-1 ml-2">
										<li>Tên môn</li>
										<li>Kỳ</li>
										<li>Tín</li>
										<li>TP1 (Điểm giữa kỳ)</li>
										<li>TP2 (Điểm chuyên cần)</li>
										<li>Thi (Điểm cuối kỳ)</li>
									</ul>
								</div>
							</Card>
							<Card className="p-4">
								<h5 className="font-medium mb-2">File JSON</h5>
								<div className="text-sm text-muted-foreground space-y-1">
									<p>Cấu trúc:</p>
									<pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
										{`[
  {
    "Tên môn": "Toán cao cấp",
    "Kỳ": 1,
    "Tín": 3,
    "TP1": 8.5,
    "TP2": 9.0,
    "Thi": 7.5
  }
]`}
									</pre>
								</div>
							</Card>
						</div>
					</div>

					{/* Import Result */}
					{importResult && (
						<div className="space-y-4">
							<Separator />
							<div className="flex items-center justify-between">
								<h4 className="font-medium">Kết quả nhập dữ liệu</h4>
								<Button variant="ghost" size="sm" onClick={clearResult}>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Summary */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center p-3 bg-muted rounded-lg">
									<div className="text-2xl font-bold">{importResult.totalRecords}</div>
									<div className="text-sm text-muted-foreground">Tổng số bản ghi</div>
								</div>
								<div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
									<div className="text-2xl font-bold text-green-600">
										{importResult.validRecords}
									</div>
									<div className="text-sm text-muted-foreground">Hợp lệ</div>
								</div>
								<div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
									<div className="text-2xl font-bold text-red-600">
										{importResult.invalidRecords}
									</div>
									<div className="text-sm text-muted-foreground">Lỗi</div>
								</div>
								<div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
									<div className="text-2xl font-bold text-yellow-600">
										{importResult.warnings.length}
									</div>
									<div className="text-sm text-muted-foreground">Cảnh báo</div>
								</div>
							</div>

							{/* Status */}
							<Alert
								className={
									importResult.success
										? 'border-green-200 bg-green-50 dark:bg-green-950'
										: 'border-red-200 bg-red-50 dark:bg-red-950'
								}
							>
								{importResult.success ? (
									<CheckCircle className="h-4 w-4 text-green-600" />
								) : (
									<AlertCircle className="h-4 w-4 text-red-600" />
								)}
								<AlertDescription>
									{importResult.success
										? `Nhập dữ liệu thành công! ${importResult.validRecords} bản ghi đã được xử lý.`
										: 'Nhập dữ liệu thất bại. Vui lòng kiểm tra lại định dạng file.'}
								</AlertDescription>
							</Alert>

							{/* Errors */}
							{importResult.errors.length > 0 && (
								<div className="space-y-2">
									<h5 className="font-medium text-red-600 flex items-center gap-2">
										<AlertCircle className="h-4 w-4" />
										Lỗi ({importResult.errors.length})
									</h5>
									<div className="space-y-1 max-h-32 overflow-y-auto">
										{importResult.errors.map((error, index) => (
											<div
												key={index}
												className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded border-l-4 border-red-500"
											>
												{error}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Warnings */}
							{importResult.warnings.length > 0 && (
								<div className="space-y-2">
									<h5 className="font-medium text-yellow-600 flex items-center gap-2">
										<AlertCircle className="h-4 w-4" />
										Cảnh báo ({importResult.warnings.length})
									</h5>
									<div className="space-y-1 max-h-32 overflow-y-auto">
										{importResult.warnings.map((warning, index) => (
											<div
												key={index}
												className="text-sm p-2 bg-yellow-50 dark:bg-yellow-950 rounded border-l-4 border-yellow-500"
											>
												{warning}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
