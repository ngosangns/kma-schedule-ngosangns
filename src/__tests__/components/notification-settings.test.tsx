import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationSettings } from '@/components/ui/notification-settings';
import { useNotificationSettings } from '@/hooks/use-notification-settings';

// Mock the hook
jest.mock('@/hooks/use-notification-settings');

const mockUseNotificationSettings = useNotificationSettings as jest.MockedFunction<
	typeof useNotificationSettings
>;

describe('NotificationSettings', () => {
	const defaultMockReturn = {
		settings: {
			enabled: true,
			permissions: {
				granted: true,
				requested: true
			},
			timing: {
				oneDayBefore: true,
				oneHourBefore: true,
				atClassTime: true
			}
		},
		isLoading: false,
		error: null,
		updateSettings: jest.fn(),
		requestPermission: jest.fn(),
		toggleEnabled: jest.fn(),
		toggleOneDayBefore: jest.fn(),
		toggleOneHourBefore: jest.fn(),
		toggleAtClassTime: jest.fn(),
		hasPermission: true,
		canRequestPermission: false
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseNotificationSettings.mockReturnValue(defaultMockReturn);
	});

	it('should render notification settings card', () => {
		render(<NotificationSettings />);

		expect(screen.getByText('Cài đặt thông báo')).toBeInTheDocument();
		expect(screen.getByText('Nhận thông báo về lịch học qua trình duyệt')).toBeInTheDocument();
	});

	it('should show permission granted status', () => {
		render(<NotificationSettings />);

		expect(screen.getByText('Quyền thông báo đã được cấp')).toBeInTheDocument();
		expect(screen.getByText('Thử nghiệm')).toBeInTheDocument();
	});

	it('should show permission request when needed', () => {
		mockUseNotificationSettings.mockReturnValue({
			...defaultMockReturn,
			hasPermission: false,
			canRequestPermission: true,
			settings: {
				...defaultMockReturn.settings,
				permissions: {
					granted: false,
					requested: false
				}
			}
		});

		render(<NotificationSettings />);

		expect(
			screen.getByText('Cần cấp quyền thông báo để sử dụng tính năng này')
		).toBeInTheDocument();
		expect(screen.getByText('Cấp quyền')).toBeInTheDocument();
	});

	it('should show permission denied message', () => {
		mockUseNotificationSettings.mockReturnValue({
			...defaultMockReturn,
			hasPermission: false,
			canRequestPermission: false,
			settings: {
				...defaultMockReturn.settings,
				permissions: {
					granted: false,
					requested: true
				}
			}
		});

		render(<NotificationSettings />);

		expect(screen.getByText(/Quyền thông báo bị từ chối/)).toBeInTheDocument();
	});

	it('should handle main toggle switch', async () => {
		render(<NotificationSettings />);

		const mainToggle = screen.getByRole('switch', { name: /Bật thông báo/i });
		fireEvent.click(mainToggle);

		await waitFor(() => {
			expect(defaultMockReturn.toggleEnabled).toHaveBeenCalled();
		});
	});

	it('should handle timing toggles', async () => {
		render(<NotificationSettings />);

		// Test one day before toggle
		const oneDayToggle = screen.getByRole('switch', { name: /1 ngày trước/i });
		fireEvent.click(oneDayToggle);

		await waitFor(() => {
			expect(defaultMockReturn.toggleOneDayBefore).toHaveBeenCalled();
		});

		// Test one hour before toggle
		const oneHourToggle = screen.getByRole('switch', { name: /1 giờ trước/i });
		fireEvent.click(oneHourToggle);

		await waitFor(() => {
			expect(defaultMockReturn.toggleOneHourBefore).toHaveBeenCalled();
		});

		// Test at class time toggle
		const atTimeToggle = screen.getByRole('switch', { name: /Lúc diễn ra lớp học/i });
		fireEvent.click(atTimeToggle);

		await waitFor(() => {
			expect(defaultMockReturn.toggleAtClassTime).toHaveBeenCalled();
		});
	});

	it('should show timing options only when enabled and has permission', () => {
		render(<NotificationSettings />);

		expect(screen.getByText('Thời gian thông báo')).toBeInTheDocument();
		expect(screen.getByText('1 ngày trước')).toBeInTheDocument();
		expect(screen.getByText('1 giờ trước')).toBeInTheDocument();
		expect(screen.getByText('Lúc diễn ra lớp học')).toBeInTheDocument();
	});

	it('should hide timing options when disabled', () => {
		mockUseNotificationSettings.mockReturnValue({
			...defaultMockReturn,
			settings: {
				...defaultMockReturn.settings,
				enabled: false
			}
		});

		render(<NotificationSettings />);

		expect(screen.queryByText('Thời gian thông báo')).not.toBeInTheDocument();
		expect(screen.getByText(/Thông báo đã tắt/)).toBeInTheDocument();
	});

	it('should show error message when present', () => {
		const errorMessage = 'Test error message';
		mockUseNotificationSettings.mockReturnValue({
			...defaultMockReturn,
			error: errorMessage
		});

		render(<NotificationSettings />);

		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it('should show loading state', () => {
		mockUseNotificationSettings.mockReturnValue({
			...defaultMockReturn,
			isLoading: true
		});

		render(<NotificationSettings />);

		// Check if switches are disabled during loading
		const mainToggle = screen.getByRole('switch', { name: /Bật thông báo/i });
		expect(mainToggle).toBeDisabled();
	});

	it('should handle permission request', async () => {
		mockUseNotificationSettings.mockReturnValue({
			...defaultMockReturn,
			hasPermission: false,
			canRequestPermission: true,
			settings: {
				...defaultMockReturn.settings,
				permissions: {
					granted: false,
					requested: false
				}
			}
		});

		render(<NotificationSettings />);

		const requestButton = screen.getByText('Cấp quyền');
		fireEvent.click(requestButton);

		await waitFor(() => {
			expect(defaultMockReturn.requestPermission).toHaveBeenCalled();
		});
	});

	it('should handle test notification', async () => {
		// Mock Notification constructor
		const mockNotification = jest.fn();
		Object.defineProperty(window, 'Notification', {
			value: mockNotification,
			writable: true
		});

		render(<NotificationSettings />);

		const testButton = screen.getByText('Thử nghiệm');
		fireEvent.click(testButton);

		await waitFor(() => {
			expect(mockNotification).toHaveBeenCalledWith(
				'🔔 Thông báo thử nghiệm',
				expect.objectContaining({
					body: 'Hệ thống thông báo đang hoạt động bình thường!',
					icon: expect.stringContaining('data:image/svg+xml;base64'),
					requireInteraction: false
				})
			);
		});
	});

	it('should disable test button when notifications are disabled', () => {
		mockUseNotificationSettings.mockReturnValue({
			...defaultMockReturn,
			settings: {
				...defaultMockReturn.settings,
				enabled: false
			}
		});

		render(<NotificationSettings />);

		const testButton = screen.getByText('Thử nghiệm');
		expect(testButton).toBeDisabled();
	});

	it('should apply custom className', () => {
		const customClass = 'custom-notification-settings';
		const { container } = render(<NotificationSettings className={customClass} />);

		expect(container.firstChild).toHaveClass(customClass);
	});
});
