import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export interface TestCredentials {
  username: string
  password: string
}

export interface TestConfig {
  credentials: TestCredentials
  alternativeCredentials?: TestCredentials
  baseURL: string
  timeout: number
  expectedSemester?: string
  expectedSubjectsCount?: number
}

/**
 * Get test configuration from environment variables
 */
export function getTestConfig(): TestConfig {
  const username = process.env.TEST_USERNAME
  const password = process.env.TEST_PASSWORD

  if (!username || !password) {
    throw new Error(
      'TEST_USERNAME and TEST_PASSWORD must be set in .env file. ' +
      'Copy .env.example to .env and fill in your KMA credentials.'
    )
  }

  const config: TestConfig = {
    credentials: {
      username,
      password,
    },
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000'),
  }

  // Optional alternative credentials
  if (process.env.TEST_USERNAME_2 && process.env.TEST_PASSWORD_2) {
    config.alternativeCredentials = {
      username: process.env.TEST_USERNAME_2,
      password: process.env.TEST_PASSWORD_2,
    }
  }

  // Optional test data
  if (process.env.TEST_SEMESTER) {
    config.expectedSemester = process.env.TEST_SEMESTER
  }

  if (process.env.TEST_EXPECTED_SUBJECTS) {
    config.expectedSubjectsCount = parseInt(process.env.TEST_EXPECTED_SUBJECTS)
  }

  return config
}

/**
 * Validate that required environment variables are set
 */
export function validateTestEnvironment(): void {
  const requiredVars = ['TEST_USERNAME', 'TEST_PASSWORD']
  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please copy .env.example to .env and fill in your KMA credentials.'
    )
  }
}

/**
 * Check if we're running in CI environment
 */
export function isCI(): boolean {
  return !!process.env.CI
}

/**
 * Get headless mode setting
 */
export function isHeadless(): boolean {
  if (process.env.PLAYWRIGHT_HEADLESS === 'false') return false
  if (process.env.PLAYWRIGHT_HEADLESS === 'true') return true
  return isCI() // Default to headless in CI
}

/**
 * Get test data for different scenarios
 */
export const TestData = {
  // Invalid credentials for negative testing
  invalidCredentials: {
    username: 'invalid_user_12345',
    password: 'invalid_password_12345',
  },
  
  // Sample HTML data for manual input testing
  sampleCalendarHTML: `
    <html>
      <body>
        <table>
          <tr>
            <td>Lập trình Web</td>
            <td>IT4409</td>
            <td>Thứ 2, 7:00-9:30</td>
          </tr>
          <tr>
            <td>Cơ sở dữ liệu</td>
            <td>IT3090</td>
            <td>Thứ 3, 13:00-15:30</td>
          </tr>
        </table>
      </body>
    </html>
  `,
  
  // Expected UI text (Vietnamese)
  expectedText: {
    loginButton: /đăng nhập|login/i,
    logoutButton: /đăng xuất|logout/i,
    manualInput: /thủ công|manual/i,
    export: /xuất|export/i,
    semester: /học kỳ|semester/i,
    processing: /đang.*tải|processing|loading/i,
    success: /thành công|success/i,
    error: /lỗi|thất bại|error|failed/i,
  },
}

/**
 * Wait for network idle (useful for SPA applications)
 */
export async function waitForNetworkIdle(page: any, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Take screenshot with timestamp for debugging
 */
export async function takeDebugScreenshot(page: any, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await page.screenshot({ 
    path: `test-results/debug-${name}-${timestamp}.png`,
    fullPage: true 
  })
}

/**
 * Log test step for better debugging
 */
export function logTestStep(step: string): void {
  console.log(`[TEST STEP] ${step}`)
}

/**
 * Retry function for flaky operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) break
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}
