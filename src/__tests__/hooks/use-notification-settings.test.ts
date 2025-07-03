import { renderHook, act } from '@testing-library/react';
import { useNotificationSettings } from '@/hooks/use-notification-settings';
import { notificationService } from '@/lib/ts/notifications';

// Mock the notification service
jest.mock('@/lib/ts/notifications', () => ({
	notificationService: {
		getSettings: jest.fn(),
		updateSettings: jest.fn(),
		requestPermission: jest.fn(),
		clearAllNotifications: jest.fn()
	}
}));

// Mock Notification API
const mockNotification = {
	permission: 'default' as NotificationPermission,
	requestPermission: jest.fn()
};

Object.defineProperty(window, 'Notification', {
	value: mockNotification,
	writable: true
});

describe('useNotificationSettings', () => {
	const mockSettings = {
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

	beforeEach(() => {
		jest.clearAllMocks();
		(notificationService.getSettings as jest.Mock).mockReturnValue(mockSettings);
		mockNotification.permission = 'default';
	});

	it('should initialize with settings from service', () => {
		const { result } = renderHook(() => useNotificationSettings());

		expect(result.current.settings).toEqual(mockSettings);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBe(null);
	});

	it('should update settings correctly', async () => {
		const updatedSettings = {
			...mockSettings,
			enabled: false
		};
		(notificationService.getSettings as jest.Mock).mockReturnValue(updatedSettings);

		const { result } = renderHook(() => useNotificationSettings());

		await act(async () => {
			await result.current.updateSettings({ enabled: false });
		});

		expect(notificationService.updateSettings).toHaveBeenCalledWith({ enabled: false });
		expect(notificationService.clearAllNotifications).toHaveBeenCalled();
	});

	it('should request permission correctly', async () => {
		(notificationService.requestPermission as jest.Mock).mockResolvedValue(true);
		const updatedSettings = {
			...mockSettings,
			permissions: { granted: true, requested: true }
		};
		(notificationService.getSettings as jest.Mock).mockReturnValue(updatedSettings);

		const { result } = renderHook(() => useNotificationSettings());

		let permissionGranted;
		await act(async () => {
			permissionGranted = await result.current.requestPermission();
		});

		expect(permissionGranted).toBe(true);
		expect(notificationService.requestPermission).toHaveBeenCalled();
	});

	it('should handle permission denial', async () => {
		(notificationService.requestPermission as jest.Mock).mockResolvedValue(false);

		const { result } = renderHook(() => useNotificationSettings());

		let permissionGranted;
		await act(async () => {
			permissionGranted = await result.current.requestPermission();
		});

		expect(permissionGranted).toBe(false);
		expect(result.current.error).toContain('Quyền thông báo bị từ chối');
	});

	it('should toggle enabled state', async () => {
		const { result } = renderHook(() => useNotificationSettings());

		await act(async () => {
			await result.current.toggleEnabled();
		});

		expect(notificationService.updateSettings).toHaveBeenCalledWith({ enabled: false });
	});

	it('should toggle timing settings', async () => {
		const { result } = renderHook(() => useNotificationSettings());

		await act(async () => {
			await result.current.toggleOneDayBefore();
		});

		expect(notificationService.updateSettings).toHaveBeenCalledWith({
			timing: {
				...mockSettings.timing,
				oneDayBefore: false
			}
		});

		await act(async () => {
			await result.current.toggleOneHourBefore();
		});

		expect(notificationService.updateSettings).toHaveBeenCalledWith({
			timing: {
				...mockSettings.timing,
				oneHourBefore: false
			}
		});

		await act(async () => {
			await result.current.toggleAtClassTime();
		});

		expect(notificationService.updateSettings).toHaveBeenCalledWith({
			timing: {
				...mockSettings.timing,
				atClassTime: false
			}
		});
	});

	it('should handle errors gracefully', async () => {
		(notificationService.updateSettings as jest.Mock).mockImplementation(() => {
			throw new Error('Update failed');
		});

		const { result } = renderHook(() => useNotificationSettings());

		await act(async () => {
			await result.current.updateSettings({ enabled: false });
		});

		expect(result.current.error).toContain('Không thể cập nhật cài đặt thông báo');
	});

	it('should check permission status correctly', () => {
		// Test with granted permission
		const settingsWithPermission = {
			...mockSettings,
			permissions: { granted: true, requested: true }
		};
		(notificationService.getSettings as jest.Mock).mockReturnValue(settingsWithPermission);

		const { result } = renderHook(() => useNotificationSettings());

		expect(result.current.hasPermission).toBe(true);
		expect(result.current.canRequestPermission).toBe(false);
	});

	it('should handle browser without notification support', async () => {
		// Remove Notification from window
		const originalNotification = window.Notification;
		// @ts-ignore
		delete window.Notification;

		const { result } = renderHook(() => useNotificationSettings());

		let permissionGranted;
		await act(async () => {
			permissionGranted = await result.current.requestPermission();
		});

		expect(permissionGranted).toBe(false);
		expect(result.current.error).toContain('Trình duyệt không hỗ trợ thông báo');

		// Restore Notification
		window.Notification = originalNotification;
	});

	it('should request permission when enabling notifications without permission', async () => {
		(notificationService.requestPermission as jest.Mock).mockResolvedValue(true);
		const settingsWithoutPermission = {
			...mockSettings,
			enabled: false,
			permissions: { granted: false, requested: false }
		};
		(notificationService.getSettings as jest.Mock).mockReturnValue(settingsWithoutPermission);

		const { result } = renderHook(() => useNotificationSettings());

		await act(async () => {
			await result.current.toggleEnabled();
		});

		expect(notificationService.requestPermission).toHaveBeenCalled();
	});
});
