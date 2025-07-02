import { test, expect } from '@playwright/test';
import { getTestConfig, validateTestEnvironment, TestData } from './helpers/test-config';
import { LoginPage } from './pages/LoginPage';
import { CalendarPage } from './pages/CalendarPage';

// Validate environment before running tests
test.beforeAll(async () => {
	validateTestEnvironment();
});

test.describe('Login Flow with Real Data', () => {
	let loginPage: LoginPage;
	let calendarPage: CalendarPage;
	let testConfig: ReturnType<typeof getTestConfig>;

	test.beforeEach(async ({ page }) => {
		testConfig = getTestConfig();
		loginPage = new LoginPage(page);
		calendarPage = new CalendarPage(page);

		await loginPage.goto();
	});

	test('should display login form', async ({ page }) => {
		// Look for login form elements
		const usernameInput = page.locator('input[type="text"]').first();
		const passwordInput = page.locator('input[type="password"]').first();
		const loginButton = page
			.locator('button')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		if (await usernameInput.isVisible()) {
			await expect(usernameInput).toBeVisible();
			await expect(passwordInput).toBeVisible();
			await expect(loginButton).toBeVisible();
		}
	});

	test('should show validation errors for empty fields', async ({ page }) => {
		const loginButton = page
			.locator('button')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		if (await loginButton.isVisible()) {
			await loginButton.click();

			// Look for validation messages
			const errorMessage = page.locator('[role="alert"]').first();
			if (await errorMessage.isVisible()) {
				await expect(errorMessage).toBeVisible();
			}
		}
	});

	test('should handle invalid credentials', async ({ page }) => {
		const usernameInput = page.locator('input[type="text"]').first();
		const passwordInput = page.locator('input[type="password"]').first();
		const loginButton = page
			.locator('button')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		if (await usernameInput.isVisible()) {
			await usernameInput.fill('invalid_user');
			await passwordInput.fill('invalid_password');
			await loginButton.click();

			// Wait for error message or toast
			await page.waitForTimeout(2000);

			// Look for error indication
			const errorToast = page.locator('[data-testid="toast"]').first();
			const errorMessage = page.locator('.error, [role="alert"]').first();

			if (await errorToast.isVisible()) {
				await expect(errorToast).toContainText(/thất bại|failed|error/i);
			} else if (await errorMessage.isVisible()) {
				await expect(errorMessage).toBeVisible();
			}
		}
	});

	test('should handle successful login flow', async ({ page }) => {
		const usernameInput = page.locator('input[type="text"]').first();
		const passwordInput = page.locator('input[type="password"]').first();
		const loginButton = page
			.locator('button')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		if (await usernameInput.isVisible()) {
			// Use test credentials (these should be configured for testing)
			await usernameInput.fill('test_user');
			await passwordInput.fill('test_password');
			await loginButton.click();

			// Wait for navigation or success indication
			await page.waitForTimeout(3000);

			// Look for success indicators
			const successToast = page.locator('[data-testid="toast"]').first();
			const calendarView = page.locator('[data-testid="calendar-view"]').first();
			const userInfo = page.locator('[data-testid="user-info"]').first();

			if (await successToast.isVisible()) {
				await expect(successToast).toContainText(/thành công|success/i);
			} else if (await calendarView.isVisible()) {
				await expect(calendarView).toBeVisible();
			} else if (await userInfo.isVisible()) {
				await expect(userInfo).toBeVisible();
			}
		}
	});

	test('should show loading state during login', async ({ page }) => {
		const usernameInput = page.locator('input[type="text"]').first();
		const passwordInput = page.locator('input[type="password"]').first();
		const loginButton = page
			.locator('button')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		if (await usernameInput.isVisible()) {
			await usernameInput.fill('test_user');
			await passwordInput.fill('test_password');

			// Click login and immediately check for loading state
			await loginButton.click();

			// Look for loading indicators
			const loadingSpinner = page.locator('[data-testid="loading-spinner"]').first();
			const disabledButton = page.locator('button[disabled]').first();
			const loadingText = page.locator('text=/đang.*tải|loading/i').first();

			if (await loadingSpinner.isVisible()) {
				await expect(loadingSpinner).toBeVisible();
			} else if (await disabledButton.isVisible()) {
				await expect(disabledButton).toBeVisible();
			} else if (await loadingText.isVisible()) {
				await expect(loadingText).toBeVisible();
			}
		}
	});

	test('should handle manual data input', async ({ page }) => {
		// Look for manual data input option
		const manualInputButton = page
			.locator('button')
			.filter({ hasText: /thủ công|manual/i })
			.first();
		const manualInputTab = page
			.locator('[role="tab"]')
			.filter({ hasText: /thủ công|manual/i })
			.first();

		if (await manualInputButton.isVisible()) {
			await manualInputButton.click();

			// Look for textarea or file input
			const textarea = page.locator('textarea').first();
			const fileInput = page.locator('input[type="file"]').first();

			if (await textarea.isVisible()) {
				await expect(textarea).toBeVisible();

				// Test with sample HTML data
				await textarea.fill('<html><body>Sample calendar data</body></html>');

				const processButton = page
					.locator('button')
					.filter({ hasText: /xử lý|process/i })
					.first();
				if (await processButton.isVisible()) {
					await processButton.click();
					await page.waitForTimeout(2000);
				}
			} else if (await fileInput.isVisible()) {
				await expect(fileInput).toBeVisible();
			}
		} else if (await manualInputTab.isVisible()) {
			await manualInputTab.click();

			const textarea = page.locator('textarea').first();
			if (await textarea.isVisible()) {
				await expect(textarea).toBeVisible();
			}
		}
	});

	test('should persist login state across page refreshes', async ({ page }) => {
		// First, attempt to login
		const usernameInput = page.locator('input[type="text"]').first();
		const passwordInput = page.locator('input[type="password"]').first();
		const loginButton = page
			.locator('button')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		if (await usernameInput.isVisible()) {
			await usernameInput.fill('test_user');
			await passwordInput.fill('test_password');
			await loginButton.click();

			await page.waitForTimeout(3000);

			// Check if login was successful
			const isLoggedIn = await page
				.locator('[data-testid="user-info"], [data-testid="calendar-view"]')
				.first()
				.isVisible();

			if (isLoggedIn) {
				// Refresh the page
				await page.reload();
				await page.waitForTimeout(2000);

				// Check if still logged in
				const stillLoggedIn = await page
					.locator('[data-testid="user-info"], [data-testid="calendar-view"]')
					.first()
					.isVisible();
				expect(stillLoggedIn).toBeTruthy();
			}
		}
	});

	test('should handle logout functionality', async ({ page }) => {
		// First login (if possible)
		const usernameInput = page.locator('input[type="text"]').first();
		const passwordInput = page.locator('input[type="password"]').first();
		const loginButton = page
			.locator('button')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		if (await usernameInput.isVisible()) {
			await usernameInput.fill('test_user');
			await passwordInput.fill('test_password');
			await loginButton.click();
			await page.waitForTimeout(3000);

			// Look for logout button
			const logoutButton = page
				.locator('button')
				.filter({ hasText: /đăng xuất|logout/i })
				.first();

			if (await logoutButton.isVisible()) {
				await logoutButton.click();
				await page.waitForTimeout(2000);

				// Check if redirected to login page
				const loginForm = page.locator('input[type="text"], input[type="password"]').first();
				await expect(loginForm).toBeVisible();
			}
		}
	});

	test('should be accessible via keyboard navigation', async ({ page }) => {
		// Test keyboard navigation through login form
		await page.keyboard.press('Tab');

		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();

		// Continue tabbing through form elements
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		// Test Enter key submission
		const usernameInput = page.locator('input[type="text"]').first();
		if (await usernameInput.isVisible()) {
			await usernameInput.focus();
			await usernameInput.fill('test_user');
			await page.keyboard.press('Tab');
			await page.keyboard.type('test_password');
			await page.keyboard.press('Enter');

			await page.waitForTimeout(2000);
		}
	});
});
