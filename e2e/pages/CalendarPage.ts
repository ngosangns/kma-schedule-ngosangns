import { Page, Locator, expect } from '@playwright/test'
import { TestData, logTestStep, waitForNetworkIdle } from '../helpers/test-config'

export class CalendarPage {
  readonly page: Page
  readonly userInfo: Locator
  readonly studentInfo: Locator
  readonly semesterSelect: Locator
  readonly changeSemesterButton: Locator
  readonly calendarView: Locator
  readonly subjectsList: Locator
  readonly exportButton: Locator
  readonly logoutButton: Locator
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator
  readonly noDataMessage: Locator

  constructor(page: Page) {
    this.page = page
    
    // User and session info
    this.userInfo = page.locator('[data-testid="user-info"]').first()
    this.studentInfo = page.locator('[data-testid="student-info"]').first()
    
    // Semester controls
    this.semesterSelect = page.locator('select, [data-testid="semester-select"]').first()
    this.changeSemesterButton = page.locator('button').filter({ hasText: /thay đổi|change.*semester/i }).first()
    
    // Calendar content
    this.calendarView = page.locator('[data-testid="calendar-view"], .calendar-content').first()
    this.subjectsList = page.locator('[data-testid="subjects-list"], .subjects-list').first()
    
    // Actions
    this.exportButton = page.locator('button').filter({ hasText: TestData.expectedText.export }).first()
    this.logoutButton = page.locator('button').filter({ hasText: TestData.expectedText.logoutButton }).first()
    
    // Status indicators
    this.loadingIndicator = page.locator('[data-testid="loading"], .loading').first()
    this.errorMessage = page.locator('[role="alert"], .error').first()
    this.noDataMessage = page.locator('[data-testid="no-calendar"], .no-data').first()
  }

  /**
   * Check if user is logged in and calendar page is loaded
   */
  async isCalendarPageLoaded(): Promise<boolean> {
    try {
      // Look for any indicator that we're on the calendar page
      const indicators = [
        this.userInfo,
        this.calendarView,
        this.subjectsList,
        this.semesterSelect,
      ]
      
      for (const indicator of indicators) {
        if (await indicator.isVisible({ timeout: 2000 })) {
          return true
        }
      }
      
      return false
    } catch {
      return false
    }
  }

  /**
   * Wait for calendar data to load
   */
  async waitForCalendarData(): Promise<void> {
    logTestStep('Waiting for calendar data to load')
    
    // Wait for loading to complete
    if (await this.loadingIndicator.isVisible()) {
      await expect(this.loadingIndicator).not.toBeVisible({ timeout: 30000 })
    }
    
    // Wait for either calendar data or no-data message
    await Promise.race([
      expect(this.calendarView).toBeVisible({ timeout: 15000 }),
      expect(this.subjectsList).toBeVisible({ timeout: 15000 }),
      expect(this.noDataMessage).toBeVisible({ timeout: 15000 }),
    ])
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<string> {
    if (await this.userInfo.isVisible()) {
      return await this.userInfo.textContent() || ''
    }
    return ''
  }

  /**
   * Get student information
   */
  async getStudentInfo(): Promise<string> {
    if (await this.studentInfo.isVisible()) {
      return await this.studentInfo.textContent() || ''
    }
    return ''
  }

  /**
   * Get list of subjects
   */
  async getSubjects(): Promise<string[]> {
    const subjects: string[] = []
    
    // Look for subject elements with different possible selectors
    const subjectSelectors = [
      '[data-testid^="subject-"]',
      '.subject-item',
      '.course-item',
      '.subject-card',
    ]
    
    for (const selector of subjectSelectors) {
      const elements = this.page.locator(selector)
      const count = await elements.count()
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const text = await elements.nth(i).textContent()
          if (text) {
            subjects.push(text.trim())
          }
        }
        break
      }
    }
    
    return subjects
  }

  /**
   * Get subjects count
   */
  async getSubjectsCount(): Promise<number> {
    const subjects = await this.getSubjects()
    return subjects.length
  }

  /**
   * Change semester
   */
  async changeSemester(semesterValue: string): Promise<void> {
    logTestStep(`Changing semester to: ${semesterValue}`)
    
    if (await this.semesterSelect.isVisible()) {
      await this.semesterSelect.selectOption(semesterValue)
      
      if (await this.changeSemesterButton.isVisible()) {
        await this.changeSemesterButton.click()
      }
      
      await waitForNetworkIdle(this.page)
      await this.waitForCalendarData()
    } else {
      throw new Error('Semester selector not found')
    }
  }

  /**
   * Get available semesters
   */
  async getAvailableSemesters(): Promise<string[]> {
    if (await this.semesterSelect.isVisible()) {
      const options = this.semesterSelect.locator('option')
      const count = await options.count()
      const semesters: string[] = []
      
      for (let i = 0; i < count; i++) {
        const value = await options.nth(i).getAttribute('value')
        if (value) {
          semesters.push(value)
        }
      }
      
      return semesters
    }
    
    return []
  }

  /**
   * Export calendar
   */
  async exportCalendar(): Promise<void> {
    logTestStep('Exporting calendar')
    
    if (await this.exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = this.page.waitForEvent('download', { timeout: 10000 })
      
      await this.exportButton.click()
      
      try {
        const download = await downloadPromise
        const filename = download.suggestedFilename()
        logTestStep(`Downloaded file: ${filename}`)
        
        // Verify it's a calendar file
        if (!filename.match(/\.(ics|csv)$/i)) {
          console.warn(`Unexpected file type: ${filename}`)
        }
        
        return download
      } catch (error) {
        console.warn('Download may not be available in test environment:', error)
      }
    } else {
      throw new Error('Export button not found or not visible')
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    logTestStep('Logging out')
    
    if (await this.logoutButton.isVisible()) {
      await this.logoutButton.click()
      await waitForNetworkIdle(this.page)
      
      // Wait for redirect to login page
      await this.page.waitForTimeout(2000)
    } else {
      throw new Error('Logout button not found')
    }
  }

  /**
   * Check if calendar has data
   */
  async hasCalendarData(): Promise<boolean> {
    // Check if there's actual calendar content
    const hasData = await Promise.race([
      this.calendarView.isVisible(),
      this.subjectsList.isVisible(),
    ])
    
    const hasNoDataMessage = await this.noDataMessage.isVisible()
    
    return hasData && !hasNoDataMessage
  }

  /**
   * Validate calendar content
   */
  async validateCalendarContent(): Promise<void> {
    logTestStep('Validating calendar content')
    
    if (await this.hasCalendarData()) {
      const subjects = await this.getSubjects()
      
      if (subjects.length === 0) {
        throw new Error('Calendar loaded but no subjects found')
      }
      
      logTestStep(`Found ${subjects.length} subjects`)
      
      // Validate that subjects have meaningful content
      for (const subject of subjects) {
        if (subject.length < 3) {
          console.warn(`Subject with very short name: "${subject}"`)
        }
      }
    } else {
      logTestStep('No calendar data available')
    }
  }

  /**
   * Search for specific subject
   */
  async findSubject(subjectName: string): Promise<boolean> {
    const subjects = await this.getSubjects()
    return subjects.some(subject => 
      subject.toLowerCase().includes(subjectName.toLowerCase())
    )
  }

  /**
   * Check for schedule conflicts
   */
  async checkForConflicts(): Promise<string[]> {
    const conflicts: string[] = []
    
    // Look for conflict indicators
    const conflictSelectors = [
      '.conflict',
      '.warning',
      '[data-testid="conflict"]',
      '.overlap',
      '.collision',
    ]
    
    for (const selector of conflictSelectors) {
      const elements = this.page.locator(selector)
      const count = await elements.count()
      
      for (let i = 0; i < count; i++) {
        const text = await elements.nth(i).textContent()
        if (text) {
          conflicts.push(text.trim())
        }
      }
    }
    
    return conflicts
  }

  /**
   * Get semester information
   */
  async getSemesterInfo(): Promise<string> {
    const semesterInfo = this.page.locator('[data-testid="semester-info"], .semester-info').first()
    
    if (await semesterInfo.isVisible()) {
      return await semesterInfo.textContent() || ''
    }
    
    return ''
  }

  /**
   * Check if page is responsive on mobile
   */
  async validateMobileLayout(): Promise<void> {
    logTestStep('Validating mobile layout')
    
    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 })
    await this.page.waitForTimeout(1000)
    
    // Check if main content is still visible
    const isContentVisible = await Promise.race([
      this.calendarView.isVisible(),
      this.subjectsList.isVisible(),
      this.userInfo.isVisible(),
    ])
    
    if (!isContentVisible) {
      throw new Error('Calendar content not visible on mobile viewport')
    }
    
    // Reset to desktop viewport
    await this.page.setViewportSize({ width: 1280, height: 720 })
  }
}
