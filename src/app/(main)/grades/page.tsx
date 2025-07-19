'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Table, BarChart3, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Grade Management Components
import { GradeTable } from '@/components/grades/GradeTable';
import { GradeCards } from '@/components/grades/GradeCards';
import { StatisticsDashboard } from '@/components/grades/StatisticsDashboard';

// Types and Utils
import { GradeRecord, ImportResult } from '@/types/grades';
import { calculateOverallStats } from '@/lib/ts/grades/calculations';

export default function GradesPage() {
	const [grades, setGrades] = useState<GradeRecord[]>([]);
	const [activeTab, setActiveTab] = useState('table');
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

			// No need to switch tabs since import/export are now in the table tab
		} else {
			toast({
				title: 'Nhập dữ liệu thất bại',
				description: result.errors[0] || 'Có lỗi xảy ra khi nhập dữ liệu.',
				variant: 'destructive'
			});
		}
	};

	// Enhanced table handlers
	const handleGradeAdd = (gradeData: Omit<GradeRecord, 'id'>) => {
		const newGrade = {
			...gradeData,
			id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		};
		const newGrades = [...grades, newGrade];
		setGrades(newGrades);
		toast({
			title: 'Đã thêm môn học',
			description: `Môn "${gradeData.tenMon}" đã được thêm thành công.`
		});
	};

	const handleGradeEdit = (gradeId: string, updatedGradeData: Omit<GradeRecord, 'id'>) => {
		const newGrades = grades.map((grade) =>
			grade.id === gradeId ? { ...updatedGradeData, id: gradeId } : grade
		);
		setGrades(newGrades);
		toast({
			title: 'Đã cập nhật môn học',
			description: `Môn "${updatedGradeData.tenMon}" đã được cập nhật thành công.`
		});
	};

	const handleGradeDelete = (gradeId: string) => {
		const gradeToDelete = grades.find((g) => g.id === gradeId);
		const newGrades = grades.filter((grade) => grade.id !== gradeId);
		setGrades(newGrades);
		toast({
			title: 'Đã xóa môn học',
			description: `Môn "${gradeToDelete?.tenMon || 'không xác định'}" đã được xóa.`
		});
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
		}
	};

	const statistics = useMemo(() => {
		return grades.length > 0 ? calculateOverallStats(grades) : null;
	}, [grades]);

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
								<div className="text-2xl font-bold text-green-600">
									{statistics?.overallGPA4?.toFixed(1) || 'N/A'}
								</div>
								<div className="text-sm text-muted-foreground">GPA Hệ 4</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600">
									{statistics?.overallGPA10?.toFixed(1) || 'N/A'}
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
			</div>

			{/* Main Content */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
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
				</TabsList>

				<TabsContent value="table" className="space-y-6">
					{/* Table Section */}
					{grades.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center">
								<Table className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-medium mb-2">Chưa có dữ liệu điểm</h3>
								<p className="text-muted-foreground mb-4">
									Hãy nhập dữ liệu từ file CSV ở trên hoặc thêm thủ công để bắt đầu.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-6">
							{/* Desktop Table View */}
							<div className="hidden md:block">
								<GradeTable
									grades={grades}
									onGradeAdd={handleGradeAdd}
									onGradeEdit={handleGradeEdit}
									onGradeDelete={handleGradeDelete}
									onImportComplete={handleImportComplete}
									editable={true}
								/>
							</div>

							{/* Mobile Card View */}
							<div className="md:hidden">
								<GradeCards
									grades={grades}
									onGradeEdit={(_grade) => {
										// For mobile, we could implement a similar modal approach
										// For now, keeping the existing card view
									}}
									onGradeDelete={handleGradeDelete}
								/>
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
								<Button onClick={() => setActiveTab('table')}>Nhập dữ liệu ngay</Button>
							</CardContent>
						</Card>
					) : (
						<StatisticsDashboard grades={grades} />
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
