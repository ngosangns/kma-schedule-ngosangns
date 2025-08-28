'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
	AuthState,
	ProcessedCalendarData,
	UIState,
	User,
	StorageData,
	UseAuthReturn,
	UseCalendarReturn,
	UseUIReturn
} from '@/types';
import { loadData, saveData } from '@/lib/ts/storage';

// Combined App State
interface AppState {
	auth: AuthState;
	calendar: ProcessedCalendarData | null;
	ui: UIState;
	student: string | null;
}

// Action Types
type AppAction =
	| { type: 'AUTH_START' }
	| { type: 'AUTH_SUCCESS'; payload: { user: User; signInToken: string } }
	| { type: 'AUTH_ERROR'; payload: string }
	| { type: 'AUTH_LOGOUT' }
	| { type: 'AUTH_INIT_COMPLETE' } // Đánh dấu việc khởi tạo auth đã hoàn thành
	| { type: 'SET_CALENDAR'; payload: ProcessedCalendarData }
	| { type: 'SET_STUDENT'; payload: string }
	| { type: 'SET_THEME'; payload: 'light' | 'dark' }
	| { type: 'TOGGLE_SIDEBAR' }
	| { type: 'SET_VIEW'; payload: 'calendar' | 'list' | 'agenda' }
	| { type: 'LOAD_FROM_STORAGE'; payload: StorageData };

// Initial State
const initialState: AppState = {
	auth: {
		user: null,
		isAuthenticated: false,
		isLoading: true, // Start with loading true để hiển thị loading khi khởi tạo
		error: null
	},
	calendar: null,
	ui: {
		theme: 'dark',
		sidebarOpen: false,
		currentView: 'calendar'
	},
	student: null
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
	switch (action.type) {
		case 'AUTH_START':
			return {
				...state,
				auth: {
					...state.auth,
					isLoading: true,
					error: null
				}
			};

		case 'AUTH_SUCCESS':
			return {
				...state,
				auth: {
					user: action.payload.user,
					isAuthenticated: true,
					isLoading: false,
					error: null
				}
			};

		case 'AUTH_ERROR':
			return {
				...state,
				auth: {
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: action.payload
				}
			};

		case 'AUTH_LOGOUT':
			return {
				...state,
				auth: {
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null
				},
				calendar: null,
				student: null
			};

		case 'AUTH_INIT_COMPLETE':
			return {
				...state,
				auth: {
					...state.auth,
					isLoading: false
				}
			};

		case 'SET_CALENDAR':
			return {
				...state,
				calendar: action.payload
			};

		case 'SET_STUDENT':
			return {
				...state,
				student: action.payload
			};

		case 'SET_THEME':
			return {
				...state,
				ui: {
					...state.ui,
					theme: action.payload
				}
			};

		case 'TOGGLE_SIDEBAR':
			return {
				...state,
				ui: {
					...state.ui,
					sidebarOpen: !state.ui.sidebarOpen
				}
			};

		case 'SET_VIEW':
			return {
				...state,
				ui: {
					...state.ui,
					currentView: action.payload
				}
			};

		case 'LOAD_FROM_STORAGE':
			const { signInToken, calendar, student, user } = action.payload;
			return {
				...state,
				auth: {
					user: user || null,
					isAuthenticated: !!(signInToken || calendar),
					isLoading: false,
					error: null
				},
				calendar: calendar || null,
				student: student || null
			};

		default:
			return state;
	}
}

// Context
const AppContext = createContext<{
	state: AppState;
	dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Component
export function AppProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(appReducer, initialState);

	// Load data from storage on mount
	useEffect(() => {
		const storedData = loadData();
		if (storedData) {
			dispatch({ type: 'LOAD_FROM_STORAGE', payload: storedData });
		} else {
			// Không có dữ liệu trong storage, đánh dấu init hoàn thành
			dispatch({ type: 'AUTH_INIT_COMPLETE' });
		}
	}, []);

	// Save to storage when auth state changes
	useEffect(() => {
		if (state.auth.isAuthenticated && state.calendar) {
			const dataToSave: StorageData = {
				calendar: state.calendar,
				student: state.student,
				user: state.auth.user
			};
			saveData(dataToSave);
		}
	}, [state.auth.isAuthenticated, state.calendar, state.student, state.auth.user]);

	return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within an AppProvider');
	}
	return context;
}

// Convenience hooks
export function useAuth(): UseAuthReturn {
	const { state, dispatch } = useApp();
	return {
		...state.auth,
		login: (user: User, signInToken?: string) =>
			dispatch({ type: 'AUTH_SUCCESS', payload: { user, signInToken: signInToken || '' } }),
		logout: () => dispatch({ type: 'AUTH_LOGOUT' }),
		setLoading: () => dispatch({ type: 'AUTH_START' }),
		setError: (error: string) => dispatch({ type: 'AUTH_ERROR', payload: error })
	};
}

export function useCalendar(): UseCalendarReturn {
	const { state, dispatch } = useApp();
	return {
		calendar: state.calendar,
		student: state.student,
		setCalendar: (calendar: ProcessedCalendarData) =>
			dispatch({ type: 'SET_CALENDAR', payload: calendar }),
		setStudent: (student: string) => dispatch({ type: 'SET_STUDENT', payload: student })
	};
}

export function useUI(): UseUIReturn {
	const { state, dispatch } = useApp();
	return {
		...state.ui,
		setTheme: (theme: 'light' | 'dark') => dispatch({ type: 'SET_THEME', payload: theme }),
		toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
		setView: (view: 'calendar' | 'list' | 'agenda') => dispatch({ type: 'SET_VIEW', payload: view })
	};
}
