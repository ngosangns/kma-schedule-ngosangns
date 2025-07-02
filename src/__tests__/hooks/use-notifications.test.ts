import { renderHook } from '@testing-library/react';
import { useNotifications } from '@/hooks/use-notifications';
import { useToast } from '@/hooks/use-toast';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
	useToast: jest.fn()
}));

describe('useNotifications', () => {
	const mockToast = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useToast as jest.Mock).mockReturnValue({
			toast: mockToast
		});
	});

	it('should provide showSuccess function', () => {
		const { result } = renderHook(() => useNotifications());

		expect(typeof result.current.showSuccess).toBe('function');
	});

	it('should provide showError function', () => {
		const { result } = renderHook(() => useNotifications());

		expect(typeof result.current.showError).toBe('function');
	});

	it('should provide showWarning function', () => {
		const { result } = renderHook(() => useNotifications());

		expect(typeof result.current.showWarning).toBe('function');
	});

	it('should provide showInfo function', () => {
		const { result } = renderHook(() => useNotifications());

		expect(typeof result.current.showInfo).toBe('function');
	});

	describe('showSuccess', () => {
		it('should call toast with success variant', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showSuccess('Success message');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Success message',
				variant: 'default'
			});
		});

		it('should call toast with success message and description', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showSuccess('Success message', 'Success description');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Success message',
				description: 'Success description',
				variant: 'default'
			});
		});
	});

	describe('showError', () => {
		it('should call toast with destructive variant', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showError('Error message');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Error message',
				variant: 'destructive'
			});
		});

		it('should call toast with error message and description', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showError('Error message', 'Error description');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Error message',
				description: 'Error description',
				variant: 'destructive'
			});
		});
	});

	describe('showWarning', () => {
		it('should call toast with warning variant', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showWarning('Warning message');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Warning message',
				variant: 'default'
			});
		});

		it('should call toast with warning message and description', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showWarning('Warning message', 'Warning description');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Warning message',
				description: 'Warning description',
				variant: 'default'
			});
		});
	});

	describe('showInfo', () => {
		it('should call toast with info variant', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showInfo('Info message');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Info message',
				variant: 'default'
			});
		});

		it('should call toast with info message and description', () => {
			const { result } = renderHook(() => useNotifications());

			result.current.showInfo('Info message', 'Info description');

			expect(mockToast).toHaveBeenCalledWith({
				title: 'Info message',
				description: 'Info description',
				variant: 'default'
			});
		});
	});

	it('should handle empty messages', () => {
		const { result } = renderHook(() => useNotifications());

		result.current.showSuccess('');
		result.current.showError('');
		result.current.showWarning('');
		result.current.showInfo('');

		expect(mockToast).toHaveBeenCalledTimes(4);
		expect(mockToast).toHaveBeenNthCalledWith(1, {
			title: '',
			variant: 'default'
		});
		expect(mockToast).toHaveBeenNthCalledWith(2, {
			title: '',
			variant: 'destructive'
		});
		expect(mockToast).toHaveBeenNthCalledWith(3, {
			title: '',
			variant: 'default'
		});
		expect(mockToast).toHaveBeenNthCalledWith(4, {
			title: '',
			variant: 'default'
		});
	});

	it('should handle undefined descriptions', () => {
		const { result } = renderHook(() => useNotifications());

		result.current.showSuccess('Message', undefined);

		expect(mockToast).toHaveBeenCalledWith({
			title: 'Message',
			description: undefined,
			variant: 'default'
		});
	});

	it('should create new function instances on re-renders', () => {
		const { result, rerender } = renderHook(() => useNotifications());

		const firstShowSuccess = result.current.showSuccess;
		const firstShowError = result.current.showError;

		rerender();

		// Functions are recreated on each render since they're not memoized
		expect(result.current.showSuccess).not.toBe(firstShowSuccess);
		expect(result.current.showError).not.toBe(firstShowError);

		// But they should still work the same way
		result.current.showSuccess('Test');
		expect(mockToast).toHaveBeenCalledWith({
			title: 'Test',
			variant: 'default'
		});
	});

	it('should work with different toast implementations', () => {
		// Test with different mock implementation
		const alternativeMockToast = jest.fn();
		(useToast as jest.Mock).mockReturnValue({
			toast: alternativeMockToast
		});

		const { result } = renderHook(() => useNotifications());

		result.current.showSuccess('Test message');

		expect(alternativeMockToast).toHaveBeenCalledWith({
			title: 'Test message',
			variant: 'default'
		});
	});
});
