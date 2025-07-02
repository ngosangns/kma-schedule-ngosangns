import React from 'react'
import { AuthState, CalendarData, UIState } from '@/types'

// Mock AppContext
export const mockAppContext = {
  // Auth methods
  login: jest.fn(),
  logout: jest.fn(),
  
  // Calendar methods
  setCalendar: jest.fn(),
  refreshCalendar: jest.fn(),
  
  // Student methods
  setStudent: jest.fn(),
  
  // UI methods
  setTheme: jest.fn(),
  toggleSidebar: jest.fn(),
  setView: jest.fn(),
  
  // State getters
  isAuthenticated: true,
  isLoading: false,
  user: {
    id: 'test-user',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
  },
  error: null,
  calendar: null,
  student: null,
  theme: 'dark' as const,
  sidebarOpen: false,
  currentView: 'calendar' as const,
}

// Mock Context Provider
export const MockAppProvider: React.FC<{ 
  children: React.ReactNode
  value?: Partial<typeof mockAppContext>
}> = ({ children, value = {} }) => {
  const contextValue = { ...mockAppContext, ...value }
  
  return (
    <div data-testid="mock-app-provider">
      {children}
    </div>
  )
}

// Mock Auth Provider
export const MockAuthProvider: React.FC<{
  children: React.ReactNode
  authState?: Partial<AuthState>
}> = ({ children, authState = {} }) => {
  const defaultAuthState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }
  
  const state = { ...defaultAuthState, ...authState }
  
  return (
    <div data-testid="mock-auth-provider" data-auth-state={JSON.stringify(state)}>
      {children}
    </div>
  )
}

// Mock UI Provider
export const MockUIProvider: React.FC<{
  children: React.ReactNode
  uiState?: Partial<UIState>
}> = ({ children, uiState = {} }) => {
  const defaultUIState: UIState = {
    theme: 'dark',
    sidebarOpen: false,
    currentView: 'calendar',
  }
  
  const state = { ...defaultUIState, ...uiState }
  
  return (
    <div data-testid="mock-ui-provider" data-ui-state={JSON.stringify(state)}>
      {children}
    </div>
  )
}

// Mock Calendar Provider
export const MockCalendarProvider: React.FC<{
  children: React.ReactNode
  calendarData?: CalendarData | null
}> = ({ children, calendarData = null }) => {
  return (
    <div data-testid="mock-calendar-provider" data-calendar={JSON.stringify(calendarData)}>
      {children}
    </div>
  )
}

// Mock Toast Provider
export const MockToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="mock-toast-provider">
      {children}
    </div>
  )
}

// Combined Mock Provider
export const MockProviders: React.FC<{
  children: React.ReactNode
  authState?: Partial<AuthState>
  uiState?: Partial<UIState>
  calendarData?: CalendarData | null
}> = ({ children, authState, uiState, calendarData }) => {
  return (
    <MockToastProvider>
      <MockAppProvider>
        <MockAuthProvider authState={authState}>
          <MockUIProvider uiState={uiState}>
            <MockCalendarProvider calendarData={calendarData}>
              {children}
            </MockCalendarProvider>
          </MockUIProvider>
        </MockAuthProvider>
      </MockAppProvider>
    </MockToastProvider>
  )
}
