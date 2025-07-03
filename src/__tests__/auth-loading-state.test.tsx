import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AppProvider, useAuth } from '@/contexts/AppContext'
import { loadData } from '@/lib/ts/storage'

// Mock storage
jest.mock('@/lib/ts/storage')

// Test component to access auth state
function TestComponent() {
  const { isLoading, isAuthenticated, user } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user?.name || 'no-user'}</div>
    </div>
  )
}

describe('Auth Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should start with loading state true', () => {
    ;(loadData as jest.Mock).mockReturnValue(null)
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
  })

  it('should set loading to false after initialization with no stored data', async () => {
    ;(loadData as jest.Mock).mockReturnValue(null)
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Should eventually stop loading
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('should set loading to false after loading from storage', async () => {
    ;(loadData as jest.Mock).mockReturnValue({
      signInToken: 'test-token',
      calendar: { data_subject: [] },
      student: 'Test Student',
      user: { name: 'Test User' }
    })
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Should eventually stop loading and be authenticated
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('Test User')
  })

  it('should handle empty storage data correctly', async () => {
    ;(loadData as jest.Mock).mockReturnValue({
      signInToken: null,
      calendar: null,
      student: null,
      user: null
    })
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Should eventually stop loading but not be authenticated
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })
})
