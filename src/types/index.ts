// User and Authentication Types
export interface User {
	id: string;
	name: string;
	email?: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

// Calendar and Schedule Types
export interface Subject {
	id: string;
	name: string;
	code: string;
	instructor: string;
	room: string;
	shift: number;
	day: number;
	week: number;
	startTime: string;
	endTime: string;
	color?: string;
}

export interface CalendarData {
	data_subject: Subject[];
	weeks: Week[];
	currentWeek: number;
}

export interface Week {
	weekNumber: number;
	startDate: string;
	endDate: string;
	days: Day[];
}

export interface Day {
	date: string;
	dayOfWeek: number;
	subjects: Subject[];
}

export interface Semester {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	isCurrent: boolean;
}

// Calendar Processing Types
export interface ShiftData {
	content: string | null;
	name: string | null;
	address: string | null;
	length: number;
}

export interface DayData {
	time: number;
	shift: ShiftData[];
}

export interface WeekData {
	[index: number]: DayData;
}

export interface ProcessedCalendarData {
	data_subject: SubjectData[];
	weeks: WeekData[];
}

export interface SubjectData {
	lop_hoc_phan: string;
	hoc_phan: string;
	giang_vien: string;
	si_so: string;
	so_dk: string;
	so_tc: string;
	tkb: TimeSlot[];
}

export interface TimeSlot {
	startTime: Date;
	endTime: Date;
	dayOfWeek: DayOfWeekData[];
	address: string | null;
}

export interface DayOfWeekData {
	dow: number;
	shi: string[];
}

// Form and Main Form Types
export interface MainFormData {
	__VIEWSTATE: string;
	__EVENTVALIDATION: string;
	drpSemester: string;
	[key: string]: string;
}

export interface SemesterData {
	semesters: SemesterOption[];
	currentSemester: string;
}

export interface SemesterOption {
	value: string;
	from: string;
	to: string;
	th: string;
}

// API Response Types
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface LoginResponse {
	signInToken: string;
	user: User;
}

export interface CalendarResponse {
	calendar: CalendarData;
	student: string;
	mainForm: MainFormData;
	semesters: SemesterData;
}

// Storage Types
export interface StorageData {
	signInToken?: string | null;
	mainForm?: MainFormData | null;
	semesters?: SemesterData | null;
	calendar?: ProcessedCalendarData | null;
	student?: string | null;
	user?: User | null;
}

// UI State Types
export interface UIState {
	theme: 'light' | 'dark';
	sidebarOpen: boolean;
	currentView: 'calendar' | 'list' | 'agenda';
}

// Form Types
export interface FormState {
	isSubmitting: boolean;
	errors: Record<string, string>;
	touched: Record<string, boolean>;
}

// Error Types
export interface AppError {
	code: string;
	message: string;
	details?: any;
}

// Notification Types
export interface NotificationSettings {
	enabled: boolean;
	permissions: {
		granted: boolean;
		requested: boolean;
	};
	timing: {
		oneDayBefore: boolean;
		oneHourBefore: boolean;
		atClassTime: boolean;
	};
}

export interface ScheduledNotification {
	id: string;
	subjectId: string;
	subjectName: string;
	subjectCode: string;
	instructor: string;
	room: string;
	classTime: Date;
	notificationTime: Date;
	type: 'one-day' | 'one-hour' | 'at-time';
	scheduled: boolean;
	timeoutId?: number;
}

export interface NotificationData {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	tag?: string;
	data?: any;
}

// Navigation Types
export interface NavItem {
	title: string;
	href: string;
	icon?: React.ComponentType;
	disabled?: boolean;
}

// Hook Return Types
export interface UseCalendarDataReturn {
	isProcessing: boolean;
	loginWithCredentials: (
		username: string,
		password: string,
		setGlobalLoading?: boolean
	) => Promise<{
		success: boolean;
		data?: {
			calendar: ProcessedCalendarData;
			student: string;
			mainForm: MainFormData;
			semesters: SemesterData | null;
		};
		error?: string;
	}>;
	processManualData: (userResponse: string) => Promise<{
		success: boolean;
		data?: {
			calendar: ProcessedCalendarData;
			student: string;
			mainForm: MainFormData;
			semesters: SemesterData | null;
		};
		error?: string;
	}>;
	changeSemester: (
		newSemester: string,
		currentData: { semesters: SemesterData; mainForm: MainFormData; signInToken: string }
	) => Promise<{
		success: boolean;
		data?: {
			mainForm: MainFormData;
			semesters: SemesterData;
			calendar: ProcessedCalendarData;
			student: string;
			signInToken: string;
		} | null;
		error?: string;
	}>;
	exportCalendar: (
		student: string,
		calendar: ProcessedCalendarData
	) => {
		success: boolean;
		error?: string;
	};
	logout: () => void;
}

export interface UseNotificationsReturn {
	showSuccess: (title: string, description?: string) => void;
	showError: (title: string, description?: string) => void;
	showWarning: (title: string, description?: string) => void;
	showInfo: (title: string, description?: string) => void;
}

export interface UseAuthReturn {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	login: (user: User, token?: string | undefined) => void;
	logout: () => void;
	setLoading: () => void;
	setError: (error: string) => void;
}

export interface UseCalendarReturn {
	calendar: ProcessedCalendarData | null;
	student: string | null;
	setCalendar: (calendar: ProcessedCalendarData) => void;
	setStudent: (student: string) => void;
}

export interface UseUIReturn {
	theme: 'light' | 'dark';
	sidebarOpen: boolean;
	currentView: 'calendar' | 'list' | 'agenda';
	setTheme: (theme: 'light' | 'dark') => void;
	toggleSidebar: () => void;
	setView: (view: 'calendar' | 'list' | 'agenda') => void;
}

// Component Props Types
export interface PageProps {
	params: { [key: string]: string };
	searchParams: { [key: string]: string | string[] | undefined };
}

export interface LayoutProps {
	children: React.ReactNode;
}

// Worker Types
export interface WorkerFunction {
	(data: any): void;
}

// Utility Function Types
export interface TimeShiftTable {
	[key: number]: {
		start: string;
		end: string;
	};
}

// Calendar Export Types
export interface CalendarExportData {
	student: string | null;
	calendar: ProcessedCalendarData;
}
