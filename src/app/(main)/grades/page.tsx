'use client';

import React, { useState, useEffect } from 'react';
import {
	Upload,
	Table,
	BarChart3,
	Download,
	CheckCircle,
	AlertTriangle,
	Smartphone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Grade Management Components
import { FileImport } from '@/components/grades/FileImport';
import { SampleDataGenerator } from '@/components/grades/SampleDataGenerator';
import { ManualDataEntry } from '@/components/grades/ManualDataEntry';
import { GradeTable } from '@/components/grades/GradeTable';
import { GradeCards } from '@/components/grades/GradeCards';
import { StatisticsDashboard } from '@/components/grades/StatisticsDashboard';
import { ValidationSummary } from '@/components/grades/ValidationSummary';
import { DataExport } from '@/components/grades/DataExport';

// Types and Utils
import { GradeRecord, ImportResult } from '@/types/grades';
import { calculateOverallStats } from '@/lib/ts/grades/calculations';

export default function GradesPage() {
	const [grades, setGrades] = useState<GradeRecord[]>([]);
	const [activeTab, setActiveTab] = useState('import');
	const [isMobile, setIsMobile] = useState(false);
	const [_lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);
	const { toast } = useToast();

	// Check if mobile view
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Load data from localStorage on mount
	useEffect(() => {
		const savedGrades = localStorage.getItem('grades-data');
		if (savedGrades) {
			try {
				const parsedGrades = JSON.parse(savedGrades);
				setGrades(parsedGrades);
			} catch (error) {
				console.error('Error loading saved grades:', error);
			}
		}
	}, []);

	// Save data to localStorage when grades change
	useEffect(() => {
		if (grades.length > 0) {
			localStorage.setItem('grades-data', JSON.stringify(grades));
		}
	}, [grades]);

	const handleImportComplete = (result: ImportResult) => {
		setLastImportResult(result);

		if (result.success && result.data.length > 0) {
			setGrades(result.data);
			toast({
				title: 'Nhập dữ liệu thành công!',
				description: `Đã nhập ${result.validRecords} bản ghi hợp lệ.`
			});

			// Auto-switch to table view after successful import
			setTimeout(() => {
				setActiveTab('table');
			}, 1500);
		} else {
			toast({
				title: 'Nhập dữ liệu thất bại',
				description: result.errors[0] || 'Có lỗi xảy ra khi nhập dữ liệu.',
				variant: 'destructive'
			});
		}
	};

	const handleManualDataChange = (newGrades: GradeRecord[]) => {
		setGrades(newGrades);
		if (newGrades.length > 0) {
			toast({
				title: 'Dữ liệu đã được cập nhật',
				description: `Hiện có ${newGrades.length} bản ghi.`
			});
		}
	};

	const clearAllData = () => {
		if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
			setGrades([]);
			setLastImportResult(null);
			localStorage.removeItem('grades-data');
			toast({
				title: 'Đã xóa tất cả dữ liệu',
				description: 'Tất cả dữ liệu điểm đã được xóa.'
			});
			setActiveTab('import');
		}
	};

	const statistics = grades.length > 0 ? calculateOverallStats(grades) : null;
	const validGrades = grades.filter((g) => g.isValid);
	const invalidGrades = grades.filter((g) => !g.isValid);

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Quản lý bảng điểm</h1>
						<p className="text-muted-foreground">Nhập, xem và phân tích điểm số các môn học</p>
					</div>
					{grades.length > 0 && (
						<Button variant="destructive" onClick={clearAllData}>
							Xóa tất cả dữ liệu
						</Button>
					)}
				</div>

				{/* Quick Stats */}
				{grades.length > 0 && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold">{grades.length}</div>
								<div className="text-sm text-muted-foreground">Tổng môn học</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600">{validGrades.length}</div>
								<div className="text-sm text-muted-foreground">Hợp lệ</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600">
									{statistics?.overallGPA10?.toFixed(2) || 'N/A'}
								</div>
								<div className="text-sm text-muted-foreground">GPA Hệ 10</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-purple-600">
									{statistics?.totalCredits || 0}
								</div>
								<div className="text-sm text-muted-foreground">Tổng tín chỉ</div>
							</div>
						</Card>
					</div>
				)}

				{/* Validation Alert */}
				{invalidGrades.length > 0 && (
					<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
						<AlertTriangle className="h-4 w-4 text-yellow-600" />
						<AlertDescription>
							Có {invalidGrades.length} bản ghi có lỗi dữ liệu.
							<Button
								variant="link"
								className="p-0 h-auto text-yellow-700 dark:text-yellow-300"
								onClick={() => setActiveTab('validation')}
							>
								Kiểm tra chi tiết
							</Button>
						</AlertDescription>
					</Alert>
				)}
			</div>

			{/* Main Content */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
					<TabsTrigger value="import" className="flex items-center gap-2">
						<Upload className="h-4 w-4" />
						<span className="hidden sm:inline">Nhập dữ liệu</span>
						<span className="sm:hidden">Nhập</span>
					</TabsTrigger>
					<TabsTrigger value="table" className="flex items-center gap-2">
						{isMobile ? <Smartphone className="h-4 w-4" /> : <Table className="h-4 w-4" />}
						<span className="hidden sm:inline">Bảng điểm</span>
						<span className="sm:hidden">Bảng</span>
						{grades.length > 0 && (
							<Badge variant="secondary" className="ml-1 text-xs">
								{grades.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="statistics" className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						<span className="hidden sm:inline">Thống kê</span>
						<span className="sm:hidden">TK</span>
					</TabsTrigger>
					<TabsTrigger value="validation" className="flex items-center gap-2">
						{invalidGrades.length > 0 ? (
							<AlertTriangle className="h-4 w-4 text-yellow-600" />
						) : (
							<CheckCircle className="h-4 w-4 text-green-600" />
						)}
						<span className="hidden sm:inline">Kiểm tra</span>
						<span className="sm:hidden">KT</span>
						{invalidGrades.length > 0 && (
							<Badge variant="destructive" className="ml-1 text-xs">
								{invalidGrades.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="export" className="flex items-center gap-2">
						<Download className="h-4 w-4" />
						<span className="hidden sm:inline">Xuất dữ liệu</span>
						<span className="sm:hidden">Xuất</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="import" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<FileImport onImportComplete={handleImportComplete} className="lg:col-span-1" />
						<SampleDataGenerator className="lg:col-span-1" />
					</div>
					<Separator />
					<ManualDataEntry onGradesChange={handleManualDataChange} initialGrades={grades} />
				</TabsContent>

				<TabsContent value="table" className="space-y-6">
					{grades.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center">
								<Table className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-medium mb-2">Chưa có dữ liệu điểm</h3>
								<p className="text-muted-foreground mb-4">
									Hãy nhập dữ liệu từ file hoặc thêm thủ công để bắt đầu.
								</p>
								<Button onClick={() => setActiveTab('import')}>Nhập dữ liệu ngay</Button>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-6">
							{/* Desktop Table View */}
							<div className="hidden md:block">
								<GradeTable grades={grades} />
							</div>

							{/* Mobile Card View */}
							<div className="md:hidden">
								<GradeCards grades={grades} />
							</div>
						</div>
					)}
				</TabsContent>

				<TabsContent value="statistics" className="space-y-6">
					{grades.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center">
								<BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-medium mb-2">Chưa có dữ liệu để thống kê</h3>
								<p className="text-muted-foreground mb-4">
									Nhập dữ liệu điểm để xem các thống kê chi tiết.
								</p>
								<Button onClick={() => setActiveTab('import')}>Nhập dữ liệu ngay</Button>
							</CardContent>
						</Card>
					) : (
						<StatisticsDashboard grades={grades} />
					)}
				</TabsContent>

				<TabsContent value="validation" className="space-y-6">
					<ValidationSummary grades={grades} />
				</TabsContent>

				<TabsContent value="export" className="space-y-6">
					{grades.length === 0 || !statistics ? (
						<Card>
							<CardContent className="p-8 text-center">
								<Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-medium mb-2">Chưa có dữ liệu để xuất</h3>
								<p className="text-muted-foreground mb-4">Nhập dữ liệu điểm trước khi xuất file.</p>
								<Button onClick={() => setActiveTab('import')}>Nhập dữ liệu ngay</Button>
							</CardContent>
						</Card>
					) : (
						<DataExport grades={grades} statistics={statistics} />
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
