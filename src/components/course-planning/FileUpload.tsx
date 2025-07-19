'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoursePlanning } from '@/contexts/CoursePlanningContext';
import { AlertCircle, CheckCircle, FileSpreadsheet, Upload } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
	onSuccess?: () => void;
}

export function FileUpload({ onSuccess }: FileUploadProps) {
	const { processExcelFile, state, clearStoredData } = useCoursePlanning();
	const [title, setTitle] = useState('Học kỳ tín chỉ');
	const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState<string>('');

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (!file) return;

			setUploadStatus('idle');
			setErrorMessage('');

			try {
				const result = await processExcelFile(file, title);

				if (result.success) {
					setUploadStatus('success');
					onSuccess?.();
				} else {
					setUploadStatus('error');
					setErrorMessage(result.error || 'Có lỗi xảy ra khi xử lý file');
				}
			} catch (error) {
				setUploadStatus('error');
				setErrorMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra');
			}
		},
		[processExcelFile, title, onSuccess]
	);

	const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
		onDrop,
		accept: {
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'application/vnd.ms-excel': ['.xls']
		},
		maxFiles: 1,
		disabled: state.loading
	});

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileSpreadsheet className="h-5 w-5" />
					Tải lên file Excel tín chỉ
				</CardTitle>
				<CardDescription>
					Tải lên file Excel chứa thông tin các môn học và lớp học để bắt đầu lập lịch
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* File Drop Zone */}
				<div
					{...getRootProps()}
					className={`
						border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
						${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : ''}
						${isDragReject ? 'border-destructive bg-destructive/5' : ''}
						${state.loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
						${uploadStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
						${uploadStatus === 'error' ? 'border-destructive bg-destructive/5' : ''}
					`}
				>
					<input {...getInputProps()} />

					<div className="flex flex-col items-center space-y-4">
						{state.loading ? (
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						) : uploadStatus === 'success' ? (
							<CheckCircle className="h-12 w-12 text-green-500" />
						) : uploadStatus === 'error' ? (
							<AlertCircle className="h-12 w-12 text-destructive" />
						) : (
							<Upload className="h-12 w-12 text-muted-foreground" />
						)}

						<div className="space-y-2">
							{state.loading ? (
								<p className="text-sm text-muted-foreground">Đang xử lý file...</p>
							) : uploadStatus === 'success' ? (
								<>
									<p className="text-sm font-medium text-green-600 dark:text-green-400">
										File đã được tải lên thành công!
									</p>
									<p className="text-xs text-muted-foreground">
										Bạn có thể tiếp tục chọn môn học và tạo lịch
									</p>
								</>
							) : uploadStatus === 'error' ? (
								<>
									<p className="text-sm font-medium text-destructive">
										Có lỗi xảy ra khi xử lý file
									</p>
									<p className="text-xs text-muted-foreground">Vui lòng thử lại với file khác</p>
								</>
							) : isDragActive ? (
								<p className="text-sm text-primary">Thả file vào đây...</p>
							) : (
								<>
									<p className="text-sm text-muted-foreground">
										Kéo thả file Excel vào đây hoặc click để chọn file
									</p>
									<p className="text-xs text-muted-foreground">Hỗ trợ file .xlsx và .xls</p>
								</>
							)}
						</div>

						{!state.loading && uploadStatus !== 'success' && (
							<Button variant="outline" size="sm" disabled={state.loading}>
								Chọn file
							</Button>
						)}
					</div>
				</div>

				{/* Error Alert */}
				{(uploadStatus === 'error' || state.error) && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{errorMessage || state.error || 'Có lỗi xảy ra khi xử lý file'}
						</AlertDescription>
					</Alert>
				)}

				{/* Success Alert */}
				{uploadStatus === 'success' && state.calendar && (
					<Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<AlertDescription className="text-green-800 dark:text-green-200">
							Đã tải thành công {Object.keys(state.calendar.majors).length} chuyên ngành với{' '}
							{Object.values(state.calendar.majors).reduce(
								(total, major) => total + Object.keys(major).length,
								0
							)}{' '}
							môn học
						</AlertDescription>
					</Alert>
				)}

				{/* Instructions */}
				<div className="text-xs text-muted-foreground space-y-1">
					<p>
						<strong>Lưu ý:</strong>
					</p>
					<ul className="list-disc list-inside space-y-1 ml-2">
						<li>
							File Excel phải có định dạng chuẩn với các cột: Lớp học, Thứ, Tiết, Ngày bắt đầu, Ngày
							kết thúc, Giảng viên
						</li>
						<li>Mỗi sheet trong file tương ứng với một chuyên ngành</li>
						<li>Dữ liệu phải bắt đầu từ dòng 5 (có thể tùy chỉnh trong cấu hình)</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
