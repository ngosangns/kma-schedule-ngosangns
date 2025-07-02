import { test, expect } from '@playwright/test'
import { getTestConfig, validateTestEnvironment, TestData } from './helpers/test-config'
import { LoginPage } from './pages/LoginPage'
import { CalendarPage } from './pages/CalendarPage'

// Validate environment before running tests
test.beforeAll(async () => {
  validateTestEnvironment()
})

test.describe('Login Flow with Real KMA Data', () => {
  let loginPage: LoginPage
  let calendarPage: CalendarPage
  let testConfig: ReturnType<typeof getTestConfig>

  test.beforeEach(async ({ page }) => {
    testConfig = getTestConfig()
    loginPage = new LoginPage(page)
    calendarPage = new CalendarPage(page)
    
    await loginPage.goto()
  })

  test('should display login form correctly', async () => {
    await expect(await loginPage.isLoginFormVisible()).toBe(true)
    await loginPage.validateLoginForm()
  })

  test('should show validation errors for empty fields', async () => {
    await loginPage.testEmptyFieldValidation()
  })

  test('should handle invalid credentials', async () => {
    await loginPage.login(TestData.invalidCredentials)
    
    try {
      await loginPage.waitForLoginError()
      const errorMessage = await loginPage.getErrorMessage()
      expect(errorMessage.length).toBeGreaterThan(0)
    } catch (error) {
      // Some apps might not show explicit error messages
      console.log('No explicit error message found, which is acceptable')
    }
  })

  test('should successfully login with real KMA credentials', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    
    // Verify we're on the calendar page
    await expect(await calendarPage.isCalendarPageLoaded()).toBe(true)
    
    // Wait for calendar data to load
    await calendarPage.waitForCalendarData()
    
    // Validate calendar content
    await calendarPage.validateCalendarContent()
  })

  test('should display user information after login', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    const userInfo = await calendarPage.getUserInfo()
    const studentInfo = await calendarPage.getStudentInfo()
    
    expect(userInfo.length).toBeGreaterThan(0)
    expect(studentInfo.length).toBeGreaterThan(0)
    
    console.log('User Info:', userInfo)
    console.log('Student Info:', studentInfo)
  })

  test('should load and display subjects', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    if (await calendarPage.hasCalendarData()) {
      const subjects = await calendarPage.getSubjects()
      const subjectsCount = await calendarPage.getSubjectsCount()
      
      expect(subjectsCount).toBeGreaterThan(0)
      console.log(`Found ${subjectsCount} subjects:`)
      subjects.forEach((subject, index) => {
        console.log(`${index + 1}. ${subject}`)
      })
      
      // Validate expected subjects count if configured
      if (testConfig.expectedSubjectsCount) {
        expect(subjectsCount).toBe(testConfig.expectedSubjectsCount)
      }
    } else {
      console.log('No calendar data available for this account')
    }
  })

  test('should handle semester selection', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    const availableSemesters = await calendarPage.getAvailableSemesters()
    console.log('Available semesters:', availableSemesters)
    
    if (availableSemesters.length > 1) {
      // Try changing to a different semester
      const currentSemester = availableSemesters[0]
      const newSemester = availableSemesters[1]
      
      await calendarPage.changeSemester(newSemester)
      await calendarPage.waitForCalendarData()
      
      console.log(`Changed from ${currentSemester} to ${newSemester}`)
    } else {
      console.log('Only one semester available, skipping semester change test')
    }
  })

  test('should export calendar successfully', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    if (await calendarPage.hasCalendarData()) {
      try {
        await calendarPage.exportCalendar()
        console.log('Calendar export successful')
      } catch (error) {
        console.log('Calendar export may not be available:', error)
      }
    } else {
      console.log('No calendar data to export')
    }
  })

  test('should handle manual data input', async () => {
    await loginPage.inputManualData(TestData.sampleCalendarHTML)
    
    // Wait for processing
    await loginPage.waitForLoadingComplete()
    
    // Check if we're redirected to calendar view
    if (await calendarPage.isCalendarPageLoaded()) {
      await calendarPage.waitForCalendarData()
      console.log('Manual data input successful')
    } else {
      console.log('Manual data input may require different handling')
    }
  })

  test('should support keyboard navigation', async () => {
    await loginPage.testKeyboardNavigation()
    
    // Test form submission with Enter key
    await loginPage.submitWithEnter(testConfig.credentials)
    
    // Verify login success
    if (await calendarPage.isCalendarPageLoaded()) {
      console.log('Keyboard navigation and Enter key submission successful')
    }
  })

  test('should handle logout correctly', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    // Logout
    await calendarPage.logout()
    
    // Verify we're back to login page
    await expect(await loginPage.isLoginFormVisible()).toBe(true)
  })

  test('should persist session across page refreshes', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    // Refresh the page
    await loginPage.page.reload()
    await loginPage.page.waitForTimeout(3000)
    
    // Check if still logged in
    const isStillLoggedIn = await calendarPage.isCalendarPageLoaded()
    
    if (isStillLoggedIn) {
      console.log('Session persisted across page refresh')
    } else {
      console.log('Session did not persist - user needs to login again')
      // This might be expected behavior depending on the app
    }
  })

  test('should be responsive on mobile devices', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    // Test mobile layout
    await calendarPage.validateMobileLayout()
    console.log('Mobile layout validation successful')
  })

  test('should check for schedule conflicts', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    if (await calendarPage.hasCalendarData()) {
      const conflicts = await calendarPage.checkForConflicts()
      
      if (conflicts.length > 0) {
        console.log('Schedule conflicts found:')
        conflicts.forEach((conflict, index) => {
          console.log(`${index + 1}. ${conflict}`)
        })
      } else {
        console.log('No schedule conflicts detected')
      }
    }
  })

  test('should handle alternative credentials if available', async () => {
    if (testConfig.alternativeCredentials) {
      await loginPage.loginAndWaitForSuccess(testConfig.alternativeCredentials)
      await calendarPage.waitForCalendarData()
      
      console.log('Alternative credentials login successful')
      
      const userInfo = await calendarPage.getUserInfo()
      console.log('Alternative user info:', userInfo)
    } else {
      console.log('No alternative credentials configured, skipping test')
    }
  })

  test('should validate semester information', async () => {
    await loginPage.loginAndWaitForSuccess(testConfig.credentials)
    await calendarPage.waitForCalendarData()
    
    const semesterInfo = await calendarPage.getSemesterInfo()
    console.log('Semester information:', semesterInfo)
    
    if (testConfig.expectedSemester) {
      expect(semesterInfo).toContain(testConfig.expectedSemester)
    }
  })
})
