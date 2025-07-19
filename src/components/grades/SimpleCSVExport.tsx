'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradeRecord } from '@/types/grades';
import { exportToCSV, downloadFile } from '@/lib/ts/grades/import-export';

interface SimpleCSVExportProps {
	grades: GradeRecord[];
	className?: string;
}

export function SimpleCSVExport({ grades, className }: SimpleCSVExportProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		if (grades.length === 0) {
			return;
		}

		setIsExporting(true);

		try {
			const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
			const csvContent = exportToCSV(grades, {
				format: 'csv',
				includeCalculated: true,
				includeSemesterStats: false,
				includeOverallStats: false
			});
			const filename = `bang_diem_${timestamp}.csv`;
			downloadFile(csvContent, filename, 'text/csv');
		} catch (error) {
			console.error('Export error:', error);
			alert('Có lỗi xảy ra khi xuất dữ liệu');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className={className}>
			<Button
				onClick={handleExport}
				disabled={isExporting || grades.length === 0}
				variant="outline"
				className="flex items-center gap-2"
			>
				{isExporting ? (
					<>
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
						Đang xuất...
					</>
				) : (
					<>
						<Download className="h-4 w-4" />
						Xuất CSV
					</>
				)}
			</Button>
		</div>
	);
}
