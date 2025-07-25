import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Plus, Bug, Zap, Palette, Shield } from 'lucide-react';

const changelogs = [
	{
		version: 'v2025.07',
		date: '2025-07-20',
		type: 'major',
		title: 'Hạ tầng API, lập kế hoạch Khóa học và quản lý điểm số',
		changes: [
			{
				type: 'feature',
				description: 'Hệ thống lập kế hoạch khóa học'
			},
			{
				type: 'feature',
				description: 'Hệ thống quản lý điểm số'
			},
			{
				type: 'feature',
				description: 'Thêm cấu hình triển khai Vercel'
			},
			{
				type: 'feature',
				description: 'Giao diện mới với thành phần shadcn/ui'
			},
			{
				type: 'feature',
				description: 'Thêm chế độ xem tháng (Month View)'
			},
			{
				type: 'improvement',
				description: 'Cải thiện xử lý lỗi và xác thực cho token đăng nhập'
			},
			{
				type: 'improvement',
				description: 'Thêm loading component để cải thiện trải nghiệm người dùng'
			},
			{
				type: 'improvement',
				description: 'Tái cấu trúc code để cải thiện khả năng đọc và bảo trì'
			},
			{
				type: 'improvement',
				description: 'Cải thiện cấu hình ESLint với các quy tắc nghiêm ngặt hơn'
			},
			{
				type: 'improvement',
				description: 'Cập nhật tài liệu cấu trúc dự án và tài liệu kỹ thuật'
			},
			{
				type: 'improvement',
				description: 'Cải thiện hiệu suất và trạng thái tải'
			},
			{
				type: 'improvement',
				description: 'Xử lý lỗi tốt hơn và phản hồi người dùng'
			}
		]
	},
	{
		version: 'v2022.12',
		date: '2022-12-01',
		type: 'minor',
		title: 'Cải thiện UI/UX và tính năng',
		changes: [
			{
				type: 'feature',
				description: 'Thêm chế độ xem danh sách'
			},
			{
				type: 'feature',
				description: 'Lọc theo buổi học (sáng, chiều, tối)'
			},
			{
				type: 'improvement',
				description: 'Cải thiện điều hướng giữa các tuần'
			},
			{
				type: 'fix',
				description: 'Sửa lỗi hiển thị thời gian'
			}
		]
	},
	{
		version: 'v2022.11',
		date: '2022-11-15',
		type: 'minor',
		title: 'Tính năng xuất lịch',
		changes: [
			{
				type: 'feature',
				description: 'Xuất thời khóa biểu sang Google Calendar'
			},
			{
				type: 'improvement',
				description: 'Cải thiện hiển thị thông tin môn học'
			},
			{
				type: 'fix',
				description: 'Sửa lỗi đăng nhập với một số tài khoản'
			}
		]
	},
	{
		version: 'v2022.10',
		date: '2022-10-01',
		type: 'major',
		title: 'Phiên bản đầu tiên',
		changes: [
			{
				type: 'feature',
				description: 'Đăng nhập với tài khoản ACTVN'
			},
			{
				type: 'feature',
				description: 'Xem thời khóa biểu theo tuần'
			},
			{
				type: 'feature',
				description: 'Chuyển đổi giữa các học kỳ'
			},
			{
				type: 'feature',
				description: 'Giao diện web thích ứng'
			}
		]
	}
];

const getChangeIcon = (type: string) => {
	switch (type) {
		case 'feature':
			return <Plus className="h-4 w-4 text-green-500" />;
		case 'improvement':
			return <Zap className="h-4 w-4 text-blue-500" />;
		case 'fix':
			return <Bug className="h-4 w-4 text-red-500" />;
		case 'security':
			return <Shield className="h-4 w-4 text-purple-500" />;
		case 'design':
			return <Palette className="h-4 w-4 text-pink-500" />;
		default:
			return <Calendar className="h-4 w-4 text-gray-500" />;
	}
};

const getVersionBadge = (type: string) => {
	switch (type) {
		case 'major':
			return <Badge variant="default">Lớn</Badge>;
		case 'minor':
			return <Badge variant="secondary">Nhỏ</Badge>;
		case 'patch':
			return <Badge variant="outline">Vá lỗi</Badge>;
		default:
			return <Badge variant="outline">Phát hành</Badge>;
	}
};

export default function ChangelogsPage() {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">Lịch sử cập nhật</h1>
				<p className="text-muted-foreground">
					Theo dõi các tính năng mới và cải tiến của ACTVN Schedule
				</p>
			</div>

			<div className="space-y-6">
				{changelogs.map((changelog, index) => (
					<Card key={changelog.version}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<CardTitle className="text-xl">{changelog.version}</CardTitle>
										{getVersionBadge(changelog.type)}
									</div>
									<CardDescription>{changelog.title}</CardDescription>
								</div>
								<div className="text-sm text-muted-foreground">
									{new Date(changelog.date).toLocaleDateString('vi-VN')}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{changelog.changes.map((change, changeIndex) => (
									<div key={changeIndex} className="flex items-start gap-3">
										{getChangeIcon(change.type)}
										<span className="text-sm">{change.description}</span>
									</div>
								))}
							</div>
						</CardContent>
						{index < changelogs.length - 1 && <Separator className="mt-6" />}
					</Card>
				))}
			</div>

			{/* Legend */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Chú thích</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
						<div className="flex items-center gap-2">
							<Plus className="h-4 w-4 text-green-500" />
							<span>Tính năng mới</span>
						</div>
						<div className="flex items-center gap-2">
							<Zap className="h-4 w-4 text-blue-500" />
							<span>Cải tiến</span>
						</div>
						<div className="flex items-center gap-2">
							<Bug className="h-4 w-4 text-red-500" />
							<span>Sửa lỗi</span>
						</div>
						<div className="flex items-center gap-2">
							<Shield className="h-4 w-4 text-purple-500" />
							<span>Bảo mật</span>
						</div>
						<div className="flex items-center gap-2">
							<Palette className="h-4 w-4 text-pink-500" />
							<span>Thiết kế</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
