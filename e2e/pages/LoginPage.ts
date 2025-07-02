import { Page, Locator, expect } from '@playwright/test';
import { TestCredentials, TestData, logTestStep, waitForNetworkIdle } from '../helpers/test-config';

export class LoginPage {
	readonly page: Page;
	readonly usernameInput: Locator;
	readonly passwordInput: Locator;
	readonly loginButton: Locator;
	readonly manualInputTab: Locator;
	readonly manualInputTextarea: Locator;
	readonly processButton: Locator;
	readonly errorMessage: Locator;
	readonly successMessage: Locator;
	readonly loadingIndicator: Locator;

	constructor(page: Page) {
		this.page = page;

		// Login form elements - use more specific selectors
		this.usernameInput = page
			.locator(
				'input[name="username"], input[placeholder*="tên đăng nhập"], input[placeholder*="username"]'
			)
			.first();
		this.passwordInput = page.locator('input[type="password"]').first();
		this.loginButton = page
			.locator('button[type="submit"]')
			.filter({ hasText: /đăng nhập|login/i })
			.first();

		// Manual input elements
		this.manualInputTab = page
			.locator('[role="tab"]')
			.filter({ hasText: TestData.expectedText.manualInput })
			.first();
		this.manualInputTextarea = page.locator('textarea').first();
		this.processButton = page
			.locator('button')
			.filter({ hasText: /xử lý|process/i })
			.first();

		// Feedback elements
		this.errorMessage = page
			.locator('[role="alert"], .error, [data-testid="error-message"]')
			.first();
		this.successMessage = page.locator('[data-testid="success-message"]').first();
		this.loadingIndicator = page
			.locator('[data-testid="loading"], .loading, [data-testid="loading-spinner"]')
			.first();
	}

	/**
	 * Navigate to the login page
	 */
	async goto(): Promise<void> {
		logTestStep('Navigating to login page');
		await this.page.goto('/');
		await this.page.waitForLoadState('domcontentloaded');
	}

	/**
	 * Check if login form is visible
	 */
	async isLoginFormVisible(): Promise<boolean> {
		try {
			await expect(this.usernameInput).toBeVisible({ timeout: 5000 });
			await expect(this.passwordInput).toBeVisible({ timeout: 5000 });
			await expect(this.loginButton).toBeVisible({ timeout: 5000 });
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Login with credentials
	 */
	async login(credentials: TestCredentials): Promise<void> {
		logTestStep(`Logging in with username: ${credentials.username}`);

		// Wait for form to be ready
		await expect(this.usernameInput).toBeVisible();
		await expect(this.passwordInput).toBeVisible();
		await expect(this.loginButton).toBeVisible();

		// Fill credentials
		await this.usernameInput.fill(credentials.username);
		await this.passwordInput.fill(credentials.password);

		// Submit form
		await this.loginButton.click();

		// Wait for response
		await waitForNetworkIdle(this.page);
	}

	/**
	 * Login and wait for success
	 */
	async loginAndWaitForSuccess(credentials: TestCredentials): Promise<void> {
		await this.login(credentials);

		// Wait for either success or error
		await Promise.race([this.waitForSuccessfulLogin(), this.waitForLoginError()]);
	}

	/**
	 * Wait for successful login indicators
	 */
	async waitForSuccessfulLogin(): Promise<void> {
		logTestStep('Waiting for successful login');

		// Look for various success indicators
		const successIndicators = [
			this.page.locator('[data-testid="calendar-view"]'),
			this.page.locator('[data-testid="user-info"]'),
			this.page.locator('[data-testid="subjects-list"]'),
			this.page.locator('.calendar-content'),
			this.page.locator('text=/chào mừng|welcome/i')
		];

		// Wait for any success indicator to appear
		await Promise.race(
			successIndicators.map((locator) => expect(locator).toBeVisible({ timeout: 15000 }))
		);
	}

	/**
	 * Wait for login error
	 */
	async waitForLoginError(): Promise<void> {
		logTestStep('Waiting for login error');
		await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
	}

	/**
	 * Check if login was successful
	 */
	async isLoginSuccessful(): Promise<boolean> {
		try {
			await this.waitForSuccessfulLogin();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get error message text
	 */
	async getErrorMessage(): Promise<string> {
		if (await this.errorMessage.isVisible()) {
			return (await this.errorMessage.textContent()) || '';
		}
		return '';
	}

	/**
	 * Switch to manual input tab
	 */
	async switchToManualInput(): Promise<void> {
		logTestStep('Switching to manual input');

		if (await this.manualInputTab.isVisible()) {
			await this.manualInputTab.click();
		}

		await expect(this.manualInputTextarea).toBeVisible();
	}

	/**
	 * Input manual calendar data
	 */
	async inputManualData(htmlData: string): Promise<void> {
		logTestStep('Inputting manual calendar data');

		await this.switchToManualInput();
		await this.manualInputTextarea.fill(htmlData);

		if (await this.processButton.isVisible()) {
			await this.processButton.click();
			await waitForNetworkIdle(this.page);
		}
	}

	/**
	 * Check if loading indicator is visible
	 */
	async isLoading(): Promise<boolean> {
		return await this.loadingIndicator.isVisible();
	}

	/**
	 * Wait for loading to complete
	 */
	async waitForLoadingComplete(): Promise<void> {
		if (await this.isLoading()) {
			await expect(this.loadingIndicator).not.toBeVisible({ timeout: 30000 });
		}
	}

	/**
	 * Validate login form elements
	 */
	async validateLoginForm(): Promise<void> {
		logTestStep('Validating login form elements');

		await expect(this.usernameInput).toBeVisible();
		await expect(this.usernameInput).toBeEditable();

		await expect(this.passwordInput).toBeVisible();
		await expect(this.passwordInput).toBeEditable();
		await expect(this.passwordInput).toHaveAttribute('type', 'password');

		await expect(this.loginButton).toBeVisible();
		await expect(this.loginButton).toBeEnabled();
	}

	/**
	 * Test form validation with empty fields
	 */
	async testEmptyFieldValidation(): Promise<void> {
		logTestStep('Testing empty field validation');

		// Clear fields and submit
		await this.usernameInput.clear();
		await this.passwordInput.clear();
		await this.loginButton.click();

		// Check for validation message
		await this.page.waitForTimeout(1000);

		// Look for validation indicators
		const hasValidation = await Promise.race([
			this.errorMessage.isVisible(),
			this.page.locator('input:invalid').first().isVisible(),
			this.page.locator('.field-error, .validation-error').first().isVisible()
		]);

		if (!hasValidation) {
			console.warn('No validation found for empty fields');
		}
	}

	/**
	 * Test keyboard navigation
	 */
	async testKeyboardNavigation(): Promise<void> {
		logTestStep('Testing keyboard navigation');

		// Tab through form elements
		await this.page.keyboard.press('Tab');
		await expect(this.usernameInput).toBeFocused();

		await this.page.keyboard.press('Tab');
		await expect(this.passwordInput).toBeFocused();

		await this.page.keyboard.press('Tab');
		await expect(this.loginButton).toBeFocused();
	}

	/**
	 * Submit form with Enter key
	 */
	async submitWithEnter(credentials: TestCredentials): Promise<void> {
		logTestStep('Submitting form with Enter key');

		await this.usernameInput.fill(credentials.username);
		await this.passwordInput.fill(credentials.password);
		await this.page.keyboard.press('Enter');

		await waitForNetworkIdle(this.page);
	}
}
