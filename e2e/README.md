# E2E Testing with Playwright

This directory contains end-to-end tests for the KMA Schedule application using Playwright with real KMA credentials.

## Setup

1. Install Playwright dependencies:

```bash
npm install --save-dev @playwright/test dotenv
npx playwright install
```

2. Configure test credentials:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your real KMA credentials
TEST_USERNAME=your_kma_username
TEST_PASSWORD=your_kma_password
```

3. Make sure your development server is running:

```bash
npm run dev
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with real KMA data (recommended)
npx playwright test login-flow-real.spec.ts
npx playwright test complete-user-journey.spec.ts

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test homepage.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Advanced Options

```bash
# Run tests with specific tag
npx playwright test --grep "@smoke"

# Run tests in parallel
npx playwright test --workers=4

# Generate test report
npx playwright show-report
```

## Test Structure

### Test Files

- `homepage.spec.ts` - Tests for homepage functionality, performance, and accessibility
- `login-flow.spec.ts` - Basic login flow tests (legacy)
- `login-flow-real.spec.ts` - **Login tests with real KMA credentials**
- `calendar-functionality.spec.ts` - Tests for calendar features and user interactions
- `complete-user-journey.spec.ts` - **Complete end-to-end user journey with real data**

### Test Categories

#### Homepage Tests

- Page loading and basic functionality
- Responsive design
- Performance characteristics
- Accessibility features
- Error handling

#### Login Flow Tests

- Form validation
- Authentication workflows
- Success/error states
- Session persistence
- Manual data input

#### Calendar Functionality Tests

- Calendar data display
- Semester selection
- Subject information
- Export functionality
- Schedule conflicts
- Mobile responsiveness

## Configuration

The Playwright configuration is defined in `playwright.config.ts` at the project root.

### Key Settings

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

### Environment Variables

You can customize test behavior with environment variables:

```bash
# Run in CI mode
CI=true npm run test:e2e

# Custom base URL
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

## Writing Tests

### Best Practices

1. **Use data-testid attributes** for reliable element selection:

```typescript
await page.locator('[data-testid="login-button"]').click();
```

2. **Wait for elements properly**:

```typescript
await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
```

3. **Handle different states gracefully**:

```typescript
const loginButton = page.locator('button').filter({ hasText: /login/i }).first();
if (await loginButton.isVisible()) {
	await loginButton.click();
}
```

4. **Use proper assertions**:

```typescript
await expect(page).toHaveTitle(/KMA Schedule/i);
await expect(element).toBeVisible();
await expect(element).toContainText('Expected text');
```

### Test Data

#### Real KMA Credentials (Recommended)

Configure your actual KMA credentials in `.env`:

```bash
TEST_USERNAME=your_actual_kma_username
TEST_PASSWORD=your_actual_kma_password

# Optional: Alternative credentials for testing multiple accounts
TEST_USERNAME_2=another_kma_username
TEST_PASSWORD_2=another_kma_password

# Optional: Expected test data for validation
TEST_SEMESTER=20241
TEST_EXPECTED_SUBJECTS=5
```

#### Mock Data (Legacy)

For basic tests that don't require real data:

- Username: `test_user`
- Password: `test_password`

**Important**: Real data tests (`login-flow-real.spec.ts` and `complete-user-journey.spec.ts`) require actual KMA credentials to work properly.

### Page Object Model

Consider using Page Object Model for complex interactions:

```typescript
class LoginPage {
	constructor(private page: Page) {}

	async login(username: string, password: string) {
		await this.page.locator('[data-testid="username"]').fill(username);
		await this.page.locator('[data-testid="password"]').fill(password);
		await this.page.locator('[data-testid="login-button"]').click();
	}
}
```

## Debugging

### Visual Debugging

1. **UI Mode**: `npm run test:e2e:ui` - Interactive test runner
2. **Headed Mode**: `npm run test:e2e:headed` - See browser while tests run
3. **Debug Mode**: `npm run test:e2e:debug` - Step through tests

### Screenshots and Videos

Failed tests automatically capture:

- Screenshots at the point of failure
- Videos of the entire test run
- Traces for detailed debugging

Access these in the `test-results` directory.

### Console Logs

Tests capture console errors and page errors automatically. Check test output for details.

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in config or use `page.waitForTimeout()`
2. **Elements not found**: Check selectors and wait for elements to be visible
3. **Flaky tests**: Add proper waits and handle async operations
4. **Browser not launching**: Run `npx playwright install` to install browsers

### Performance

- Tests run in parallel by default
- Use `test.describe.serial()` for tests that must run sequentially
- Consider using `test.skip()` for tests that are not ready

## Reporting

Playwright generates HTML reports automatically. View them with:

```bash
npx playwright show-report
```

Reports include:

- Test results and timing
- Screenshots and videos
- Traces for failed tests
- Performance metrics
