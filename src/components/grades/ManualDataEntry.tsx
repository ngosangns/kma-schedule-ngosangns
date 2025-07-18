'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GradeRecord } from '@/types/grades';
import { processGradeRecord } from '@/lib/ts/grades/calculations';

const gradeFormSchema = z.object({
	tenMon: z.string().min(1, 'Tên môn không được để trống'),
	ky: z.number().min(1, 'Kỳ học phải lớn hơn 0').max(20, 'Kỳ học không được vượt quá 20'),
	tin: z.number().min(0, 'Số tín chỉ không được âm').max(10, 'Số tín chỉ không được vượt quá 10'),
	tp1: z.number().min(0, 'TP1 phải từ 0-10').max(10, 'TP1 phải từ 0-10').nullable(),
	tp2: z.number().min(0, 'TP2 phải từ 0-10').max(10, 'TP2 phải từ 0-10').nullable(),
	thi: z.number().min(0, 'Điểm thi phải từ 0-10').max(10, 'Điểm thi phải từ 0-10').nullable()
});

type GradeFormData = z.infer<typeof gradeFormSchema>;

interface ManualDataEntryProps {
	onGradesChange: (grades: GradeRecord[]) => void;
	initialGrades?: GradeRecord[];
	className?: string;
}

export function ManualDataEntry({ onGradesChange, initialGrades = [], className }: ManualDataEntryProps) {
	const [grades, setGrades] = useState<GradeRecord[]>(initialGrades);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const form = useForm<GradeFormData>({
		resolver: zodResolver(gradeFormSchema),
		defaultValues: {
			tenMon: '',
			ky: 1,
			tin: 3,
			tp1: null,
			tp2: null,
			thi: null
		}
	});

	const onSubmit = (data: GradeFormData) => {
		const processedGrade = processGradeRecord({
			tenMon: data.tenMon,
			ky: data.ky,
			tin: data.tin,
			tp1: data.tp1,
			tp2: data.tp2,
			thi: data.thi
		});

		let newGrades: GradeRecord[];
		if (editingIndex !== null) {
			// Update existing grade
			newGrades = [...grades];
			newGrades[editingIndex] = processedGrade;
			setEditingIndex(null);
		} else {
			// Add new grade
			newGrades = [...grades, processedGrade];
		}

		setGrades(newGrades);
		onGradesChange(newGrades);
		form.reset();
	};

	const editGrade = (index: number) => {
		const grade = grades[index];
		form.reset({
			tenMon: grade.tenMon,
			ky: grade.ky,
			tin: grade.tin,
			tp1: grade.tp1,
			tp2: grade.tp2,
			thi: grade.thi
		});
		setEditingIndex(index);
	};

	const deleteGrade = (index: number) => {
		const newGrades = grades.filter((_, i) => i !== index);
		setGrades(newGrades);
		onGradesChange(newGrades);
		if (editingIndex === index) {
			setEditingIndex(null);
			form.reset();
		}
	};

	const cancelEdit = () => {
		setEditingIndex(null);
		form.reset();
	};

	const clearAll = () => {
		setGrades([]);
		onGradesChange([]);
		setEditingIndex(null);
		form.reset();
	};

	return (
		<div className={className}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plus className="h-5 w-5" />
						Nhập dữ liệu thủ công
					</CardTitle>
					<CardDescription>
						Thêm từng môn học một cách thủ công
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Input Form */}
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="tenMon"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Tên môn học</FormLabel>
											<FormControl>
												<Input placeholder="Ví dụ: Toán cao cấp A1" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="ky"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Kỳ học</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													min="1" 
													max="20"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<FormField
									control={form.control}
									name="tin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tín chỉ</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													min="0" 
													max="10"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="tp1"
									render={({ field }) => (
										<FormItem>
											<FormLabel>TP1 (Giữa kỳ)</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													step="0.1"
													min="0" 
													max="10"
													placeholder="0-10"
													{...field}
													value={field.value || ''}
													onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="tp2"
									render={({ field }) => (
										<FormItem>
											<FormLabel>TP2 (Chuyên cần)</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													step="0.1"
													min="0" 
													max="10"
													placeholder="0-10"
													{...field}
													value={field.value || ''}
													onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="thi"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Điểm thi</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													step="0.1"
													min="0" 
													max="10"
													placeholder="0-10"
													{...field}
													value={field.value || ''}
													onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex gap-2">
								<Button type="submit" className="flex items-center gap-2">
									<Save className="h-4 w-4" />
									{editingIndex !== null ? 'Cập nhật' : 'Thêm môn'}
								</Button>
								{editingIndex !== null && (
									<Button type="button" variant="outline" onClick={cancelEdit}>
										Hủy
									</Button>
								)}
								{grades.length > 0 && (
									<Button type="button" variant="destructive" onClick={clearAll}>
										Xóa tất cả
									</Button>
								)}
							</div>
						</form>
					</Form>

					{/* Grades List */}
					{grades.length > 0 && (
						<div className="space-y-4">
							<Separator />
							<div className="flex items-center justify-between">
								<h4 className="font-medium">Danh sách môn học ({grades.length})</h4>
								<Badge variant="secondary" className="flex items-center gap-1">
									<Calculator className="h-3 w-3" />
									Tự động tính toán
								</Badge>
							</div>

							<div className="space-y-2 max-h-96 overflow-y-auto">
								{grades.map((grade, index) => (
									<Card key={grade.id} className={`p-4 ${!grade.isValid ? 'border-red-200 bg-red-50 dark:bg-red-950' : ''}`}>
										<div className="flex items-center justify-between">
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2">
													<h5 className="font-medium">{grade.tenMon}</h5>
													<Badge variant="outline">Kỳ {grade.ky}</Badge>
													<Badge variant="outline">{grade.tin} TC</Badge>
													{grade.diemChu && (
														<Badge variant={grade.kthp && grade.kthp >= 5 ? 'default' : 'destructive'}>
															{grade.diemChu}
														</Badge>
													)}
												</div>
												<div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
													<div>TP1: {grade.tp1 ?? '-'}</div>
													<div>TP2: {grade.tp2 ?? '-'}</div>
													<div>Thi: {grade.thi ?? '-'}</div>
													<div>ĐQT: {grade.dqt ?? '-'}</div>
													<div>KTHP: {grade.kthp ?? '-'}</div>
												</div>
												{grade.errors && grade.errors.length > 0 && (
													<Alert className="mt-2">
														<AlertDescription className="text-sm">
															{grade.errors.join(', ')}
														</AlertDescription>
													</Alert>
												)}
											</div>
											<div className="flex gap-2 ml-4">
												<Button size="sm" variant="outline" onClick={() => editGrade(index)}>
													Sửa
												</Button>
												<Button size="sm" variant="destructive" onClick={() => deleteGrade(index)}>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
