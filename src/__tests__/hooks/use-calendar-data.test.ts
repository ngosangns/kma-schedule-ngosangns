import { renderHook, act } from '@testing-library/react'
import { useCalendarData } from '@/hooks/use-calendar-data'
import { useAuth, useCalendar } from '@/contexts/AppContext'
import { useNotifications } from '@/hooks/use-notifications'
import { saveData } from '@/lib/ts/storage'
import {
  fetchCalendarWithGet,
  fetchCalendarWithPost,
  processCalendar,
  processMainForm,
  processSemesters,
  processStudent,
  filterTrashInHtml,
  exportToGoogleCalendar,
} from '@/lib/ts/calendar'
import { login as loginUser, logout as logoutUser } from '@/lib/ts/user'
import { mockCalendarData, mockUser } from '../mocks/data'

// Mock all dependencies
jest.mock('@/contexts/AppContext')
jest.mock('@/hooks/use-notifications')
jest.mock('@/lib/ts/storage')
jest.mock('@/lib/ts/calendar')
jest.mock('@/lib/ts/user')

describe('useCalendarData', () => {
  const mockLogin = jest.fn()
  const mockLogout = jest.fn()
  const mockSetLoading = jest.fn()
  const mockSetError = jest.fn()
  const mockSetCalendar = jest.fn()
  const mockSetStudent = jest.fn()
  const mockShowSuccess = jest.fn()
  const mockShowError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useAuth
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      logout: mockLogout,
      setLoading: mockSetLoading,
      setError: mockSetError,
    })

    // Mock useCalendar
    ;(useCalendar as jest.Mock).mockReturnValue({
      setCalendar: mockSetCalendar,
      setStudent: mockSetStudent,
    })

    // Mock useNotifications
    ;(useNotifications as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    })

    // Mock calendar functions
    ;(loginUser as jest.Mock).mockResolvedValue('mock-signin-token')
    ;(fetchCalendarWithGet as jest.Mock).mockResolvedValue('<html>mock response</html>')
    ;(filterTrashInHtml as jest.Mock).mockReturnValue('<html>filtered response</html>')
    ;(processCalendar as jest.Mock).mockResolvedValue(mockCalendarData)
    ;(processStudent as jest.Mock).mockReturnValue('Test Student')
    ;(processMainForm as jest.Mock).mockReturnValue({ key: 'value' })
    ;(processSemesters as jest.Mock).mockReturnValue({
      semesters: [{ value: '20231', name: 'Semester 1' }],
      currentSemester: '20231',
    })
    ;(saveData as jest.Mock).mockImplementation(() => {})
    ;(logoutUser as jest.Mock).mockImplementation(() => {})
    ;(exportToGoogleCalendar as jest.Mock).mockImplementation(() => {})
  })

  it('should initialize with isProcessing false', () => {
    const { result } = renderHook(() => useCalendarData())
    
    expect(result.current.isProcessing).toBe(false)
  })

  it('should provide all expected functions', () => {
    const { result } = renderHook(() => useCalendarData())
    
    expect(typeof result.current.loginWithCredentials).toBe('function')
    expect(typeof result.current.processManualData).toBe('function')
    expect(typeof result.current.changeSemester).toBe('function')
    expect(typeof result.current.exportCalendar).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })

  describe('loginWithCredentials', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useCalendarData())
      
      let loginResult: any
      
      await act(async () => {
        loginResult = await result.current.loginWithCredentials('testuser', 'password')
      })

      expect(mockSetLoading).toHaveBeenCalled()
      expect(loginUser).toHaveBeenCalledWith('testuser', 'password')
      expect(fetchCalendarWithGet).toHaveBeenCalledWith('mock-signin-token')
      expect(processCalendar).toHaveBeenCalled()
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 'testuser', name: 'Test Student' },
        'mock-signin-token'
      )
      expect(mockSetCalendar).toHaveBeenCalledWith(mockCalendarData)
      expect(mockSetStudent).toHaveBeenCalledWith('Test Student')
      expect(mockShowSuccess).toHaveBeenCalledWith('Đăng nhập thành công!')
      expect(loginResult.success).toBe(true)
    })

    it('should handle login failure', async () => {
      ;(loginUser as jest.Mock).mockRejectedValue(new Error('Login failed'))
      
      const { result } = renderHook(() => useCalendarData())
      
      let loginResult: any
      
      await act(async () => {
        loginResult = await result.current.loginWithCredentials('testuser', 'wrongpassword')
      })

      expect(mockSetError).toHaveBeenCalledWith('Login failed')
      expect(mockShowError).toHaveBeenCalledWith('Đăng nhập thất bại', 'Login failed')
      expect(logoutUser).toHaveBeenCalled()
      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Login failed')
    })

    it('should save data after successful login', async () => {
      const { result } = renderHook(() => useCalendarData())
      
      await act(async () => {
        await result.current.loginWithCredentials('testuser', 'password')
      })

      expect(saveData).toHaveBeenCalledWith({
        signInToken: 'mock-signin-token',
        mainForm: { key: 'value' },
        semesters: {
          semesters: [{ value: '20231', name: 'Semester 1' }],
          currentSemester: '20231',
        },
        calendar: mockCalendarData,
        student: 'Test Student',
      })
    })
  })

  describe('processManualData', () => {
    it('should process manual data successfully', async () => {
      const { result } = renderHook(() => useCalendarData())
      
      let processResult: any
      
      await act(async () => {
        processResult = await result.current.processManualData('<html>manual data</html>')
      })

      expect(mockSetLoading).toHaveBeenCalled()
      expect(filterTrashInHtml).toHaveBeenCalledWith('<html>manual data</html>')
      expect(processCalendar).toHaveBeenCalled()
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 'manual-user', name: 'Test Student' },
        ''
      )
      expect(mockShowSuccess).toHaveBeenCalledWith('Dữ liệu đã được xử lý thành công!')
      expect(processResult.success).toBe(true)
    })

    it('should handle manual data processing failure', async () => {
      ;(processCalendar as jest.Mock).mockRejectedValue(new Error('Processing failed'))
      
      const { result } = renderHook(() => useCalendarData())
      
      let processResult: any
      
      await act(async () => {
        processResult = await result.current.processManualData('<html>invalid data</html>')
      })

      expect(mockSetError).toHaveBeenCalledWith('Có lỗi xảy ra khi xử lý dữ liệu!')
      expect(mockShowError).toHaveBeenCalledWith('Xử lý dữ liệu thất bại', 'Có lỗi xảy ra khi xử lý dữ liệu!')
      expect(logoutUser).toHaveBeenCalled()
      expect(processResult.success).toBe(false)
    })
  })

  describe('changeSemester', () => {
    const mockCurrentData = {
      semesters: { currentSemester: '20231' },
      mainForm: { drpSemester: '20231' },
      signInToken: 'mock-token',
    }

    it('should return early if semester is the same', async () => {
      const { result } = renderHook(() => useCalendarData())
      
      let changeResult: any
      
      await act(async () => {
        changeResult = await result.current.changeSemester('20231', mockCurrentData)
      })

      expect(changeResult.success).toBe(true)
      expect(changeResult.data).toBe(null)
      expect(fetchCalendarWithPost).not.toHaveBeenCalled()
    })

    it('should change semester successfully', async () => {
      ;(fetchCalendarWithPost as jest.Mock).mockResolvedValue('<html>new semester data</html>')
      
      const { result } = renderHook(() => useCalendarData())
      
      let changeResult: any
      
      await act(async () => {
        changeResult = await result.current.changeSemester('20232', mockCurrentData)
      })

      expect(result.current.isProcessing).toBe(false) // Should be false after completion
      expect(fetchCalendarWithPost).toHaveBeenCalledWith(
        { drpSemester: '20232' },
        'mock-token'
      )
      expect(mockShowSuccess).toHaveBeenCalledWith('Đã cập nhật học kỳ thành công!')
      expect(changeResult.success).toBe(true)
    })

    it('should handle semester change failure', async () => {
      ;(fetchCalendarWithPost as jest.Mock).mockRejectedValue(new Error('Fetch failed'))
      
      const { result } = renderHook(() => useCalendarData())
      
      let changeResult: any
      
      await act(async () => {
        changeResult = await result.current.changeSemester('20232', mockCurrentData)
      })

      expect(mockShowError).toHaveBeenCalledWith('Cập nhật học kỳ thất bại', 'Có lỗi xảy ra khi lấy dữ liệu!')
      expect(changeResult.success).toBe(false)
      expect(result.current.isProcessing).toBe(false)
    })
  })

  describe('exportCalendar', () => {
    it('should export calendar successfully', () => {
      const { result } = renderHook(() => useCalendarData())
      
      const exportResult = result.current.exportCalendar('Test Student', mockCalendarData)

      expect(exportToGoogleCalendar).toHaveBeenCalledWith('Test Student', mockCalendarData)
      expect(mockShowSuccess).toHaveBeenCalledWith('Đã xuất lịch thành công!')
      expect(exportResult.success).toBe(true)
    })

    it('should handle export failure', () => {
      ;(exportToGoogleCalendar as jest.Mock).mockImplementation(() => {
        throw new Error('Export failed')
      })
      
      const { result } = renderHook(() => useCalendarData())
      
      const exportResult = result.current.exportCalendar('Test Student', mockCalendarData)

      expect(mockShowError).toHaveBeenCalledWith('Xuất lịch thất bại', 'Có lỗi xảy ra khi xuất lịch!')
      expect(exportResult.success).toBe(false)
    })
  })

  describe('logout', () => {
    it('should logout successfully', () => {
      const { result } = renderHook(() => useCalendarData())
      
      result.current.logout()

      expect(logoutUser).toHaveBeenCalled()
      expect(mockLogout).toHaveBeenCalled()
      expect(mockShowSuccess).toHaveBeenCalledWith('Đã đăng xuất thành công!')
    })
  })

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useCalendarData())
    
    const firstLoginFunction = result.current.loginWithCredentials
    const firstLogoutFunction = result.current.logout
    
    rerender()
    
    expect(result.current.loginWithCredentials).toBe(firstLoginFunction)
    expect(result.current.logout).toBe(firstLogoutFunction)
  })
})
