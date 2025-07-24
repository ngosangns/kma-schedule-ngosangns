'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Target, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { GradeRecord } from '@/types/grades';
import {
	calculateStudyPlan,
	calculateMultipleScenarios,
	getRemainingSubjects,
	StudyPlanResult
} from '@/lib/ts/grades/study-planning';
import { calculateGPA10, calculateGPA4 } from '@/lib/ts/grades/calculations';

interface StudyPlanDialogProps {
	grades: GradeRecord[];
	trigger?: React.ReactNode;
}

export function StudyPlanDialog({ grades, trigger }: StudyPlanDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [targetGPA, setTargetGPA] = useState<string>('');
	const [useGPA4Scale, setUseGPA4Scale] = useState(false);
	const [customRemainingCredits, setCustomRemainingCredits] = useState<string>('');
	const [result, setResult] = useState<StudyPlanResult | null>(null);

	// Calculate current GPA and remaining subjects
	const currentGPA10 = useMemo(() => calculateGPA10(grades), [grades]);
	const currentGPA4 = useMemo(() => calculateGPA4(grades), [grades]);
	const remainingSubjects = useMemo(() => getRemainingSubjects(grades), [grades]);
	const totalRemainingCredits = remainingSubjects.reduce(
		(sum, subject) => sum + subject.credits,
		0
	);

	// Calculate multiple scenarios
	const scenarios = useMemo(() => {
		if (remainingSubjects.length === 0 && !customRemainingCredits) return [];

		const subjects = customRemainingCredits
			? [{ name: 'Các môn còn lại', credits: parseInt(customRemainingCredits) || 0, semester: 0 }]
			: remainingSubjects;

		return calculateMultipleScenarios(grades, subjects, useGPA4Scale);
	}, [grades, remainingSubjects, customRemainingCredits, useGPA4Scale]);

	const handleCalculate = () => {
		const target = parseFloat(targetGPA);
		if (isNaN(target)) {
			setResult({
				success: false,
				targetGPA: 0,
				currentGPA: null,
				requiredAverageScore: null,
				totalRemainingCredits: 0,
				isAchievable: false,
				isAlreadyAchieved: false,
				message: 'Vui lòng nhập GPA mục tiêu hợp lệ.'
			});
			return;
		}

		const subjects = customRemainingCredits
			? [{ name: 'Các môn còn lại', credits: parseInt(customRemainingCredits) || 0, semester: 0 }]
			: remainingSubjects;

		const planResult = calculateStudyPlan(grades, {
			targetGPA: target,
			useGPA4Scale,
			remainingSubjects: subjects
		});

		setResult(planResult);
	};

	const handleReset = () => {
		setTargetGPA('');
		setCustomRemainingCredits('');
		setResult(null);
	};

	const maxGPA = useGPA4Scale ? 4 : 10;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm" className="flex items-center gap-2">
						<Target className="h-4 w-4" />
						Lập kế hoạch học tập
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Lập kế hoạch học tập
					</DialogTitle>
					<DialogDescription>Tính toán điểm số cần thiết để đạt GPA mục tiêu</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Current Status */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Tình trạng hiện tại</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm text-muted-foreground">GPA Hệ 10</Label>
									<div className="text-2xl font-bold">{currentGPA10?.toFixed(2) || 'N/A'}</div>
								</div>
								<div>
									<Label className="text-sm text-muted-foreground">GPA Hệ 4</Label>
									<div className="text-2xl font-bold">{currentGPA4?.toFixed(2) || 'N/A'}</div>
								</div>
							</div>
							<div>
								<Label className="text-sm text-muted-foreground">Môn chưa hoàn thành</Label>
								<div className="text-lg font-semibold">
									{remainingSubjects.length} môn ({totalRemainingCredits} tín chỉ)
								</div>
							</div>
						</CardContent>
					</Card>

					<Tabs defaultValue="calculator" className="space-y-4">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="calculator">Tính toán cụ thể</TabsTrigger>
							<TabsTrigger value="scenarios">Các kịch bản</TabsTrigger>
						</TabsList>

						<TabsContent value="calculator" className="space-y-4">
							{/* Input Form */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Thông tin tính toán</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center space-x-2">
										<Switch
											id="gpa-scale"
											checked={useGPA4Scale}
											onCheckedChange={setUseGPA4Scale}
										/>
										<Label htmlFor="gpa-scale">Sử dụng thang điểm 4 (thay vì thang điểm 10)</Label>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="target-gpa">GPA mục tiêu (0 - {maxGPA})</Label>
											<Input
												id="target-gpa"
												type="number"
												step="0.1"
												min="0"
												max={maxGPA}
												value={targetGPA}
												onChange={(e) => setTargetGPA(e.target.value)}
												placeholder={`Ví dụ: ${useGPA4Scale ? '3.2' : '7.5'}`}
											/>
										</div>
										<div>
											<Label htmlFor="remaining-credits">Tín chỉ còn lại (tùy chọn)</Label>
											<Input
												id="remaining-credits"
												type="number"
												min="0"
												value={customRemainingCredits}
												onChange={(e) => setCustomRemainingCredits(e.target.value)}
												placeholder={`Mặc định: ${totalRemainingCredits}`}
											/>
										</div>
									</div>

									<div className="flex gap-2">
										<Button onClick={handleCalculate} className="flex items-center gap-2">
											<Calculator className="h-4 w-4" />
											Tính toán
										</Button>
										<Button variant="outline" onClick={handleReset}>
											Đặt lại
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Results */}
							{result && (
								<Card>
									<CardHeader>
										<CardTitle className="text-base flex items-center gap-2">
											{result.isAchievable ? (
												result.isAlreadyAchieved ? (
													<CheckCircle className="h-5 w-5 text-green-500" />
												) : (
													<TrendingUp className="h-5 w-5 text-blue-500" />
												)
											) : (
												<AlertCircle className="h-5 w-5 text-red-500" />
											)}
											Kết quả tính toán
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<Alert>
											<Info className="h-4 w-4" />
											<AlertDescription>{result.message}</AlertDescription>
										</Alert>

										{result.breakdown && result.requiredAverageScore !== null && (
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<Label className="text-muted-foreground">GPA hiện tại</Label>
													<div className="font-semibold">{result.currentGPA?.toFixed(2)}</div>
												</div>
												<div>
													<Label className="text-muted-foreground">GPA mục tiêu</Label>
													<div className="font-semibold">{result.targetGPA.toFixed(2)}</div>
												</div>
												<div>
													<Label className="text-muted-foreground">Điểm trung bình cần thiết</Label>
													<div className="font-semibold text-lg">
														{result.requiredAverageScore.toFixed(2)}
													</div>
												</div>
												<div>
													<Label className="text-muted-foreground">Tín chỉ còn lại</Label>
													<div className="font-semibold">{result.totalRemainingCredits}</div>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="scenarios" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Các kịch bản GPA mục tiêu</CardTitle>
									<CardDescription>
										Xem điểm trung bình cần thiết cho các mức GPA khác nhau
									</CardDescription>
								</CardHeader>
								<CardContent>
									{scenarios.length === 0 ? (
										<Alert>
											<Info className="h-4 w-4" />
											<AlertDescription>
												Không có môn học nào còn lại để tính toán. Vui lòng nhập số tín chỉ còn lại
												trong tab &quot;Tính toán cụ thể&quot;.
											</AlertDescription>
										</Alert>
									) : (
										<div className="space-y-2">
											{scenarios.map((scenario, index) => (
												<div
													key={index}
													className={`flex items-center justify-between p-3 rounded-lg border ${
														scenario.isAlreadyAchieved
															? 'bg-green-50 border-green-200 dark:bg-green-950/20'
															: scenario.isAchievable
																? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20'
																: 'bg-red-50 border-red-200 dark:bg-red-950/20'
													}`}
												>
													<div className="flex items-center gap-3">
														<Badge variant={scenario.isAlreadyAchieved ? 'default' : 'secondary'}>
															GPA {scenario.targetGPA.toFixed(1)}
														</Badge>
														<span className="text-sm">
															{scenario.isAlreadyAchieved
																? 'Đã đạt được'
																: scenario.isAchievable
																	? `Cần điểm TB: ${scenario.requiredAverageScore?.toFixed(2)}`
																	: 'Không thể đạt được'}
														</span>
													</div>
													{scenario.isAchievable && !scenario.isAlreadyAchieved && (
														<div className="text-xs text-muted-foreground">
															{scenario.requiredAverageScore &&
															scenario.requiredAverageScore >= (useGPA4Scale ? 3.5 : 8.0)
																? 'Khó'
																: scenario.requiredAverageScore &&
																	  scenario.requiredAverageScore >= (useGPA4Scale ? 2.5 : 6.5)
																	? 'Trung bình'
																	: 'Dễ'}
														</div>
													)}
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}
