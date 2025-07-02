import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/contexts/AppContext';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { mockCalendarData, mockUser } from '../mocks/data';

// Mock the calendar data hook
jest.mock('@/hooks/use-calendar-data');

// Mock Next.js router
jest.mock('next/router', () => ({
	useRouter: () => ({
		push: jest.fn(),
		pathname: '/'
	})
}));

// Mock components that might not be available
jest.mock('@/components/ui/toast', () => ({
	Toaster: () => <div data-testid="toaster" />
}));

// Create a test component that uses the login flow
const LoginTestComponent = () => {
	const { loginWithCredentials, isProcessing } = useCalendarData();
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [result, setResult] = React.useState<any>(null);

	const handleLogin = async () => {
		const loginResult = await loginWithCredentials(username, password);
		setResult(loginResult);
	};

	return (
		<div>
			<input
				data-testid="username-input"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
			/>
			<input
				data-testid="password-input"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
			/>
			<button data-testid="login-button" onClick={handleLogin} disabled={isProcessing}>
				{isProcessing ? 'Logging in...' : 'Login'}
			</button>
			{result && (
				<div data-testid="login-result">
					{result.success ? 'Login successful' : `Login failed: ${result.error}`}
				</div>
			)}
		</div>
	);
};

describe('Login Flow Integration', () => {
	const mockLoginWithCredentials = jest.fn();
	const mockIsProcessing = false;

	beforeEach(() => {
		jest.clearAllMocks();
		(useCalendarData as jest.Mock).mockReturnValue({
			loginWithCredentials: mockLoginWithCredentials,
			isProcessing: mockIsProcessing,
			processManualData: jest.fn(),
			changeSemester: jest.fn(),
			exportCalendar: jest.fn(),
			logout: jest.fn()
		});
	});

	const renderWithProvider = (component: React.ReactElement) => {
		return render(<AppProvider>{component}</AppProvider>);
	};

	it('should handle successful login flow', async () => {
		const user = userEvent.setup();
		mockLoginWithCredentials.mockResolvedValue({ success: true });

		renderWithProvider(<LoginTestComponent />);

		// Fill in credentials
		const usernameInput = screen.getByTestId('username-input');
		const passwordInput = screen.getByTestId('password-input');
		const loginButton = screen.getByTestId('login-button');

		await user.type(usernameInput, 'testuser');
		await user.type(passwordInput, 'testpass');

		expect(usernameInput).toHaveValue('testuser');
		expect(passwordInput).toHaveValue('testpass');

		// Click login button
		await user.click(loginButton);

		// Wait for login to complete
		await waitFor(() => {
			expect(mockLoginWithCredentials).toHaveBeenCalledWith('testuser', 'testpass');
		});

		// Check success result
		await waitFor(() => {
			const result = screen.getByTestId('login-result');
			expect(result).toHaveTextContent('Login successful');
		});
	});

	it('should handle failed login flow', async () => {
		const user = userEvent.setup();
		mockLoginWithCredentials.mockResolvedValue({
			success: false,
			error: 'Invalid credentials'
		});

		renderWithProvider(<LoginTestComponent />);

		// Fill in credentials
		const usernameInput = screen.getByTestId('username-input');
		const passwordInput = screen.getByTestId('password-input');
		const loginButton = screen.getByTestId('login-button');

		await user.type(usernameInput, 'wronguser');
		await user.type(passwordInput, 'wrongpass');

		// Click login button
		await user.click(loginButton);

		// Wait for login to complete
		await waitFor(() => {
			expect(mockLoginWithCredentials).toHaveBeenCalledWith('wronguser', 'wrongpass');
		});

		// Check error result
		await waitFor(() => {
			const result = screen.getByTestId('login-result');
			expect(result).toHaveTextContent('Login failed: Invalid credentials');
		});
	});

	it('should disable login button during processing', async () => {
		const user = userEvent.setup();

		// Mock processing state
		(useCalendarData as jest.Mock).mockReturnValue({
			loginWithCredentials: mockLoginWithCredentials,
			isProcessing: true,
			processManualData: jest.fn(),
			changeSemester: jest.fn(),
			exportCalendar: jest.fn(),
			logout: jest.fn()
		});

		renderWithProvider(<LoginTestComponent />);

		const loginButton = screen.getByTestId('login-button');

		expect(loginButton).toBeDisabled();
		expect(loginButton).toHaveTextContent('Logging in...');
	});

	it('should handle empty credentials', async () => {
		const user = userEvent.setup();
		mockLoginWithCredentials.mockResolvedValue({
			success: false,
			error: 'Username and password required'
		});

		renderWithProvider(<LoginTestComponent />);

		const loginButton = screen.getByTestId('login-button');

		// Click login without filling credentials
		await user.click(loginButton);

		await waitFor(() => {
			expect(mockLoginWithCredentials).toHaveBeenCalledWith('', '');
		});
	});

	it('should handle network errors during login', async () => {
		const user = userEvent.setup();

		// Create a component that handles errors properly
		const LoginWithErrorHandling = () => {
			const { loginWithCredentials } = useCalendarData();
			const [username, setUsername] = React.useState('');
			const [password, setPassword] = React.useState('');
			const [error, setError] = React.useState<string | null>(null);

			const handleLogin = async () => {
				try {
					await loginWithCredentials(username, password);
				} catch (err) {
					setError(err instanceof Error ? err.message : 'Unknown error');
				}
			};

			return (
				<div>
					<input
						data-testid="username-input"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						data-testid="password-input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button data-testid="login-button" onClick={handleLogin}>
						Login
					</button>
					{error && <div data-testid="error-message">{error}</div>}
				</div>
			);
		};

		mockLoginWithCredentials.mockRejectedValue(new Error('Network error'));

		renderWithProvider(<LoginWithErrorHandling />);

		const usernameInput = screen.getByTestId('username-input');
		const passwordInput = screen.getByTestId('password-input');
		const loginButton = screen.getByTestId('login-button');

		await user.type(usernameInput, 'testuser');
		await user.type(passwordInput, 'testpass');
		await user.click(loginButton);

		await waitFor(() => {
			expect(mockLoginWithCredentials).toHaveBeenCalledWith('testuser', 'testpass');
		});

		await waitFor(() => {
			expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
		});
	});

	it('should clear form after successful login', async () => {
		const user = userEvent.setup();
		mockLoginWithCredentials.mockResolvedValue({ success: true });

		const TestComponentWithClear = () => {
			const { loginWithCredentials } = useCalendarData();
			const [username, setUsername] = React.useState('');
			const [password, setPassword] = React.useState('');

			const handleLogin = async () => {
				const result = await loginWithCredentials(username, password);
				if (result.success) {
					setUsername('');
					setPassword('');
				}
			};

			return (
				<div>
					<input
						data-testid="username-input"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						data-testid="password-input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button data-testid="login-button" onClick={handleLogin}>
						Login
					</button>
				</div>
			);
		};

		renderWithProvider(<TestComponentWithClear />);

		const usernameInput = screen.getByTestId('username-input');
		const passwordInput = screen.getByTestId('password-input');
		const loginButton = screen.getByTestId('login-button');

		await user.type(usernameInput, 'testuser');
		await user.type(passwordInput, 'testpass');
		await user.click(loginButton);

		await waitFor(() => {
			expect(usernameInput).toHaveValue('');
			expect(passwordInput).toHaveValue('');
		});
	});

	it('should maintain form state during failed login', async () => {
		const user = userEvent.setup();
		mockLoginWithCredentials.mockResolvedValue({
			success: false,
			error: 'Invalid credentials'
		});

		renderWithProvider(<LoginTestComponent />);

		const usernameInput = screen.getByTestId('username-input');
		const passwordInput = screen.getByTestId('password-input');
		const loginButton = screen.getByTestId('login-button');

		await user.type(usernameInput, 'testuser');
		await user.type(passwordInput, 'wrongpass');
		await user.click(loginButton);

		await waitFor(() => {
			const result = screen.getByTestId('login-result');
			expect(result).toHaveTextContent('Login failed');
		});

		// Form should maintain values for retry
		expect(usernameInput).toHaveValue('testuser');
		expect(passwordInput).toHaveValue('wrongpass');
	});
});
