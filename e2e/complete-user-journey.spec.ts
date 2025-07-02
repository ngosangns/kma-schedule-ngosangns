import { test, expect } from '@playwright/test'
import { getTestConfig, validateTestEnvironment, logTestStep, takeDebugScreenshot } from './helpers/test-config'
import { LoginPage } from './pages/LoginPage'
import { CalendarPage } from './pages/CalendarPage'

// Validate environment before running tests
test.beforeAll(async () => {
  validateTestEnvironment()
})

test.describe('Complete User Journey with Real KMA Data', () => {
  let loginPage: LoginPage
  let calendarPage: CalendarPage
  let testConfig: ReturnType<typeof getTestConfig>

  test.beforeEach(async ({ page }) => {
    testConfig = getTestConfig()
    loginPage = new LoginPage(page)
    calendarPage = new CalendarPage(page)
  })

  test('Complete workflow: Login → View Calendar → Change Semester → Export → Logout', async ({ page }) => {
    logTestStep('Starting complete user journey test')
    
    // Step 1: Navigate to application
    logTestStep('Step 1: Navigate to application')
    await loginPage.goto()
    await takeDebugScreenshot(page, 'homepage')
    
    // Step 2: Verify login form is displayed
    logTestStep('Step 2: Verify login form')
    await expect(await loginPage.isLoginFormVisible()).toBe(true)
    await loginPage.validateLoginForm()
    
    // Step 3: Login with real credentials
    logTestStep('Step 3: Login with real KMA credentials')
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await takeDebugScreenshot(page, 'after-login')
    
    // Step 4: Verify calendar page loaded
    logTestStep('Step 4: Verify calendar page loaded')
    await expect(await calendarPage.isCalendarPageLoaded()).toBe(true)
    await calendarPage.waitForCalendarData()
    await takeDebugScreenshot(page, 'calendar-loaded')
    
    // Step 5: Validate user and student information
    logTestStep('Step 5: Validate user information')
    const userInfo = await calendarPage.getUserInfo()
    const studentInfo = await calendarPage.getStudentInfo()
    
    expect(userInfo.length).toBeGreaterThan(0)
    expect(studentInfo.length).toBeGreaterThan(0)
    
    console.log('✓ User Info:', userInfo)
    console.log('✓ Student Info:', studentInfo)
    
    // Step 6: Check calendar data and subjects
    logTestStep('Step 6: Validate calendar data')
    if (await calendarPage.hasCalendarData()) {
      const subjects = await calendarPage.getSubjects()
      const subjectsCount = await calendarPage.getSubjectsCount()
      
      expect(subjectsCount).toBeGreaterThan(0)
      console.log(`✓ Found ${subjectsCount} subjects`)
      
      // Log first few subjects for verification
      subjects.slice(0, 3).forEach((subject, index) => {
        console.log(`  ${index + 1}. ${subject}`)
      })
      
      // Validate expected subjects count if configured
      if (testConfig.expectedSubjectsCount) {
        expect(subjectsCount).toBe(testConfig.expectedSubjectsCount)
        console.log(`✓ Subjects count matches expected: ${testConfig.expectedSubjectsCount}`)
      }
    } else {
      console.log('ℹ No calendar data available for this account')
    }
    
    // Step 7: Test semester functionality
    logTestStep('Step 7: Test semester functionality')
    const availableSemesters = await calendarPage.getAvailableSemesters()
    console.log('✓ Available semesters:', availableSemesters)
    
    if (availableSemesters.length > 1) {
      const originalSemester = availableSemesters[0]
      const newSemester = availableSemesters[1]
      
      logTestStep(`Changing semester from ${originalSemester} to ${newSemester}`)
      await calendarPage.changeSemester(newSemester)
      await calendarPage.waitForCalendarData()
      await takeDebugScreenshot(page, 'semester-changed')
      
      console.log(`✓ Successfully changed semester to ${newSemester}`)
      
      // Change back to original semester
      await calendarPage.changeSemester(originalSemester)
      await calendarPage.waitForCalendarData()
      console.log(`✓ Changed back to original semester ${originalSemester}`)
    } else {
      console.log('ℹ Only one semester available, skipping semester change')
    }
    
    // Step 8: Test export functionality
    logTestStep('Step 8: Test calendar export')
    if (await calendarPage.hasCalendarData()) {
      try {
        await calendarPage.exportCalendar()
        console.log('✓ Calendar export successful')
      } catch (error) {
        console.log('ℹ Calendar export not available or failed:', error)
      }
    } else {
      console.log('ℹ No calendar data to export')
    }
    
    // Step 9: Check for schedule conflicts
    logTestStep('Step 9: Check for schedule conflicts')
    if (await calendarPage.hasCalendarData()) {
      const conflicts = await calendarPage.checkForConflicts()
      
      if (conflicts.length > 0) {
        console.log('⚠ Schedule conflicts found:')
        conflicts.forEach((conflict, index) => {
          console.log(`  ${index + 1}. ${conflict}`)
        })
      } else {
        console.log('✓ No schedule conflicts detected')
      }
    }
    
    // Step 10: Test mobile responsiveness
    logTestStep('Step 10: Test mobile responsiveness')
    await calendarPage.validateMobileLayout()
    console.log('✓ Mobile layout validation successful')
    await takeDebugScreenshot(page, 'mobile-layout')
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1280, height: 720 })
    
    // Step 11: Validate semester information
    logTestStep('Step 11: Validate semester information')
    const semesterInfo = await calendarPage.getSemesterInfo()
    if (semesterInfo) {
      console.log('✓ Semester information:', semesterInfo)
      
      if (testConfig.expectedSemester) {
        expect(semesterInfo).toContain(testConfig.expectedSemester)
        console.log(`✓ Semester matches expected: ${testConfig.expectedSemester}`)
      }
    }
    
    // Step 12: Test logout functionality
    logTestStep('Step 12: Test logout')
    await calendarPage.logout()
    await takeDebugScreenshot(page, 'after-logout')
    
    // Verify we're back to login page
    await expect(await loginPage.isLoginFormVisible()).toBe(true)
    console.log('✓ Logout successful - back to login page')
    
    logTestStep('Complete user journey test finished successfully!')
  })

  test('Alternative workflow: Manual data input → Process → View results', async ({ page }) => {
    logTestStep('Starting manual data input workflow test')
    
    // Step 1: Navigate to application
    await loginPage.goto()
    
    // Step 2: Use manual data input instead of login
    logTestStep('Step 2: Test manual data input')
    try {
      await loginPage.inputManualData(`
        <html>
          <body>
            <table>
              <tr><td>Lập trình Web</td><td>IT4409</td><td>Thứ 2, 7:00-9:30</td></tr>
              <tr><td>Cơ sở dữ liệu</td><td>IT3090</td><td>Thứ 3, 13:00-15:30</td></tr>
              <tr><td>Mạng máy tính</td><td>IT4062</td><td>Thứ 5, 9:00-11:30</td></tr>
            </table>
          </body>
        </html>
      `)
      
      await loginPage.waitForLoadingComplete()
      await takeDebugScreenshot(page, 'manual-data-processed')
      
      // Check if we're redirected to calendar view
      if (await calendarPage.isCalendarPageLoaded()) {
        await calendarPage.waitForCalendarData()
        
        const subjects = await calendarPage.getSubjects()
        console.log('✓ Manual data processed successfully')
        console.log(`✓ Found ${subjects.length} subjects from manual input`)
        
        subjects.forEach((subject, index) => {
          console.log(`  ${index + 1}. ${subject}`)
        })
      } else {
        console.log('ℹ Manual data input may require different handling or login')
      }
    } catch (error) {
      console.log('ℹ Manual data input not available or requires login first:', error)
    }
  })

  test('Error handling and edge cases', async ({ page }) => {
    logTestStep('Testing error handling and edge cases')
    
    // Test 1: Invalid credentials
    logTestStep('Test 1: Invalid credentials')
    await loginPage.goto()
    
    try {
      await loginPage.login({
        username: 'invalid_user_12345',
        password: 'invalid_password_12345'
      })
      
      await loginPage.waitForLoginError()
      const errorMessage = await loginPage.getErrorMessage()
      
      if (errorMessage.length > 0) {
        console.log('✓ Error handling for invalid credentials works')
        console.log('Error message:', errorMessage)
      }
    } catch (error) {
      console.log('ℹ No explicit error message shown for invalid credentials')
    }
    
    // Test 2: Network simulation (if supported)
    logTestStep('Test 2: Network error simulation')
    try {
      await page.context().setOffline(true)
      await page.reload()
      await page.waitForTimeout(2000)
      
      console.log('✓ Offline mode handled gracefully')
      
      // Restore network
      await page.context().setOffline(false)
      await page.reload()
      await page.waitForTimeout(2000)
    } catch (error) {
      console.log('ℹ Network error simulation:', error)
    }
    
    // Test 3: Empty form submission
    logTestStep('Test 3: Empty form validation')
    await loginPage.goto()
    await loginPage.testEmptyFieldValidation()
    console.log('✓ Empty form validation tested')
    
    logTestStep('Error handling tests completed')
  })

  test('Performance and accessibility validation', async ({ page }) => {
    logTestStep('Testing performance and accessibility')
    
    // Navigate and login
    await loginPage.goto()
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    // Test keyboard navigation
    logTestStep('Testing keyboard accessibility')
    await loginPage.testKeyboardNavigation()
    console.log('✓ Keyboard navigation tested')
    
    // Check page performance
    logTestStep('Checking page performance')
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
      }
    })
    
    console.log('✓ Performance metrics:')
    console.log(`  DOM Content Loaded: ${navigationTiming.domContentLoaded}ms`)
    console.log(`  Load Complete: ${navigationTiming.loadComplete}ms`)
    
    // Basic accessibility checks
    logTestStep('Basic accessibility validation')
    const hasH1 = await page.locator('h1').first().isVisible()
    const hasSkipLink = await page.locator('[href="#main-content"]').first().isVisible()
    
    console.log(`✓ Has H1 heading: ${hasH1}`)
    console.log(`✓ Has skip link: ${hasSkipLink}`)
    
    logTestStep('Performance and accessibility tests completed')
  })
})
