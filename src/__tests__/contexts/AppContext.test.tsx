import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp, useAuth, useCalendar, useUI } from '@/contexts/AppContext';
import { loadData, saveData } from '@/lib/ts/storage';
import { mockUser, mockCalendarData, mockStorageData } from '../mocks/data';

// Mock storage functions
jest.mock('@/lib/ts/storage', () => ({
	loadData: jest.fn(),
	saveData: jest.fn()
}));

describe('AppContext', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(loadData as jest.Mock).mockReturnValue(null);
		(saveData as jest.Mock).mockImplementation(() => {});
	});

	describe('AppProvider', () => {
		it('should provide initial state', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			expect(result.current.state).toEqual({
				auth: {
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null
				},
				calendar: null,
				ui: {
					theme: 'dark',
					sidebarOpen: false,
					currentView: 'calendar'
				},
				student: null
			});
		});

		it('should load data from storage on mount', () => {
			(loadData as jest.Mock).mockReturnValue(mockStorageData);

			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			expect(loadData).toHaveBeenCalled();
			expect(result.current.state.auth.isAuthenticated).toBe(true);
			expect(result.current.state.calendar).toEqual(mockStorageData.calendar);
			expect(result.current.state.student).toBe(mockStorageData.student);
		});

		it('should save data when authenticated with calendar', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.dispatch({
					type: 'AUTH_SUCCESS',
					payload: { user: mockUser, signInToken: 'test-token' }
				});
			});

			act(() => {
				result.current.dispatch({
					type: 'SET_CALENDAR',
					payload: mockCalendarData
				});
			});

			expect(saveData).toHaveBeenCalledWith({
				calendar: mockCalendarData,
				student: undefined,
				user: mockUser
			});
		});
	});

	describe('useApp hook', () => {
		it('should throw error when used outside provider', () => {
			expect(() => {
				renderHook(() => useApp());
			}).toThrow('useApp must be used within an AppProvider');
		});

		it('should provide state and dispatch', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			expect(result.current.state).toBeDefined();
			expect(result.current.dispatch).toBeDefined();
			expect(typeof result.current.dispatch).toBe('function');
		});
	});

	describe('useAuth hook', () => {
		it('should provide auth state and methods', async () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: AppProvider
			});

			// After initialization (since loadData is mocked to return null, loading should be false)
			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.user).toBe(null);
			expect(result.current.isAuthenticated).toBe(false);
			expect(result.current.error).toBe(null);
			expect(typeof result.current.login).toBe('function');
			expect(typeof result.current.logout).toBe('function');
			expect(typeof result.current.setLoading).toBe('function');
			expect(typeof result.current.setError).toBe('function');
		});

		it('should handle login', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.login(mockUser, 'test-token');
			});

			expect(result.current.user).toEqual(mockUser);
			expect(result.current.isAuthenticated).toBe(true);
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBe(null);
		});

		it('should handle logout', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: AppProvider
			});

			// First login
			act(() => {
				result.current.login(mockUser, 'test-token');
			});

			// Then logout
			act(() => {
				result.current.logout();
			});

			expect(result.current.user).toBe(null);
			expect(result.current.isAuthenticated).toBe(false);
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBe(null);
		});

		it('should handle loading state', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.setLoading();
			});

			expect(result.current.isLoading).toBe(true);
			expect(result.current.error).toBe(null);
		});

		it('should handle error state', () => {
			const { result } = renderHook(() => useAuth(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.setError('Test error');
			});

			expect(result.current.error).toBe('Test error');
			expect(result.current.isLoading).toBe(false);
			expect(result.current.isAuthenticated).toBe(false);
		});
	});

	describe('useCalendar hook', () => {
		it('should provide calendar state and methods', () => {
			const { result } = renderHook(() => useCalendar(), {
				wrapper: AppProvider
			});

			expect(result.current.calendar).toBe(null);
			expect(result.current.student).toBe(null);
			expect(typeof result.current.setCalendar).toBe('function');
			expect(typeof result.current.setStudent).toBe('function');
		});

		it('should handle setting calendar', () => {
			const { result } = renderHook(() => useCalendar(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.setCalendar(mockCalendarData);
			});

			expect(result.current.calendar).toEqual(mockCalendarData);
		});

		it('should handle setting student', () => {
			const { result } = renderHook(() => useCalendar(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.setStudent('Test Student');
			});

			expect(result.current.student).toBe('Test Student');
		});
	});

	describe('useUI hook', () => {
		it('should provide UI state and methods', () => {
			const { result } = renderHook(() => useUI(), {
				wrapper: AppProvider
			});

			expect(result.current.theme).toBe('dark');
			expect(result.current.sidebarOpen).toBe(false);
			expect(result.current.currentView).toBe('calendar');
			expect(typeof result.current.setTheme).toBe('function');
			expect(typeof result.current.toggleSidebar).toBe('function');
			expect(typeof result.current.setView).toBe('function');
		});

		it('should handle theme change', () => {
			const { result } = renderHook(() => useUI(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.setTheme('light');
			});

			expect(result.current.theme).toBe('light');
		});

		it('should handle sidebar toggle', () => {
			const { result } = renderHook(() => useUI(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.toggleSidebar();
			});

			expect(result.current.sidebarOpen).toBe(true);

			act(() => {
				result.current.toggleSidebar();
			});

			expect(result.current.sidebarOpen).toBe(false);
		});

		it('should handle view change', () => {
			const { result } = renderHook(() => useUI(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.setView('list');
			});

			expect(result.current.currentView).toBe('list');

			act(() => {
				result.current.setView('agenda');
			});

			expect(result.current.currentView).toBe('agenda');
		});
	});

	describe('Reducer actions', () => {
		it('should handle AUTH_START action', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.dispatch({ type: 'AUTH_START' });
			});

			expect(result.current.state.auth.isLoading).toBe(true);
			expect(result.current.state.auth.error).toBe(null);
		});

		it('should handle AUTH_SUCCESS action', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.dispatch({
					type: 'AUTH_SUCCESS',
					payload: { user: mockUser, signInToken: 'test-token' }
				});
			});

			expect(result.current.state.auth.user).toEqual(mockUser);
			expect(result.current.state.auth.isAuthenticated).toBe(true);
			expect(result.current.state.auth.isLoading).toBe(false);
			expect(result.current.state.auth.error).toBe(null);
		});

		it('should handle AUTH_ERROR action', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.dispatch({
					type: 'AUTH_ERROR',
					payload: 'Authentication failed'
				});
			});

			expect(result.current.state.auth.user).toBe(null);
			expect(result.current.state.auth.isAuthenticated).toBe(false);
			expect(result.current.state.auth.isLoading).toBe(false);
			expect(result.current.state.auth.error).toBe('Authentication failed');
		});

		it('should handle AUTH_LOGOUT action', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			// First login and set some data
			act(() => {
				result.current.dispatch({
					type: 'AUTH_SUCCESS',
					payload: { user: mockUser, signInToken: 'test-token' }
				});
				result.current.dispatch({
					type: 'SET_CALENDAR',
					payload: mockCalendarData
				});
				result.current.dispatch({
					type: 'SET_STUDENT',
					payload: 'Test Student'
				});
			});

			// Then logout
			act(() => {
				result.current.dispatch({ type: 'AUTH_LOGOUT' });
			});

			expect(result.current.state.auth.user).toBe(null);
			expect(result.current.state.auth.isAuthenticated).toBe(false);
			expect(result.current.state.calendar).toBe(null);
			expect(result.current.state.student).toBe(null);
		});

		it('should handle LOAD_FROM_STORAGE action', () => {
			const { result } = renderHook(() => useApp(), {
				wrapper: AppProvider
			});

			act(() => {
				result.current.dispatch({
					type: 'LOAD_FROM_STORAGE',
					payload: mockStorageData
				});
			});

			expect(result.current.state.auth.isAuthenticated).toBe(true);
			expect(result.current.state.calendar).toEqual(mockStorageData.calendar);
			expect(result.current.state.student).toBe(mockStorageData.student);
		});
	});
});
