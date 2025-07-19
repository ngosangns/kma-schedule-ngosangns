# KMA Schedule - API Documentation

## Overview

This document describes the API integration, data models, and communication protocols used by the KMA Schedule application to interact with the KMA (Academy of Military Science and Technology) server.

## API Architecture

### Internal API Routes

The application uses Next.js API routes to communicate with the KMA server, eliminating the need for external CORS proxy:

```
Internal API Routes: /api/kma/*
Target Server: http://qldt.actvn.edu.vn (KMA Official Schedule System)
```

### Request Flow

```
Client App → Next.js API Routes → KMA Server → Next.js API Routes → Client App
```

## Authentication API

### 1. Get Login Page

Retrieves the login page with necessary form tokens.

**Endpoint:**

```
GET /api/kma/login
```

**Request:**

```http
GET /api/kma/login
```

**Response:**

```html
<!-- HTML page containing login form with ViewState tokens -->
<form>
	<input name="__VIEWSTATE" value="..." />
	<input name="__EVENTVALIDATION" value="..." />
	<input name="txtUserName" />
	<input name="txtPassword" />
	<input name="btnSubmit" value="Đăng nhập" />
</form>
```

**Response Processing:**

```typescript
// Extract required form fields
const viewState = getFieldFromResult(html, '__VIEWSTATE');
const eventValidation = getFieldFromResult(html, '__EVENTVALIDATION');
```

### 2. User Authentication

Authenticates user credentials and returns session token.

**Endpoint:**

```
POST /api/kma/login
```

**Request:**

```http
POST /api/kma/login
Content-Type: application/x-www-form-urlencoded

__VIEWSTATE={viewstate}&__EVENTVALIDATION={validation}&txtUserName={username}&txtPassword={md5_password}&btnSubmit=Đăng nhập
```

**Request Parameters:**

- `__VIEWSTATE`: ASP.NET ViewState token from login page
- `__EVENTVALIDATION`: ASP.NET EventValidation token from login page
- `txtUserName`: Student username (uppercase)
- `txtPassword`: MD5 hashed password
- `btnSubmit`: Submit button value ("Đăng nhập")

**Response:**

```
SignIn=ASP.NET_SessionId=...
```

**Error Responses:**

- Empty response: Authentication failed
- Invalid credentials: No SignIn token returned

## Schedule Data API

### 1. Get Current Semester Schedule

Retrieves schedule data for the current semester.

**Endpoint:**

```
GET /api/kma/subject
```

**Request:**

```http
GET /api/kma/subject
Authorization: Bearer SignIn=...
```

**Headers:**

- `Authorization`: Bearer token containing the SignIn cookie from authentication

**Response:**

```html
<!-- HTML page containing schedule table and form data -->
<table class="gridRegistered">
	<!-- Schedule data rows -->
</table>
<form>
	<select name="drpSemester">
		<option value="1_2025_2026">Kỳ 1 - 2025 - 2026</option>
	</select>
</form>
```

### 2. Get Specific Semester Schedule

Retrieves schedule data for a specific semester.

**Endpoint:**

```
POST /api/kma/subject
```

**Request:**

```http
POST /api/kma/subject
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer SignIn=...

__VIEWSTATE={viewstate}&__EVENTVALIDATION={validation}&drpSemester={semester_id}&...
```

**Request Body:**
Form data containing all form fields from the main form, with updated semester selection.

**Response:**
Same HTML structure as GET request, but with data for the requested semester.

## Data Models

### 1. Authentication Models

#### LoginCredentials

```typescript
interface LoginCredentials {
	username: string; // Student username
	password: string; // Plain text password (will be MD5 hashed)
}
```

#### AuthState

```typescript
interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}
```

#### User

```typescript
interface User {
	id: string; // Username
	name: string; // Student name
	email?: string; // Optional email
}
```

### 2. Form Data Models

#### MainFormData

```typescript
interface MainFormData {
	__VIEWSTATE: string; // ASP.NET ViewState
	__EVENTVALIDATION: string; // ASP.NET EventValidation
	drpSemester: string; // Selected semester ID
	[key: string]: string; // Additional form fields
}
```

#### SemesterData

```typescript
interface SemesterData {
	semesters: SemesterOption[];
	currentSemester: string;
}

interface SemesterOption {
	value: string; // Semester ID (e.g., "1_2025_2026")
	from: string; // Start date
	to: string; // End date
	th: string; // Display name
}
```

### 3. Calendar Data Models

#### ProcessedCalendarData

```typescript
interface ProcessedCalendarData {
	data_subject: SubjectData[];
	weeks: WeekData[];
}
```

#### SubjectData

```typescript
interface SubjectData {
	lop_hoc_phan: string; // Class code
	hoc_phan: string; // Subject name
	giang_vien: string; // Instructor name
	si_so: string; // Class capacity
	so_dk: string; // Registered students
	so_tc: string; // Credit hours
	tkb: TimeSlot[]; // Schedule time slots
}
```

#### TimeSlot

```typescript
interface TimeSlot {
	startTime: Date; // Class start time
	endTime: Date; // Class end time
	dayOfWeek: DayOfWeekData[]; // Days of week
	address: string | null; // Classroom location
}

interface DayOfWeekData {
	dow: number; // Day of week (1=Monday, 8=Sunday)
	shi: string[]; // Class periods (shifts)
}
```

#### WeekData

```typescript
interface WeekData {
	[index: number]: DayData;
}

interface DayData {
	time: number; // Timestamp
	shift: ShiftData[]; // Class periods for the day
}

interface ShiftData {
	content: string | null; // Class content/name
	name: string | null; // Subject name
	address: string | null; // Classroom location
	length: number; // Duration in periods
}
```

### 4. Storage Models

#### StorageData

```typescript
interface StorageData {
	signInToken?: string | null;
	mainForm?: MainFormData | null;
	semesters?: SemesterData | null;
	calendar?: ProcessedCalendarData | null;
	student?: string | null;
	user?: User | null;
}
```

## API Response Processing

### 1. HTML Parsing Pipeline

```typescript
// 1. Clean HTML response
function filterTrashInHtml(rawHtml: string): string {
	// Remove unnecessary whitespace and comments
	// Extract relevant content
}

// 2. Extract table data
function cleanFromHTMLtoArray(raw_tkb: string): string[][] | false {
	// Parse HTML table into 2D array
	// Extract schedule grid data
}

// 3. Process calendar data
async function processCalendar(rawHtml: string): Promise<ProcessedCalendarData> {
	// Use Web Worker for heavy processing
	// Transform raw data into structured format
}
```

### 2. Data Extraction Functions

```typescript
// Extract form field values
function getFieldFromResult(html: string, fieldName: string): string | null;

// Extract student information
function processStudent(html: string): string;

// Extract main form data
function processMainForm(html: string): MainFormData;

// Extract semester options
function processSemesters(html: string): SemesterData | null;
```

### 3. Time Processing

```typescript
// Convert Vietnamese time format to Date objects
const timeRegex =
	/([0-9]{2}\/[0-9]{2}\/[0-9]{4}).+?([0-9]{2}\/[0-9]{2}\/[0-9]{4}):(\([0-9]*\))?(.+?)((Từ)|$)+?/;

// Parse class periods (shifts)
const shiftMapping = {
	1: { start: '07:00', end: '07:50' },
	2: { start: '08:00', end: '08:50' },
	3: { start: '09:00', end: '09:50' }
	// ... more shifts
};
```

## Error Handling

### 1. Network Errors

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Common error scenarios
- Network timeout
- API route errors (/api/kma/*)
- KMA server maintenance (http://qldt.actvn.edu.vn)
- Invalid credentials
- Session expired
- Authentication token missing or invalid
```

### 2. Data Validation

```typescript
// Validate API responses
function validateCalendarData(data: any): ProcessedCalendarData | null {
	// Check required fields
	// Validate data types
	// Handle malformed responses
}
```

### 3. Retry Logic

```typescript
// Implement retry for transient failures
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
	// Exponential backoff
	// Handle specific error types
}
```

## Rate Limiting & Best Practices

### 1. Request Throttling

- Avoid rapid successive requests
- Implement request queuing for multiple operations
- Cache responses when appropriate

### 2. Session Management

- Monitor token expiration
- Implement automatic re-authentication
- Handle concurrent requests properly

### 3. Data Caching

- Cache semester data locally
- Implement cache invalidation strategies
- Minimize unnecessary API calls

## Security Considerations

### 1. Credential Handling

- Never store plain text passwords
- Use MD5 hashing as required by KMA server
- Secure token storage in localStorage

### 2. Request Security

- Validate all input data
- Sanitize HTML responses
- Implement CSRF protection

### 3. Privacy Protection

- No sensitive data in logs
- Secure data transmission
- Proper session cleanup on logout

## Integration Examples

### 1. Login Flow

```typescript
// Complete authentication process
async function authenticateUser(username: string, password: string) {
	// 1. Get login page
	const loginPage = await fetch('/api/kma/login');
	const html = await loginPage.text();

	// 2. Extract tokens
	const viewState = getFieldFromResult(html, '__VIEWSTATE');
	const eventValidation = getFieldFromResult(html, '__EVENTVALIDATION');

	// 3. Submit credentials
	const authResponse = await fetch('/api/kma/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			__VIEWSTATE: viewState,
			__EVENTVALIDATION: eventValidation,
			txtUserName: username.toUpperCase(),
			txtPassword: md5(password),
			btnSubmit: 'Đăng nhập'
		}).toString()
	});

	// 4. Extract token from response text
	const token = await authResponse.text();
	return token;
}
```

### 2. Data Fetching

```typescript
// Fetch and process schedule data
async function fetchScheduleData(token: string, semester?: string) {
	const endpoint = '/api/kma/subject';
	const method = semester ? 'POST' : 'GET';

	const response = await fetch(endpoint, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			...(semester && { 'Content-Type': 'application/x-www-form-urlencoded' })
		},
		body: semester ? createFormData(semester) : undefined
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch schedule: ${response.status}`);
	}

	const html = await response.text();
	const cleanHtml = filterTrashInHtml(html);
	const calendar = await processCalendar(cleanHtml);

	return calendar;
}
```

## Internal API Implementation

The application uses Next.js API routes to handle requests to the KMA server, eliminating the need for external CORS proxy.

### Current Architecture

- **Internal API routes**: `/api/kma/login` and `/api/kma/subject`
- **Server-side requests**: All KMA server communication happens server-side
- **Standard authentication**: Session tokens passed via Authorization header
- **No external dependencies**: Everything runs within the Next.js application

### API Features

1. **CORS Handling**: Manages cross-origin requests between client and KMA server
2. **Header Forwarding**: Forwards authentication cookies and other headers
3. **Request Proxying**: Supports both GET and POST requests
4. **Response Handling**: Returns raw HTML responses from KMA server

### Limitations

- **External Dependency**: Relies on external Cloudflare Workers service
- **Single Point of Failure**: If proxy is down, application cannot function
- **Maintenance**: Proxy code is maintained separately from main application

### Future Considerations

For improved reliability and reduced dependencies, consider implementing Next.js API routes to replace the external CORS proxy:

- Direct server-side communication with KMA server
- Elimination of external dependencies
- Better error handling and logging
- Improved security through server-side request handling

This API documentation provides a complete reference for integrating with the KMA Schedule system and understanding the current data flow within the application.
