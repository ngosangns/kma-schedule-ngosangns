import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppProvider } from '@/contexts/AppContext'
import { AuthState, CalendarData, UIState, StorageData } from '@/types'

// Mock data for testing
export const mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
}

export const mockAuthState: AuthState = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
}

export const mockUIState: UIState = {
  theme: 'dark',
  sidebarOpen: false,
  currentView: 'calendar',
}

export const mockCalendarData: CalendarData = {
  data_subject: [
    {
      id: '1',
      name: 'Test Subject',
      code: 'TEST101',
      credits: 3,
      instructor: 'Test Instructor',
      room: 'A101',
      schedule: [
        {
          day: 2,
          shift: 1,
          weeks: [1, 2, 3, 4, 5],
        },
      ],
    },
  ],
  semester: {
    id: '20231',
    name: 'Học kỳ 1 năm 2023-2024',
    startDate: '2023-09-01',
    endDate: '2024-01-15',
  },
}

export const mockStorageData: StorageData = {
  signInToken: 'mock-signin-token',
  mainForm: {},
  semesters: {
    semesters: [
      {
        value: '20231',
        from: '2023-09-01',
        to: '2024-01-15',
        th: 'Học kỳ 1 năm 2023-2024',
      },
    ],
    currentSemester: '20231',
  },
  calendar: mockCalendarData,
  student: 'Test Student',
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: {
    auth?: Partial<AuthState>
    ui?: Partial<UIState>
    calendar?: CalendarData | null
    student?: string | null
  }
}

const AllTheProviders = ({ 
  children, 
  initialState = {} 
}: { 
  children: React.ReactNode
  initialState?: CustomRenderOptions['initialState']
}) => {
  // Mock the AppProvider with initial state
  return (
    <AppProvider>
      {children}
    </AppProvider>
  )
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialState, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialState={initialState}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Mock functions
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(typeof response === 'string' ? response : JSON.stringify(response)),
    headers: new Headers(),
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
  })
}

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get store() {
      return { ...store }
    },
  }
}

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock router push function
export const mockRouterPush = jest.fn()

// Mock toast function
export const mockToast = jest.fn()

// Helper to create mock events
export const createMockEvent = (type: string, properties: any = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, properties)
  return event
}

// Helper to create mock form data
export const createMockFormData = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

// Helper to simulate user input
export const simulateUserInput = async (element: HTMLElement, value: string) => {
  const { fireEvent } = await import('@testing-library/react')
  fireEvent.change(element, { target: { value } })
  fireEvent.blur(element)
}

// Helper to simulate form submission
export const simulateFormSubmit = async (form: HTMLFormElement) => {
  const { fireEvent } = await import('@testing-library/react')
  fireEvent.submit(form)
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
