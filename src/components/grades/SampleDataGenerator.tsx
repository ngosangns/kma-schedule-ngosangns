'use client';

import React from 'react';
import { Download, FileText, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { downloadFile } from '@/lib/ts/grades/import-export';

const SAMPLE_CSV_DATA = `Tên môn|Kỳ|Tín|TP1|TP2|Thi
Toán cao cấp A1|1|4|8.5|9.0|7.5
Vật lý đại cương|1|3|7.0|8.5|6.5
Hóa học đại cương|1|3|9.0|8.0|8.5
Tiếng Anh 1|1|3|8.0|9.5|7.0
Giáo dục thể chất 1|1|1|8.5|9.0|8.0
Lập trình C|2|4|7.5|8.0|8.5
Cấu trúc dữ liệu|2|3|8.0|7.5|9.0
Cơ sở dữ liệu|2|3|6.5|7.0|7.5
Tiếng Anh 2|2|3|7.0|8.0|6.0
Giáo dục quốc phòng|2|2|9.0|9.5|9.0`;

const SAMPLE_JSON_DATA = [
	{
		'Tên môn': 'Toán cao cấp A1',
		Kỳ: 1,
		Tín: 4,
		TP1: 8.5,
		TP2: 9.0,
		Thi: 7.5
	},
	{
		'Tên môn': 'Vật lý đại cương',
		Kỳ: 1,
		Tín: 3,
		TP1: 7.0,
		TP2: 8.5,
		Thi: 6.5
	},
	{
		'Tên môn': 'Hóa học đại cương',
		Kỳ: 1,
		Tín: 3,
		TP1: 9.0,
		TP2: 8.0,
		Thi: 8.5
	},
	{
		'Tên môn': 'Tiếng Anh 1',
		Kỳ: 1,
		Tín: 3,
		TP1: 8.0,
		TP2: 9.5,
		Thi: 7.0
	},
	{
		'Tên môn': 'Giáo dục thể chất 1',
		Kỳ: 1,
		Tín: 1,
		TP1: 8.5,
		TP2: 9.0,
		Thi: 8.0
	},
	{
		'Tên môn': 'Lập trình C',
		Kỳ: 2,
		Tín: 4,
		TP1: 7.5,
		TP2: 8.0,
		Thi: 8.5
	},
	{
		'Tên môn': 'Cấu trúc dữ liệu',
		Kỳ: 2,
		Tín: 3,
		TP1: 8.0,
		TP2: 7.5,
		Thi: 9.0
	},
	{
		'Tên môn': 'Cơ sở dữ liệu',
		Kỳ: 2,
		Tín: 3,
		TP1: 6.5,
		TP2: 7.0,
		Thi: 7.5
	},
	{
		'Tên môn': 'Tiếng Anh 2',
		Kỳ: 2,
		Tín: 3,
		TP1: 7.0,
		TP2: 8.0,
		Thi: 6.0
	},
	{
		'Tên môn': 'Giáo dục quốc phòng',
		Kỳ: 2,
		Tín: 2,
		TP1: 9.0,
		TP2: 9.5,
		Thi: 9.0
	}
];

interface SampleDataGeneratorProps {
	className?: string;
}

export function SampleDataGenerator({ className }: SampleDataGeneratorProps) {
	const downloadSampleCSV = () => {
		downloadFile(SAMPLE_CSV_DATA, 'sample-grades.csv', 'text/csv');
	};

	const downloadSampleJSON = () => {
		const jsonContent = JSON.stringify(SAMPLE_JSON_DATA, null, 2);
		downloadFile(jsonContent, 'sample-grades.json', 'application/json');
	};

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Dữ liệu mẫu
					</CardTitle>
					<CardDescription>Tải xuống file mẫu để hiểu định dạng dữ liệu yêu cầu</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="csv" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="csv">CSV Format</TabsTrigger>
							<TabsTrigger value="json">JSON Format</TabsTrigger>
						</TabsList>

						<TabsContent value="csv" className="space-y-4">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h4 className="font-medium">File CSV mẫu</h4>
									<Button onClick={downloadSampleCSV} size="sm">
										<Download className="h-4 w-4 mr-2" />
										Tải xuống CSV
									</Button>
								</div>

								<div className="bg-muted p-4 rounded-lg">
									<pre className="text-sm overflow-x-auto whitespace-pre-wrap">
										{SAMPLE_CSV_DATA}
									</pre>
								</div>

								<div className="space-y-2">
									<h5 className="font-medium text-sm">Lưu ý về định dạng CSV:</h5>
									<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
										<li>Dòng đầu tiên phải chứa tên các cột</li>
										<li>Sử dụng dấu phẩy (,) để phân tách các cột</li>
										<li>Điểm số có thể để trống nếu chưa có</li>
										<li>Kỳ học và số tín chỉ phải là số nguyên</li>
										<li>Điểm số phải từ 0 đến 10</li>
									</ul>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="json" className="space-y-4">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h4 className="font-medium">File JSON mẫu</h4>
									<Button onClick={downloadSampleJSON} size="sm">
										<Download className="h-4 w-4 mr-2" />
										Tải xuống JSON
									</Button>
								</div>

								<div className="bg-muted p-4 rounded-lg">
									<pre className="text-sm overflow-x-auto">
										{JSON.stringify(SAMPLE_JSON_DATA.slice(0, 3), null, 2)}
										{SAMPLE_JSON_DATA.length > 3 && '\n  // ... và các môn học khác'}
									</pre>
								</div>

								<div className="space-y-2">
									<h5 className="font-medium text-sm">Lưu ý về định dạng JSON:</h5>
									<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
										<li>Phải là một mảng các đối tượng JSON</li>
										<li>Mỗi đối tượng đại diện cho một môn học</li>
										<li>Tên trường phải chính xác như mẫu</li>
										<li>Điểm số có thể là null nếu chưa có</li>
										<li>Sử dụng UTF-8 encoding</li>
									</ul>
								</div>
							</div>
						</TabsContent>
					</Tabs>

					{/* Field Descriptions */}
					<div className="mt-6 space-y-4">
						<h4 className="font-medium">Mô tả các trường dữ liệu:</h4>
						<div className="grid gap-3">
							<div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
								<div className="font-medium text-sm min-w-20">Tên môn:</div>
								<div className="text-sm text-muted-foreground">Tên đầy đủ của môn học</div>
							</div>
							<div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
								<div className="font-medium text-sm min-w-20">Kỳ:</div>
								<div className="text-sm text-muted-foreground">Số thứ tự học kỳ (1, 2, 3, ...)</div>
							</div>
							<div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
								<div className="font-medium text-sm min-w-20">Tín:</div>
								<div className="text-sm text-muted-foreground">Số tín chỉ của môn học</div>
							</div>
							<div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
								<div className="font-medium text-sm min-w-20">TP1:</div>
								<div className="text-sm text-muted-foreground">
									Thành phần 1 - Điểm giữa kỳ (0-10)
								</div>
							</div>
							<div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
								<div className="font-medium text-sm min-w-20">TP2:</div>
								<div className="text-sm text-muted-foreground">
									Thành phần 2 - Điểm chuyên cần (0-10)
								</div>
							</div>
							<div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
								<div className="font-medium text-sm min-w-20">Thi:</div>
								<div className="text-sm text-muted-foreground">Điểm thi cuối kỳ (0-10)</div>
							</div>
						</div>
					</div>

					{/* Calculation Info */}
					<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
						<h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
							<Code className="h-4 w-4" />
							Công thức tính điểm
						</h5>
						<div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
							<div>
								<strong>ĐQT</strong> = 0.3 × TP2 + 0.7 × TP1
							</div>
							<div>
								<strong>KTHP</strong> = 0.3 × ĐQT + 0.7 × Thi
							</div>
							<div className="text-xs mt-2 opacity-75">
								Hệ thống sẽ tự động tính toán ĐQT và KTHP dựa trên các điểm thành phần
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
