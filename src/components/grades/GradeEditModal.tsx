'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { GradeRecord, GradeFormData, gradeFormSchema } from '@/types/grades';
import { processGradeRecord } from '@/lib/ts/grades/calculations';

interface GradeEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (grade: Omit<GradeRecord, 'id'>) => void;
	editingGrade?: GradeRecord | null;
	title?: string;
}

export function GradeEditModal({
	isOpen,
	onClose,
	onSave,
	editingGrade = null,
	title
}: GradeEditModalProps) {
	const isEditing = !!editingGrade;
	const modalTitle = title || (isEditing ? 'Chỉnh sửa môn học' : 'Thêm môn học mới');

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

	// Reset form when modal opens/closes or editing grade changes
	useEffect(() => {
		if (isOpen) {
			if (editingGrade) {
				form.reset({
					tenMon: editingGrade.tenMon,
					ky: editingGrade.ky,
					tin: editingGrade.tin,
					tp1: editingGrade.tp1,
					tp2: editingGrade.tp2,
					thi: editingGrade.thi
				});
			} else {
				form.reset({
					tenMon: '',
					ky: 1,
					tin: 3,
					tp1: null,
					tp2: null,
					thi: null
				});
			}
		}
	}, [isOpen, editingGrade, form]);

	const onSubmit = (data: GradeFormData) => {
		const processedGrade = processGradeRecord({
			tenMon: data.tenMon,
			ky: data.ky,
			tin: data.tin,
			tp1: data.tp1,
			tp2: data.tp2,
			thi: data.thi
		});

		// Remove the id field for the callback
		const { id: _id, ...gradeWithoutId } = processedGrade;

		// Close modal first, then save to avoid state update conflicts
		onClose();

		// Use setTimeout to ensure the modal close state update completes first
		setTimeout(() => {
			onSave(gradeWithoutId);
		}, 0);
	};

	const handleClose = () => {
		form.reset();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">{modalTitle}</DialogTitle>
					<DialogDescription>
						{isEditing
							? 'Chỉnh sửa thông tin môn học và điểm số.'
							: 'Nhập thông tin môn học và điểm số. Các điểm tính toán sẽ được tự động cập nhật.'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Subject Name and Semester */}
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
										<Select
											value={field.value?.toString()}
											onValueChange={(value) => field.onChange(parseInt(value))}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Chọn kỳ học" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Array.from({ length: 10 }, (_, i) => i + 1).map((semester) => (
													<SelectItem key={semester} value={semester.toString()}>
														Kỳ {semester}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Credits and Scores */}
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
												onChange={(e) =>
													field.onChange(e.target.value ? parseFloat(e.target.value) : null)
												}
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
												onChange={(e) =>
													field.onChange(e.target.value ? parseFloat(e.target.value) : null)
												}
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
												onChange={(e) =>
													field.onChange(e.target.value ? parseFloat(e.target.value) : null)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Action Buttons */}
						<div className="flex justify-end gap-2 pt-4">
							<Button type="button" variant="outline" onClick={handleClose}>
								<X className="h-4 w-4 mr-2" />
								Hủy
							</Button>
							<Button type="submit" className="flex items-center gap-2">
								<Save className="h-4 w-4" />
								{isEditing ? 'Cập nhật' : 'Thêm môn'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
