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
  mainForm: any;
  semesters: Semester[];
}

// Storage Types
export interface StorageData {
  signInToken?: string;
  mainForm?: any;
  semesters?: Semester[];
  calendar?: CalendarData;
  student?: string;
  user?: User;
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

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  disabled?: boolean;
}

// Component Props Types
export interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface LayoutProps {
  children: React.ReactNode;
}
