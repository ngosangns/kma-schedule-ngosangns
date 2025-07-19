import {
	User,
	Subject,
	CalendarData,
	ProcessedCalendarData,
	SubjectData,
	AuthState,
	UIState,
	StorageData
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
	{
		id: 'user-1',
		username: 'student001',
		name: 'Nguyễn Văn A',
		email: 'student001@kma.edu.vn'
	},
	{
		id: 'user-2',
		username: 'student002',
		name: 'Trần Thị B',
		email: 'student002@kma.edu.vn'
	}
];

export const mockUser: User = mockUsers[0]!;

// Mock Subjects
export const mockSubjects: Subject[] = [
	{
		id: 'subject-1',
		name: 'Lập trình Web',
		code: 'IT4409',
		credits: 3,
		instructor: 'TS. Nguyễn Văn X',
		room: 'TC-201',
		schedule: [
			{
				day: 2, // Thứ 2
				shift: 1, // Ca 1 (7:00-9:30)
				weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
			},
			{
				day: 4, // Thứ 4
				shift: 2, // Ca 2 (9:30-12:00)
				weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
			}
		]
	},
	{
		id: 'subject-2',
		name: 'Cơ sở dữ liệu',
		code: 'IT3090',
		credits: 3,
		instructor: 'PGS.TS. Lê Thị Y',
		room: 'TC-105',
		schedule: [
			{
				day: 3, // Thứ 3
				shift: 3, // Ca 3 (13:30-16:00)
				weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
			}
		]
	},
	{
		id: 'subject-3',
		name: 'Mạng máy tính',
		code: 'IT4062',
		credits: 2,
		instructor: 'ThS. Phạm Văn Z',
		room: 'TC-301',
		schedule: [
			{
				day: 5, // Thứ 5
				shift: 1, // Ca 1 (7:00-9:30)
				weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
			}
		]
	}
];

// Mock Calendar Data
export const mockCalendarData: CalendarData = {
	data_subject: mockSubjects,
	weeks: [],
	currentWeek: 1
};

// Mock Subject Data for ProcessedCalendarData
export const mockSubjectData: SubjectData[] = [
	{
		lop_hoc_phan: 'IT4409_01',
		hoc_phan: 'Lập trình Web',
		giang_vien: 'TS. Nguyễn Văn X',
		si_so: '40',
		so_dk: '35',
		so_tc: '3',
		tkb: [
			{
				startTime: new Date('2023-09-04T07:00:00'),
				endTime: new Date('2023-09-04T09:30:00'),
				dayOfWeek: [{ dow: 2, shi: ['1', '2'] }],
				address: 'TC-201'
			}
		]
	},
	{
		lop_hoc_phan: 'IT3090_01',
		hoc_phan: 'Cơ sở dữ liệu',
		giang_vien: 'PGS.TS. Lê Thị Y',
		si_so: '45',
		so_dk: '42',
		so_tc: '3',
		tkb: [
			{
				startTime: new Date('2023-09-05T13:30:00'),
				endTime: new Date('2023-09-05T16:00:00'),
				dayOfWeek: [{ dow: 3, shi: ['3', '4'] }],
				address: 'TC-105'
			}
		]
	}
];

// Mock Processed Calendar Data
export const mockProcessedCalendarData: ProcessedCalendarData = {
	data_subject: mockSubjectData,
	weeks: [
		{
			1: {
				time: new Date('2023-09-04').getTime(),
				shift: [
					{
						content: 'Lập trình Web',
						name: 'IT4409_01',
						address: 'TC-201',
						length: 2
					}
				]
			},
			2: {
				time: new Date('2023-09-05').getTime(),
				shift: [
					{
						content: 'Cơ sở dữ liệu',
						name: 'IT3090_01',
						address: 'TC-105',
						length: 2
					}
				]
			}
		}
	]
};

// Mock Auth States
export const mockAuthStates = {
	unauthenticated: {
		user: null,
		isAuthenticated: false,
		isLoading: false,
		error: null
	} as AuthState,

	authenticated: {
		user: mockUser,
		isAuthenticated: true,
		isLoading: false,
		error: null
	} as AuthState,

	loading: {
		user: null,
		isAuthenticated: false,
		isLoading: true,
		error: null
	} as AuthState,

	error: {
		user: null,
		isAuthenticated: false,
		isLoading: false,
		error: 'Đăng nhập thất bại'
	} as AuthState
};

// Mock UI States
export const mockUIStates = {
	default: {
		theme: 'dark',
		sidebarOpen: false,
		currentView: 'calendar'
	} as UIState,

	light: {
		theme: 'light',
		sidebarOpen: false,
		currentView: 'calendar'
	} as UIState,

	sidebarOpen: {
		theme: 'dark',
		sidebarOpen: true,
		currentView: 'calendar'
	} as UIState,

	listView: {
		theme: 'dark',
		sidebarOpen: false,
		currentView: 'list'
	} as UIState
};

// Mock API Responses
export const mockAPIResponses = {
	loginSuccess: {
		success: true,
		data: {
			user: mockUser,
			token: 'mock-jwt-token'
		}
	},

	loginFailure: {
		success: false,
		error: 'Tên đăng nhập hoặc mật khẩu không đúng'
	},

	calendarSuccess: {
		success: true,
		data: mockCalendarData
	},

	calendarFailure: {
		success: false,
		error: 'Không thể tải dữ liệu lịch học'
	},

	semestersSuccess: {
		success: true,
		data: {
			semesters: [
				{
					value: '20231',
					from: '2023-09-04',
					to: '2024-01-15',
					th: 'Học kỳ 1 năm 2023-2024'
				},
				{
					value: '20232',
					from: '2024-01-22',
					to: '2024-05-31',
					th: 'Học kỳ 2 năm 2023-2024'
				}
			],
			currentSemester: '20231'
		}
	}
};

// Mock HTML Responses (for calendar parsing)
export const mockHTMLResponses = {
	loginPage: `
    <html>
      <body>
        <form>
          <input name="__VIEWSTATE" value="mock-viewstate" />
          <input name="__EVENTVALIDATION" value="mock-eventvalidation" />
          <input name="txtUserName" />
          <input name="txtPassword" />
          <input name="btnSubmit" value="Đăng nhập" />
        </form>
      </body>
    </html>
  `,

	calendarPage: `
    <html>
      <body>
        <table class="calendar-table">
          <tr>
            <td>Lập trình Web</td>
            <td>IT4409</td>
            <td>TS. Nguyễn Văn X</td>
            <td>TC-201</td>
            <td>Thứ 2, Ca 1</td>
          </tr>
        </table>
      </body>
    </html>
  `
};

// Mock Storage Data
export const mockStorageData: StorageData = {
	signInToken: 'SignIn=mock-signin-token; Path=/; HttpOnly',
	mainForm: {
		__VIEWSTATE: 'mock-viewstate',
		__EVENTVALIDATION: 'mock-eventvalidation',
		drpSemester: '20231'
	},
	semesters: {
		semesters: [
			{
				value: '20231',
				from: '2023-09-04',
				to: '2024-01-15',
				th: 'Học kỳ 1 năm 2023-2024'
			}
		],
		currentSemester: '20231'
	},
	calendar: mockProcessedCalendarData,
	student: 'Nguyễn Văn A - CT050101',
	user: mockUser
};

// Mock Form Data
export const mockFormData = {
	login: {
		username: 'student001',
		password: 'password123'
	},

	calendar: {
		semester: '20231',
		student: 'CT050101'
	}
};

// Mock Error Messages
export const mockErrorMessages = {
	networkError: 'Lỗi kết nối mạng',
	authError: 'Phiên đăng nhập đã hết hạn',
	validationError: 'Dữ liệu không hợp lệ',
	serverError: 'Lỗi máy chủ',
	notFoundError: 'Không tìm thấy dữ liệu'
};
