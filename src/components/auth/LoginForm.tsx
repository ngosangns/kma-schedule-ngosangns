'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, ExternalLink, User, Lock, FileText } from 'lucide-react';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useToast } from '@/hooks/use-toast';

// Form validation schemas
const loginSchema = z.object({
	username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
	password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

const responseSchema = z.object({
	userResponse: z.string().min(1, 'Vui lòng nhập nội dung phản hồi từ website')
});

type LoginFormData = z.infer<typeof loginSchema>;
type ResponseFormData = z.infer<typeof responseSchema>;

interface LoginFormProps {
	onLoginSuccess?: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
	const { loginWithCredentials, processManualData } = useCalendarData();
	const { toast } = useToast();
	const [showManualInput, setShowManualInput] = useState(false);

	// Login form
	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: '',
			password: ''
		}
	});

	// Manual response form
	const responseForm = useForm<ResponseFormData>({
		resolver: zodResolver(responseSchema),
		defaultValues: {
			userResponse: ''
		}
	});

	const handleLogin = async (data: LoginFormData) => {
		const result = await loginWithCredentials(data.username, data.password, false);
		if (result.success) {
			toast({
				title: 'Đăng nhập thành công!',
				description: 'Chào mừng bạn quay trở lại'
			});
			onLoginSuccess?.();
		}
	};

	const handleManualResponse = async (data: ResponseFormData) => {
		const result = await processManualData(data.userResponse);
		if (result.success) {
			toast({
				title: 'Xử lý dữ liệu thành công!',
				description: 'Dữ liệu đã được xử lý thành công'
			});
			onLoginSuccess?.();
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-background to-muted/20">
			<div className="w-full max-w-md space-y-4 sm:space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-2xl sm:text-3xl font-bold">ACTVN Schedule</h1>
					<p className="text-sm sm:text-base text-muted-foreground">
						Đăng nhập để xem thời khóa biểu của bạn
					</p>
				</div>

				{/* Login Form */}
				<Card>
					<CardHeader className="pb-4 sm:pb-6">
						<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
							<User className="h-5 w-5" />
							Đăng nhập
						</CardTitle>
						<CardDescription className="text-sm">
							Sử dụng tài khoản ACTVN của bạn để đăng nhập
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<Form {...loginForm}>
							<form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
								<FormField
									control={loginForm.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium">Tên đăng nhập</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="Nhập tên đăng nhập"
													disabled={loginForm.formState.isSubmitting}
													className="h-11 text-base"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={loginForm.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium">Mật khẩu</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="password"
													placeholder="Nhập mật khẩu"
													disabled={loginForm.formState.isSubmitting}
													className="h-11 text-base"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full h-11 text-base font-medium"
									disabled={loginForm.formState.isSubmitting}
								>
									{loginForm.formState.isSubmitting ? (
										<LoadingSpinner size="sm" text="Đang đăng nhập..." />
									) : (
										<>
											<Lock className="mr-2 h-4 w-4" />
											Đăng nhập
										</>
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				{/* Alternative Method */}
				<div className="space-y-4">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator className="w-full" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Hoặc</span>
						</div>
					</div>

					<Button
						variant="outline"
						className="w-full h-11 text-base font-medium"
						onClick={() => setShowManualInput(!showManualInput)}
					>
						<FileText className="mr-2 h-4 w-4" />
						Nhập dữ liệu thủ công
					</Button>
				</div>

				{/* Manual Input Form */}
				{showManualInput && (
					<Card>
						<CardHeader className="pb-4 sm:pb-6">
							<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
								<FileText className="h-5 w-5" />
								Nhập dữ liệu thủ công
							</CardTitle>
							<CardDescription className="text-sm">
								Dán nội dung HTML từ trang thời khóa biểu ACTVN
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-0">
							<Form {...responseForm}>
								<form
									onSubmit={responseForm.handleSubmit(handleManualResponse)}
									className="space-y-4"
								>
									<FormField
										control={responseForm.control}
										name="userResponse"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium">Nội dung HTML</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Dán nội dung HTML từ trang thời khóa biểu..."
														className="min-h-[120px] sm:min-h-[140px] font-mono text-sm resize-none"
														disabled={responseForm.formState.isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button
										type="submit"
										className="w-full h-11 text-base font-medium"
										disabled={responseForm.formState.isSubmitting}
									>
										{responseForm.formState.isSubmitting ? (
											<LoadingSpinner size="sm" text="Đang xử lý..." />
										) : (
											'Xử lý dữ liệu'
										)}
									</Button>
								</form>
							</Form>

							<Alert className="mt-4">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription className="text-sm leading-relaxed">
									<strong>Hướng dẫn:</strong> Truy cập{' '}
									<a
										href="https://actvn.edu.vn"
										target="_blank"
										rel="noopener noreferrer"
										className="underline inline-flex items-center gap-1 text-primary"
									>
										trang ACTVN
										<ExternalLink className="h-3 w-3" />
									</a>
									, đăng nhập và sao chép toàn bộ nội dung trang thời khóa biểu rồi dán vào đây.
								</AlertDescription>
							</Alert>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
