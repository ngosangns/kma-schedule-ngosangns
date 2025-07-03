import { NotificationService } from '@/lib/ts/notifications';
import { Subject } from '@/types';

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
});

// Mock Notification API
const mockNotification = {
	permission: 'default' as NotificationPermission,
	requestPermission: jest.fn(),
	close: jest.fn(),
	onclick: null
};

const NotificationConstructor = jest.fn().mockImplementation((title, options) => ({
	...mockNotification,
	title,
	...options
}));

// Add requestPermission as a static method
NotificationConstructor.requestPermission = jest.fn();
NotificationConstructor.permission = 'default';

Object.defineProperty(window, 'Notification', {
	value: NotificationConstructor,
	writable: true
});

// Mock setTimeout and clearTimeout
const mockSetTimeout = jest.fn();
const mockClearTimeout = jest.fn();
global.setTimeout = mockSetTimeout;
global.clearTimeout = mockClearTimeout;

describe('NotificationService', () => {
	let service: NotificationService;

	beforeEach(() => {
		jest.clearAllMocks();
		localStorageMock.getItem.mockReturnValue(null);
		NotificationConstructor.permission = 'default';
		NotificationConstructor.requestPermission.mockResolvedValue('default');
		mockSetTimeout.mockImplementation((_callback, _delay) => {
			// Return a mock timeout ID
			return 123;
		});

		// Reset singleton instance
		// @ts-ignore - accessing private static property for testing
		NotificationService.instance = undefined;
		service = NotificationService.getInstance();
	});

	describe('Singleton Pattern', () => {
		it('should return the same instance', () => {
			const instance1 = NotificationService.getInstance();
			const instance2 = NotificationService.getInstance();
			expect(instance1).toBe(instance2);
		});
	});

	describe('Settings Management', () => {
		it('should load default settings when localStorage is empty', () => {
			const settings = service.getSettings();
			expect(settings).toEqual({
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
			});
		});

		it('should load settings from localStorage', () => {
			const storedSettings = {
				enabled: false,
				permissions: { granted: true, requested: true },
				timing: { oneDayBefore: false, oneHourBefore: true, atClassTime: true }
			};
			localStorageMock.getItem.mockReturnValue(JSON.stringify(storedSettings));

			// Create new instance to test loading
			// @ts-ignore
			NotificationService.instance = undefined;
			service = NotificationService.getInstance();

			const settings = service.getSettings();
			expect(settings.enabled).toBe(false);
			expect(settings.permissions.granted).toBe(true);
		});

		it('should update and save settings', () => {
			service.updateSettings({ enabled: false });

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'notification-settings',
				expect.stringContaining('"enabled":false')
			);
		});
	});

	describe('Permission Management', () => {
		it('should request permission successfully', async () => {
			NotificationConstructor.requestPermission.mockResolvedValue('granted');

			const granted = await service.requestPermission();

			expect(granted).toBe(true);
			expect(service.getSettings().permissions.granted).toBe(true);
		});

		it('should handle permission denial', async () => {
			NotificationConstructor.requestPermission.mockResolvedValue('denied');

			const granted = await service.requestPermission();

			expect(granted).toBe(false);
			expect(service.getSettings().permissions.granted).toBe(false);
		});

		it('should return true if permission already granted', async () => {
			NotificationConstructor.permission = 'granted';

			const granted = await service.requestPermission();

			expect(granted).toBe(true);
			expect(NotificationConstructor.requestPermission).not.toHaveBeenCalled();
		});
	});

	describe('Notification Display', () => {
		beforeEach(() => {
			service.updateSettings({
				enabled: true,
				permissions: { granted: true, requested: true }
			});
		});

		it('should show notification when enabled and permission granted', () => {
			service.showNotification({
				title: 'Test Title',
				body: 'Test Body'
			});

			expect(NotificationConstructor).toHaveBeenCalledWith('Test Title', {
				body: 'Test Body',
				icon: '/favicon.ico',
				badge: undefined,
				tag: undefined,
				data: undefined,
				requireInteraction: true,
				silent: false
			});
		});

		it('should not show notification when disabled', () => {
			service.updateSettings({ enabled: false });

			service.showNotification({
				title: 'Test Title',
				body: 'Test Body'
			});

			expect(NotificationConstructor).not.toHaveBeenCalled();
		});

		it('should not show notification without permission', () => {
			service.updateSettings({
				permissions: { granted: false, requested: true }
			});

			service.showNotification({
				title: 'Test Title',
				body: 'Test Body'
			});

			expect(NotificationConstructor).not.toHaveBeenCalled();
		});
	});

	describe('Notification Scheduling', () => {
		const mockSubject: Subject = {
			id: 'test-subject',
			name: 'Test Subject',
			code: 'TEST101',
			instructor: 'Test Instructor',
			room: 'A101',
			day: 2, // Tuesday
			startTime: '09:00',
			endTime: '11:00',
			shift: 1,
			week: 1
		};

		beforeEach(() => {
			service.updateSettings({
				enabled: true,
				permissions: { granted: true, requested: true }
			});
		});

		it('should schedule notifications for a subject', () => {
			service.scheduleNotificationsForSubject(mockSubject);

			// Should call setTimeout for scheduling
			expect(mockSetTimeout).toHaveBeenCalled();
		});

		it('should not schedule when disabled', () => {
			service.updateSettings({ enabled: false });

			service.scheduleNotificationsForSubject(mockSubject);

			expect(mockSetTimeout).not.toHaveBeenCalled();
		});

		it('should clear notifications for a subject', () => {
			// First schedule some notifications
			service.scheduleNotificationsForSubject(mockSubject);

			// Then clear them
			service.clearNotificationsForSubject(mockSubject.id);

			expect(mockClearTimeout).toHaveBeenCalled();
		});

		it('should clear all notifications', () => {
			// Schedule notifications for multiple subjects
			service.scheduleNotificationsForSubject(mockSubject);
			service.scheduleNotificationsForSubject({
				...mockSubject,
				id: 'test-subject-2'
			});

			service.clearAllNotifications();

			expect(mockClearTimeout).toHaveBeenCalled();
		});
	});

	describe('Error Handling', () => {
		it('should handle localStorage errors gracefully', () => {
			localStorageMock.setItem.mockImplementation(() => {
				throw new Error('Storage error');
			});

			// Should not throw
			expect(() => {
				service.updateSettings({ enabled: false });
			}).not.toThrow();
		});

		it('should handle notification creation errors', () => {
			service.updateSettings({
				enabled: true,
				permissions: { granted: true, requested: true }
			});

			NotificationConstructor.mockImplementation(() => {
				throw new Error('Notification error');
			});

			// Should not throw
			expect(() => {
				service.showNotification({
					title: 'Test',
					body: 'Test'
				});
			}).not.toThrow();
		});
	});
});
