import { useState, useEffect, useCallback } from 'react';
import { NotificationSettings } from '@/types';
import { notificationService } from '@/lib/ts/notifications';

export interface UseNotificationSettingsReturn {
	settings: NotificationSettings;
	isLoading: boolean;
	error: string | null;
	updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
	requestPermission: () => Promise<boolean>;
	toggleEnabled: () => Promise<void>;
	toggleOneDayBefore: () => Promise<void>;
	toggleOneHourBefore: () => Promise<void>;
	toggleAtClassTime: () => Promise<void>;
	hasPermission: boolean;
	canRequestPermission: boolean;
}

export function useNotificationSettings(): UseNotificationSettingsReturn {
	const [settings, setSettings] = useState<NotificationSettings>(() =>
		notificationService.getSettings()
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check if browser supports notifications
	const isSupported = typeof window !== 'undefined' && 'Notification' in window;

	// Derived states
	const hasPermission = settings.permissions.granted;
	const canRequestPermission =
		isSupported &&
		typeof window !== 'undefined' &&
		Notification.permission !== 'denied' &&
		!settings.permissions.granted;

	// Load settings on mount
	useEffect(() => {
		try {
			const currentSettings = notificationService.getSettings();
			setSettings(currentSettings);
		} catch (err) {
			setError('Không thể tải cài đặt thông báo');
			console.error('Error loading notification settings:', err);
		}
	}, []);

	// Update settings function
	const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
		setIsLoading(true);
		setError(null);

		try {
			// Update service settings
			notificationService.updateSettings(newSettings);

			// Get updated settings from service
			const updatedSettings = notificationService.getSettings();
			setSettings(updatedSettings);

			// If notifications were disabled, clear all scheduled notifications
			if (newSettings.enabled === false) {
				notificationService.clearAllNotifications();
			}
		} catch (err) {
			setError('Không thể cập nhật cài đặt thông báo');
			console.error('Error updating notification settings:', err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Request notification permission
	const requestPermission = useCallback(async (): Promise<boolean> => {
		setIsLoading(true);
		setError(null);

		try {
			if (!isSupported) {
				setError('Trình duyệt không hỗ trợ thông báo');
				return false;
			}

			const granted = await notificationService.requestPermission();

			// Update settings with new permission status
			const updatedSettings = notificationService.getSettings();
			setSettings(updatedSettings);

			if (!granted) {
				setError('Quyền thông báo bị từ chối. Vui lòng bật thông báo trong cài đặt trình duyệt.');
			}

			return granted;
		} catch (err) {
			setError('Không thể yêu cầu quyền thông báo');
			console.error('Error requesting notification permission:', err);
			return false;
		} finally {
			setIsLoading(false);
		}
	}, [isSupported]);

	// Toggle enabled state
	const toggleEnabled = useCallback(async () => {
		const newEnabled = !settings.enabled;

		// If enabling notifications but no permission, request it first
		if (newEnabled && !hasPermission && canRequestPermission) {
			const granted = await requestPermission();
			if (!granted) {
				return; // Don't enable if permission denied
			}
		}

		await updateSettings({ enabled: newEnabled });
	}, [settings.enabled, hasPermission, canRequestPermission, requestPermission, updateSettings]);

	// Toggle one day before notification
	const toggleOneDayBefore = useCallback(async () => {
		await updateSettings({
			timing: {
				...settings.timing,
				oneDayBefore: !settings.timing.oneDayBefore
			}
		});
	}, [settings.timing, updateSettings]);

	// Toggle one hour before notification
	const toggleOneHourBefore = useCallback(async () => {
		await updateSettings({
			timing: {
				...settings.timing,
				oneHourBefore: !settings.timing.oneHourBefore
			}
		});
	}, [settings.timing, updateSettings]);

	// Toggle at class time notification
	const toggleAtClassTime = useCallback(async () => {
		await updateSettings({
			timing: {
				...settings.timing,
				atClassTime: !settings.timing.atClassTime
			}
		});
	}, [settings.timing, updateSettings]);

	return {
		settings,
		isLoading,
		error,
		updateSettings,
		requestPermission,
		toggleEnabled,
		toggleOneDayBefore,
		toggleOneHourBefore,
		toggleAtClassTime,
		hasPermission,
		canRequestPermission
	};
}
