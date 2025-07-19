'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCSV } from '@/lib/ts/grades/import-export';
import { ImportResult } from '@/types/grades';

interface SimpleCSVImportProps {
	onImportComplete: (result: ImportResult) => void;
	onImportStart?: () => void;
	className?: string;
}

export function SimpleCSVImport({
	onImportComplete,
	onImportStart,
	className
}: SimpleCSVImportProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);

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
					// Filter out invalid records - only keep valid ones
					const validData = result.data.filter((grade) => grade.isValid);
					result = {
						...result,
						data: validData,
						success: validData.length > 0,
						validRecords: validData.length,
						invalidRecords: 0, // We don't include invalid records
						errors: [], // Clear errors since we're not including invalid data
						warnings: []
					};
				} else {
					result = {
						success: false,
						data: [],
						errors: ['Chỉ hỗ trợ file CSV. Vui lòng chọn file .csv'],
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

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'text/csv': ['.csv']
		},
		multiple: false,
		disabled: isProcessing
	});

	return (
		<div className={className}>
			<Button
				{...getRootProps()}
				variant="outline"
				disabled={isProcessing}
				className="flex items-center gap-2"
			>
				<input {...getInputProps()} />
				<Upload className="h-4 w-4" />
				{isProcessing ? 'Đang xử lý...' : 'Nhập CSV'}
			</Button>

			{/* Import Result */}
			{importResult && (
				<div className="mt-2 max-w-sm">
					{importResult.success ? (
						<Alert>
							<CheckCircle className="h-4 w-4" />
							<AlertDescription>
								Nhập thành công {importResult.validRecords} bản ghi
							</AlertDescription>
						</Alert>
					) : (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								{importResult.errors.length > 0
									? importResult.errors[0]
									: 'Có lỗi xảy ra khi nhập dữ liệu'}
							</AlertDescription>
						</Alert>
					)}
				</div>
			)}
		</div>
	);
}
