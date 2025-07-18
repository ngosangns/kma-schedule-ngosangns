# KMA Schedule - Technical Documentation

## Overview

KMA Schedule is a Next.js-based web application that converts raw HTML from the official KMA (Academy of Military Science and Technology) website into readable schedule timetables for students. The application provides a modern, responsive interface for viewing class schedules with features like semester switching, calendar views, and notification management.

## Architecture

### Technology Stack

- **Frontend Framework**: Next.js 14.0.4 with React 18.2.0
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.6 with custom design system
- **UI Components**: Radix UI primitives with custom components
- **State Management**: React Context API with useReducer
- **Data Processing**: Web Workers for heavy calendar processing
- **Testing**: Jest with React Testing Library
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: Yarn

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                       │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
│  ├── Pages (Next.js App Router)                           │
│  ├── Layout Components                                     │
│  └── UI Components (Radix UI + Custom)                    │
├─────────────────────────────────────────────────────────────┤
│  State Management (React Context)                          │
│  ├── AppContext (Auth, Calendar, UI State)                │
│  ├── Custom Hooks (useCalendarData, useNotifications)     │
│  └── Local Storage Integration                             │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── Calendar Processing (Web Workers)                    │
│  ├── Authentication Logic                                  │
│  ├── Data Transformation                                   │
│  └── Notification Service                                  │
├─────────────────────────────────────────────────────────────┤
│  API Integration Layer                                     │
│  ├── KMA Server Communication                             │
│  ├── CORS Proxy (Cloudflare Workers)                      │
│  └── HTML Parsing & Data Extraction                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                              │
├─────────────────────────────────────────────────────────────┤
│  CORS Proxy (Cloudflare Workers)                          │
│  ├── https://actvn-schedule.cors-ngosangns.workers.dev    │
│  ├── /login - Authentication proxy                        │
│  ├── /subject - Schedule data proxy                       │
│  └── Header forwarding & CORS handling                    │
├─────────────────────────────────────────────────────────────┤
│  KMA Official Server                                       │
│  ├── http://qldt.actvn.edu.vn                            │
│  ├── Authentication Endpoint                              │
│  ├── Schedule Data Endpoint                               │
│  └── HTML Response Processing                             │
└─────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Authentication System

#### Login Flow

```typescript
// Authentication process
1. User submits credentials (username, password)
2. Fetch login page to get __VIEWSTATE and __EVENTVALIDATION
3. Hash password with MD5
4. Submit login form with proper ASP.NET ViewState
5. Receive SignIn token cookie
6. Store token for subsequent requests
```

#### Key Components

- **`src/lib/ts/user.ts`**: Core authentication logic
- **`src/components/auth/LoginForm.tsx`**: Login UI component
- **`src/app/(main)/calendar/page.tsx`**: Main page with integrated authentication
- **`src/contexts/AppContext.tsx`**: Authentication state management

#### Security Features

- MD5 password hashing (as required by KMA server)
- Secure token storage in localStorage
- Automatic token validation
- Session management with logout functionality

### 2. Calendar Processing System

#### Data Flow

```
Raw HTML → HTML Parsing → Data Extraction → Web Worker Processing → Structured Calendar Data
```

#### Processing Pipeline

1. **HTML Fetching**

   ```typescript
   // GET request for initial data
   fetchCalendarWithGet(signInToken: string): Promise<string>

   // POST request for semester changes
   fetchCalendarWithPost(formObj: MainFormData, signInToken: string): Promise<string>
   ```

2. **HTML Cleaning & Parsing**

   ```typescript
   // Remove unnecessary HTML elements and extract table data
   filterTrashInHtml(rawHtml: string): string
   cleanFromHTMLtoArray(raw_tkb: string): string[][] | false
   ```

3. **Data Processing (Web Worker)**

   ```typescript
   // Heavy processing in separate thread
   processCalendar(rawHtml: string): Promise<ProcessedCalendarData>
   restructureTKB(data: string[][] | false): ProcessedCalendarData | false
   ```

4. **Data Structure Transformation**
   - Extract subject information (name, code, instructor, credits)
   - Parse time slots and convert to Date objects
   - Generate weekly calendar structure
   - Map subjects to specific time slots and days

#### Key Data Structures

```typescript
interface ProcessedCalendarData {
	data_subject: SubjectData[];
	weeks: WeekData[];
}

interface SubjectData {
	lop_hoc_phan: string; // Class code
	hoc_phan: string; // Subject name
	giang_vien: string; // Instructor
	si_so: string; // Class size
	so_dk: string; // Registered students
	so_tc: string; // Credits
	tkb: TimeSlot[]; // Time slots
}

interface TimeSlot {
	startTime: Date;
	endTime: Date;
	dayOfWeek: DayOfWeekData[];
	address: string | null;
}
```

### 3. State Management

#### Context Architecture

```typescript
// Combined application state
interface AppState {
	auth: AuthState; // User authentication
	calendar: ProcessedCalendarData; // Calendar data
	ui: UIState; // UI preferences
	student: string; // Student information
}
```

#### State Actions

- **Authentication**: `AUTH_START`, `AUTH_SUCCESS`, `AUTH_ERROR`, `AUTH_LOGOUT`
- **Calendar**: `SET_CALENDAR`, `SET_STUDENT`
- **UI**: `SET_THEME`, `TOGGLE_SIDEBAR`, `SET_VIEW`
- **Storage**: `LOAD_FROM_STORAGE`

#### Custom Hooks

- **`useAuth()`**: Authentication state and actions
- **`useCalendar()`**: Calendar data management
- **`useUI()`**: UI state management
- **`useCalendarData()`**: Complex calendar operations
- **`useNotifications()`**: Toast notifications

### 4. Data Persistence

#### Local Storage Strategy

```typescript
interface StorageData {
	signInToken?: string;
	mainForm?: MainFormData;
	semesters?: SemesterData;
	calendar?: ProcessedCalendarData;
	student?: string;
	user?: User;
}
```

#### Storage Operations

- **`saveData()`**: Persist application state
- **`loadData()`**: Restore application state
- **`clearData()`**: Clear all stored data (logout)

#### Data Synchronization

- Automatic save on state changes
- Restore on application load
- Validation and error handling for corrupted data

### 5. Notification System

#### Features

- Browser push notifications
- Class reminders (1 day, 1 hour, at start time)
- Configurable notification settings
- Persistent notification preferences

#### Implementation

```typescript
class NotificationService {
	// Request notification permissions
	requestPermission(): Promise<boolean>;

	// Show immediate notification
	showNotification(data: NotificationData): void;

	// Schedule future notifications
	scheduleNotifications(subjects: Subject[]): void;

	// Manage notification settings
	updateSettings(settings: Partial<NotificationSettings>): void;
}
```

## API Integration

### CORS Proxy Endpoints

The application uses an external Cloudflare Workers CORS proxy to communicate with the KMA server:

#### 1. Login Endpoint

```
GET https://actvn-schedule.cors-ngosangns.workers.dev/login
```

- Fetches login page with ViewState tokens
- Returns HTML with form fields

#### 2. Authentication Endpoint

```
POST https://actvn-schedule.cors-ngosangns.workers.dev/login
Content-Type: application/x-www-form-urlencoded

__VIEWSTATE={viewstate}&__EVENTVALIDATION={validation}&txtUserName={username}&txtPassword={md5_password}&btnSubmit=Đăng nhập
```

- Authenticates user credentials
- Returns SignIn token cookie

#### 3. Schedule Data Endpoint

```
GET/POST https://actvn-schedule.cors-ngosangns.workers.dev/subject
```

- GET: Fetch current semester schedule
- POST: Fetch specific semester schedule
- Requires SignIn token in `x-cors-headers`

### KMA Server Integration

The CORS proxy forwards requests to the actual KMA server:

```
KMA Server: http://qldt.actvn.edu.vn
Proxy: https://actvn-schedule.cors-ngosangns.workers.dev
```

#### Proxy Features

- Cross-origin request handling
- Header forwarding via `x-cors-headers`
- Cookie and session management
- Error handling and validation
- Request/response transformation

## Performance Optimizations

### 1. Web Workers

- Heavy calendar processing moved to separate thread
- Prevents UI blocking during data transformation
- Improves perceived performance

### 2. Code Splitting

- Next.js automatic code splitting
- Route-based splitting
- Component lazy loading where appropriate

### 3. Caching Strategy

- Local storage for persistent data
- Browser caching for static assets
- Optimized bundle sizes

### 4. Mobile Optimization

- Responsive design with Tailwind CSS
- Touch-friendly interfaces
- Progressive Web App features
- Optimized for mobile performance

## Error Handling

### 1. Network Errors

- Retry mechanisms for failed requests
- Graceful degradation for offline scenarios
- User-friendly error messages

### 2. Data Validation

- Type checking with TypeScript
- Runtime validation for API responses
- Fallback data structures

### 3. Error Boundaries

- React Error Boundaries for component errors
- Global error handling
- Error reporting and logging

## Security Considerations

### 1. Data Protection

- No sensitive data stored in plain text
- Secure token management
- Input validation and sanitization

### 2. Authentication Security

- Token-based authentication
- Automatic session expiration
- Secure logout procedures

### 3. XSS Prevention

- React's built-in XSS protection
- Sanitized HTML rendering
- Content Security Policy headers

## Development Workflow

### 1. Environment Setup

```bash
# Install dependencies
yarn install

# Development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test
```

### 2. Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Jest for testing

### 3. Testing Strategy

- Unit tests for utilities and hooks
- Integration tests with real API
- Component testing with React Testing Library
- Coverage reporting and thresholds
