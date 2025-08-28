import { NotificationSettings, ScheduledNotification, NotificationData, Subject } from '@/types';

// Notification Service Class
export class NotificationService {
	private static instance: NotificationService;
	private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
	private settings: NotificationSettings;

	private constructor() {
		this.settings = this.loadSettings();
		this.initializeService();
	}

	public static getInstance(): NotificationService {
		if (!NotificationService.instance) {
			NotificationService.instance = new NotificationService();
		}
		return NotificationService.instance;
	}

	// Initialize the notification service
	private async initializeService(): Promise<void> {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			// Check current permission status
			this.settings.permissions.granted = Notification.permission === 'granted';
			this.saveSettings();
		}
	}

	// Request notification permission
	public async requestPermission(): Promise<boolean> {
		if (typeof window === 'undefined' || !('Notification' in window)) {
			console.warn('This browser does not support notifications');
			return false;
		}

		if (Notification.permission === 'granted') {
			this.settings.permissions.granted = true;
			this.settings.permissions.requested = true;
			this.saveSettings();
			return true;
		}

		if (Notification.permission === 'denied') {
			this.settings.permissions.granted = false;
			this.settings.permissions.requested = true;
			this.saveSettings();
			return false;
		}

		try {
			const permission = await Notification.requestPermission();
			this.settings.permissions.granted = permission === 'granted';
			this.settings.permissions.requested = true;
			this.saveSettings();
			return permission === 'granted';
		} catch (error) {
			console.error('Error requesting notification permission:', error);
			return false;
		}
	}

	// Show immediate notification
	public showNotification(data: NotificationData): void {
		if (
			typeof window === 'undefined' ||
			!this.settings.enabled ||
			!this.settings.permissions.granted
		) {
			return;
		}

		try {
			// Use a simple data URL icon to avoid 404 errors
			const defaultIcon =
				data.icon ||
				'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzMzNzNkYyIvPgo8cGF0aCBkPSJNMTYgOGMtNC40IDAtOCAzLjYtOCA4czMuNiA4IDggOCA4LTMuNiA4LTgtMy42LTgtOC04em0wIDEyYy0yLjIgMC00LTEuOC00LTRzMS44LTQgNC00IDQgMS44IDQgNC0xLjggNC00IDR6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

			const notificationOptions: NotificationOptions = {
				body: data.body,
				icon: defaultIcon,
				requireInteraction: true,
				silent: false
			};

			if (data.badge) notificationOptions.badge = data.badge;
			if (data.tag) notificationOptions.tag = data.tag;
			if (data.data) notificationOptions.data = data.data;

			const notification = new Notification(data.title, notificationOptions);

			// Auto close after 10 seconds
			setTimeout(() => {
				notification.close();
			}, 10000);

			// Handle click event
			notification.onclick = () => {
				window.focus();
				notification.close();
			};
		} catch (error) {
			console.error('Error showing notification:', error);
		}
	}

	// Schedule notifications for a subject
	public scheduleNotificationsForSubject(subject: Subject): void {
		if (!this.settings.enabled || !this.settings.permissions.granted) {
			return;
		}

		// Clear existing notifications for this subject
		this.clearNotificationsForSubject(subject.id);

		// Calculate next class time
		const nextClassTime = this.getNextClassTime(subject);
		if (!nextClassTime) {
			return;
		}

		const notifications: ScheduledNotification[] = [];

		// Schedule one day before notification
		if (this.settings.timing.oneDayBefore) {
			const oneDayBefore = new Date(nextClassTime.getTime() - 24 * 60 * 60 * 1000);
			if (oneDayBefore > new Date()) {
				notifications.push({
					id: `${subject.id}-1day`,
					subjectId: subject.id,
					subjectName: subject.name,
					subjectCode: subject.code,
					instructor: subject.instructor,
					room: subject.room,
					classTime: nextClassTime,
					notificationTime: oneDayBefore,
					type: 'one-day',
					scheduled: false
				});
			}
		}

		// Schedule one hour before notification
		if (this.settings.timing.oneHourBefore) {
			const oneHourBefore = new Date(nextClassTime.getTime() - 60 * 60 * 1000);
			if (oneHourBefore > new Date()) {
				notifications.push({
					id: `${subject.id}-1hour`,
					subjectId: subject.id,
					subjectName: subject.name,
					subjectCode: subject.code,
					instructor: subject.instructor,
					room: subject.room,
					classTime: nextClassTime,
					notificationTime: oneHourBefore,
					type: 'one-hour',
					scheduled: false
				});
			}
		}

		// Schedule at class time notification
		if (this.settings.timing.atClassTime) {
			if (nextClassTime > new Date()) {
				notifications.push({
					id: `${subject.id}-now`,
					subjectId: subject.id,
					subjectName: subject.name,
					subjectCode: subject.code,
					instructor: subject.instructor,
					room: subject.room,
					classTime: nextClassTime,
					notificationTime: nextClassTime,
					type: 'at-time',
					scheduled: false
				});
			}
		}

		// Schedule all notifications
		notifications.forEach((notification) => {
			this.scheduleNotification(notification);
		});
	}

	// Schedule a single notification
	private scheduleNotification(notification: ScheduledNotification): void {
		const delay = notification.notificationTime.getTime() - Date.now();

		if (delay <= 0) {
			return; // Time has already passed
		}

		const timeoutId = window.setTimeout(() => {
			this.showClassNotification(notification);
			this.scheduledNotifications.delete(notification.id);
		}, delay);

		notification.timeoutId = timeoutId;
		notification.scheduled = true;
		this.scheduledNotifications.set(notification.id, notification);
	}

	// Show class notification
	private showClassNotification(notification: ScheduledNotification): void {
		const timeText = notification.classTime.toLocaleTimeString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit'
		});

		let title = '';
		let body = '';

		switch (notification.type) {
			case 'one-day':
				title = '📅 Nhắc nhở lớp học - 1 ngày trước';
				body = `Ngày mai bạn có lớp ${notification.subjectName} (${notification.subjectCode}) lúc ${timeText} tại ${notification.room}`;
				break;
			case 'one-hour':
				title = '⏰ Nhắc nhở lớp học - 1 giờ trước';
				body = `Còn 1 giờ nữa bạn có lớp ${notification.subjectName} (${notification.subjectCode}) tại ${notification.room}`;
				break;
			case 'at-time':
				title = '🔔 Lớp học bắt đầu';
				body = `Lớp ${notification.subjectName} (${notification.subjectCode}) đang bắt đầu tại ${notification.room}`;
				break;
		}

		this.showNotification({
			title,
			body,
			tag: notification.id,
			data: {
				subjectId: notification.subjectId,
				type: notification.type
			}
		});
	}

	// Get next class time for a subject
	private getNextClassTime(subject: Subject): Date | null {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		// For simplicity, we'll calculate the next occurrence based on the subject's schedule
		// This is a basic implementation - you might want to enhance it based on your actual schedule logic

		// Parse start time
		const timeParts = subject.startTime.split(':').map(Number);
		const hours = timeParts[0] || 7;
		const minutes = timeParts[1] || 0;

		// Calculate days ahead based on subject.day (assuming 1=Monday, 2=Tuesday, etc.)
		const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.
		const targetDay = subject.day; // Your day format

		let daysAhead = targetDay - currentDay;
		if (
			daysAhead < 0 ||
			(daysAhead === 0 && now.getHours() * 60 + now.getMinutes() >= hours * 60 + minutes)
		) {
			daysAhead += 7; // Next week
		}

		const nextClass = new Date(today);
		nextClass.setDate(today.getDate() + daysAhead);
		nextClass.setHours(hours, minutes, 0, 0);

		return nextClass;
	}

	// Clear notifications for a subject
	public clearNotificationsForSubject(subjectId: string): void {
		const toDelete: string[] = [];

		this.scheduledNotifications.forEach((notification, id) => {
			if (notification.subjectId === subjectId) {
				if (notification.timeoutId) {
					clearTimeout(notification.timeoutId);
				}
				toDelete.push(id);
			}
		});

		toDelete.forEach((id) => {
			this.scheduledNotifications.delete(id);
		});
	}

	// Clear all notifications
	public clearAllNotifications(): void {
		this.scheduledNotifications.forEach((notification) => {
			if (notification.timeoutId) {
				clearTimeout(notification.timeoutId);
			}
		});
		this.scheduledNotifications.clear();
	}

	// Get current settings
	public getSettings(): NotificationSettings {
		return { ...this.settings };
	}

	// Update settings
	public updateSettings(newSettings: Partial<NotificationSettings>): void {
		this.settings = { ...this.settings, ...newSettings };
		this.saveSettings();
	}

	// Load settings from localStorage
	private loadSettings(): NotificationSettings {
		try {
			if (typeof window === 'undefined') {
				return this.getDefaultSettings();
			}
			const stored = localStorage.getItem('notification-settings');
			if (stored) {
				const parsed = JSON.parse(stored);
				return {
					enabled: parsed.enabled ?? true,
					permissions: {
						granted: parsed.permissions?.granted ?? false,
						requested: parsed.permissions?.requested ?? false
					},
					timing: {
						oneDayBefore: parsed.timing?.oneDayBefore ?? true,
						oneHourBefore: parsed.timing?.oneHourBefore ?? true,
						atClassTime: parsed.timing?.atClassTime ?? true
					}
				};
			}
		} catch (error) {
			console.error('Error loading notification settings:', error);
		}

		return this.getDefaultSettings();
	}

	// Get default settings
	private getDefaultSettings(): NotificationSettings {
		return {
			enabled: true,
			permissions: {
				granted: false,
				requested: false
			},
			timing: {
				oneDayBefore: true,
				oneHourBefore: true,
				atClassTime: true
			}
		};
	}

	// Save settings to localStorage
	private saveSettings(): void {
		try {
			if (typeof window !== 'undefined') {
				localStorage.setItem('notification-settings', JSON.stringify(this.settings));
			}
		} catch (error) {
			console.error('Error saving notification settings:', error);
		}
	}

	// Get scheduled notifications (for debugging)
	public getScheduledNotifications(): ScheduledNotification[] {
		return Array.from(this.scheduledNotifications.values());
	}
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
