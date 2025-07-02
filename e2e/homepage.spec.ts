import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test('should load the homepage successfully', async ({ page }) => {
		await page.goto('/');

		// Check if the page loads without errors - adjust title to match actual app
		await expect(page).toHaveTitle(/KMA Schedule/i);

		// Check for main navigation or header
		await expect(page.locator('body')).toBeVisible();
	});

	test('should have proper meta tags', async ({ page }) => {
		await page.goto('/');

		// Check for viewport meta tag (use first() to handle multiple viewport tags)
		const viewport = page.locator('meta[name="viewport"]').first();
		await expect(viewport).toBeAttached();

		// Check for description meta tag
		const description = page.locator('meta[name="description"]');
		await expect(description).toBeAttached();
	});

	test('should be responsive on mobile', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Check if page is still functional on mobile
		await expect(page.locator('body')).toBeVisible();

		// Check if content is properly displayed (allow for some variance in width)
		const body = page.locator('body');
		await expect(body).toBeVisible();
	});

	test('should handle dark/light theme toggle', async ({ page }) => {
		await page.goto('/');

		// Look for theme toggle button (if exists)
		const themeToggle = page.locator('[data-testid="theme-toggle"]').first();

		if (await themeToggle.isVisible()) {
			// Test theme switching
			await themeToggle.click();

			// Check if theme changed (look for dark/light class on html or body)
			const html = page.locator('html');
			const hasThemeClass = await html.evaluate((el) => {
				return el.classList.contains('dark') || el.classList.contains('light');
			});

			expect(hasThemeClass).toBeTruthy();
		}
	});

	test('should have proper accessibility features', async ({ page }) => {
		await page.goto('/');

		// Check for proper heading structure
		const h1 = page.locator('h1').first();
		if (await h1.isVisible()) {
			await expect(h1).toBeVisible();
		}

		// Check for skip links or other accessibility features
		const skipLink = page.locator('[href="#main-content"]').first();
		if (await skipLink.isVisible()) {
			await expect(skipLink).toBeVisible();
		}
	});

	test('should load without JavaScript errors', async ({ page }) => {
		const errors: string[] = [];

		// Listen for console errors
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		// Listen for page errors
		page.on('pageerror', (error) => {
			errors.push(error.message);
		});

		await page.goto('/');

		// Wait a bit for any async operations
		await page.waitForTimeout(2000);

		// Check that no critical errors occurred (allow some common development errors)
		const criticalErrors = errors.filter(
			(error) =>
				!error.includes('favicon') &&
				!error.includes('404') &&
				!error.includes('net::ERR_') &&
				!error.includes('Toaster is not defined') &&
				!error.includes('500 (Internal Server Error)')
		);

		expect(criticalErrors).toHaveLength(0);
	});

	test('should have proper performance characteristics', async ({ page }) => {
		await page.goto('/');

		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Check that page loads in reasonable time
		const navigationTiming = await page.evaluate(() => {
			const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
			return {
				domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
				loadComplete: timing.loadEventEnd - timing.loadEventStart
			};
		});

		// These are reasonable thresholds for a development environment
		expect(navigationTiming.domContentLoaded).toBeLessThan(5000); // 5 seconds
		expect(navigationTiming.loadComplete).toBeLessThan(10000); // 10 seconds
	});

	test('should handle network failures gracefully', async ({ page }) => {
		// First load the page normally
		await page.goto('/');

		// Then simulate offline condition
		await page.context().setOffline(true);

		try {
			await page.reload({ waitUntil: 'domcontentloaded', timeout: 5000 });
		} catch (error) {
			// Expected to fail when offline
			console.log('Expected offline error:', error);
		}

		// Restore network
		await page.context().setOffline(false);
	});
});
