'use client';

import React from 'react';
import { Bell, BellOff, Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNotificationSettings } from '@/hooks/use-notification-settings';

interface NotificationSettingsProps {
	className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
	const {
		settings,
		isLoading,
		error,
		toggleEnabled,
		toggleOneDayBefore,
		toggleOneHourBefore,
		toggleAtClassTime,
		requestPermission,
		hasPermission,
		canRequestPermission
	} = useNotificationSettings();

	const handleRequestPermission = async () => {
		await requestPermission();
	};

	const handleTestNotification = () => {
		if (typeof window !== 'undefined' && hasPermission && settings.enabled) {
			// Show a test notification with data URL icon to avoid 404 errors
			const testIcon =
				'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzMzNzNkYyIvPgo8cGF0aCBkPSJNMTYgOGMtNC40IDAtOCAzLjYtOCA4czMuNiA4IDggOCA4LTMuNiA4LTgtMy42LTgtOC04em0wIDEyYy0yLjIgMC00LTEuOC00LTRzMS44LTQgNC00IDQgMS44IDQgNC0xLjggNC00IDR6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

			new Notification('🔔 Thông báo thử nghiệm', {
				body: 'Hệ thống thông báo đang hoạt động bình thường!',
				icon: testIcon,
				requireInteraction: false
			});
		}
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Cài đặt thông báo
				</CardTitle>
				<CardDescription>Nhận thông báo về lịch học qua trình duyệt</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Error Alert */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Permission Status */}
				{!hasPermission && (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="flex items-center justify-between">
							<span>
								{canRequestPermission
									? 'Cần cấp quyền thông báo để sử dụng tính năng này'
									: 'Quyền thông báo bị từ chối. Vui lòng bật trong cài đặt trình duyệt.'}
							</span>
							{canRequestPermission && (
								<Button size="sm" onClick={handleRequestPermission} disabled={isLoading}>
									{isLoading ? <LoadingSpinner size="sm" /> : 'Cấp quyền'}
								</Button>
							)}
						</AlertDescription>
					</Alert>
				)}

				{/* Permission Granted Status */}
				{hasPermission && (
					<Alert>
						<CheckCircle className="h-4 w-4" />
						<AlertDescription className="flex items-center justify-between">
							<span>Quyền thông báo đã được cấp</span>
							<Button
								size="sm"
								variant="outline"
								onClick={handleTestNotification}
								disabled={!settings.enabled}
							>
								Thử nghiệm
							</Button>
						</AlertDescription>
					</Alert>
				)}

				{/* Main Toggle */}
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label className="text-base font-medium">Bật thông báo</Label>
						<div className="text-sm text-muted-foreground">Nhận thông báo về lịch học sắp tới</div>
					</div>
					<Switch
						checked={settings.enabled}
						onCheckedChange={toggleEnabled}
						disabled={isLoading || (!hasPermission && !canRequestPermission)}
						aria-label="Bật thông báo"
					/>
				</div>

				{/* Timing Options */}
				{settings.enabled && hasPermission && (
					<div className="space-y-4 pt-4 border-t">
						<div className="space-y-0.5">
							<Label className="text-base font-medium">Thời gian thông báo</Label>
							<div className="text-sm text-muted-foreground">
								Chọn khi nào bạn muốn nhận thông báo
							</div>
						</div>

						{/* One Day Before */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<div className="space-y-0.5">
									<Label className="text-sm font-medium">1 ngày trước</Label>
									<div className="text-xs text-muted-foreground">Nhắc nhở trước 1 ngày</div>
								</div>
							</div>
							<Switch
								checked={settings.timing.oneDayBefore}
								onCheckedChange={toggleOneDayBefore}
								disabled={isLoading}
								aria-label="1 ngày trước"
							/>
						</div>

						{/* One Hour Before */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<div className="space-y-0.5">
									<Label className="text-sm font-medium">1 giờ trước</Label>
									<div className="text-xs text-muted-foreground">Nhắc nhở trước 1 giờ</div>
								</div>
							</div>
							<Switch
								checked={settings.timing.oneHourBefore}
								onCheckedChange={toggleOneHourBefore}
								disabled={isLoading}
								aria-label="1 giờ trước"
							/>
						</div>

						{/* At Class Time */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Bell className="h-4 w-4 text-muted-foreground" />
								<div className="space-y-0.5">
									<Label className="text-sm font-medium">Lúc diễn ra lớp học</Label>
									<div className="text-xs text-muted-foreground">Thông báo khi lớp học bắt đầu</div>
								</div>
							</div>
							<Switch
								checked={settings.timing.atClassTime}
								onCheckedChange={toggleAtClassTime}
								disabled={isLoading}
								aria-label="Lúc diễn ra lớp học"
							/>
						</div>
					</div>
				)}

				{/* Disabled State Info */}
				{!settings.enabled && (
					<div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
						<BellOff className="h-5 w-5 text-muted-foreground" />
						<div className="text-sm text-muted-foreground">
							Thông báo đã tắt. Bật thông báo để nhận nhắc nhở về lịch học.
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
