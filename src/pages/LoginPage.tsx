import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { saveData } from '@/lib/ts/storage';
import {
	fetchCalendarWithGet,
	processCalendar,
	processMainForm,
	processSemesters,
	processStudent,
	filterTrashInHtml
} from '@/lib/ts/calendar';
import { login, logout } from '@/lib/ts/user';

export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [userResponse, setUserResponse] = useState('');
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [errorMessage2, setErrorMessage2] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setErrorMessage('');

		try {
			const signInToken = await login(username, password);
			const response = filterTrashInHtml(await fetchCalendarWithGet(signInToken));
			const calendar = await processCalendar(response);
			const student = processStudent(response);
			const mainForm = processMainForm(response);
			const semesters = processSemesters(response);

			saveData({
				signInToken,
				mainForm,
				semesters,
				calendar,
				student
			});

			// Dispatch custom event to notify App component of successful login
			window.dispatchEvent(new CustomEvent('loginSuccess'));
			router.push('/calendar');
		} catch (error) {
			console.error('Login error:', error);
			setErrorMessage(
				'Có lỗi xảy ra khi lấy thông tin thời khóa biểu hoặc tài khoản/mật khẩu không đúng!'
			);
			logout();
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitUserResponse = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage2('');

		try {
			const response = filterTrashInHtml(userResponse);
			const calendar = await processCalendar(response);
			const student = processStudent(response);
			const mainForm = processMainForm(response);
			const semesters = processSemesters(response);

			saveData({
				mainForm,
				semesters,
				calendar,
				student
			});

			// Dispatch custom event to notify App component of successful login
			window.dispatchEvent(new CustomEvent('loginSuccess'));
			router.push('/calendar');
		} catch (error) {
			console.error('User response processing error:', error);
			setErrorMessage2('Có lỗi xảy ra khi lấy thông tin thời khóa biểu!');
			logout();
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Login with Account */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">XEM THỜI KHÓA BIỂU TỪ TÀI KHOẢN TRƯỜNG</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="username">Username</Label>
									<Input
										id="username"
										type="text"
										placeholder="Username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										required
										disabled={loading}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										placeholder="Password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										disabled={loading}
									/>
								</div>

								<Button type="submit" className="w-full" disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Đăng nhập
								</Button>

								{errorMessage && (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{errorMessage}</AlertDescription>
									</Alert>
								)}
							</form>
						</CardContent>
					</Card>

					{/* Login with Source Code */}
					<Card className="bg-secondary">
						<CardHeader>
							<CardTitle className="text-lg">XEM THỜI KHÓA BIỂU TỪ MÃ NGUỒN</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Nhằm tăng tính bảo mật cho tài khoản của các bạn, web đã hỗ trợ thêm tính năng dịch
								thời khóa biểu từ mã nguồn HTML.
							</p>

							<p className="text-sm font-medium mb-2">Hướng dẫn:</p>

							<div className="bg-background rounded-lg p-4 mb-4">
								<ol className="space-y-2 text-sm">
									<li className="flex items-start">
										<span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 mt-0.5">
											1
										</span>
										<span>
											Bạn vào trang quản lí của trường tại địa chỉ{' '}
											<a
												href="http://qldt.actvn.edu.vn"
												target="_blank"
												rel="noreferrer"
												className="underline inline-flex items-center gap-1"
											>
												http://qldt.actvn.edu.vn
												<ExternalLink className="w-3 h-3" />
											</a>{' '}
											và tiến hành đăng nhập.
										</span>
									</li>
									<li className="flex items-start">
										<span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 mt-0.5">
											2
										</span>
										<span>
											Vào mục: <strong>Đăng ký học</strong> → <strong>Xem kết quả ĐKH</strong>.
										</span>
									</li>
									<li className="flex items-start">
										<span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 mt-0.5">
											3
										</span>
										<span>
											Chuột phải chọn <strong>Xem mã nguồn (View page source)</strong> và copy toàn
											bộ code.
										</span>
									</li>
									<li className="flex items-start">
										<span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 mt-0.5">
											4
										</span>
										<span>
											Dán code đó vào ô bên dưới và bấm <strong>Xem lịch học</strong>.
										</span>
									</li>
								</ol>
							</div>

							<form onSubmit={handleSubmitUserResponse} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="userResponse">Mã nguồn HTML</Label>
									<Textarea
										id="userResponse"
										placeholder="Dán mã nguồn của trang xem lịch học tại đây..."
										value={userResponse}
										onChange={(e) => setUserResponse(e.target.value)}
										required
										disabled={loading}
										rows={3}
									/>
								</div>

								<Button type="submit" className="w-full" variant="secondary" disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Xem lịch học
								</Button>

								{errorMessage2 && (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{errorMessage2}</AlertDescription>
									</Alert>
								)}
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
