// Course Planning Types - Ported and adapted from tin-chi-master

export enum Field {
	Class = 'class',
	Teacher = 'teacher',
	DayOfWeek = 'dayOfWeek',
	DayOfWeekStandard = 'dayOfWeekStandard',
	Session = 'session',
	StartSession = 'startSession',
	EndSession = 'endSession',
	StartDate = 'startDate',
	EndDate = 'endDate',
}

export type SheetData = Record<
	string,
	{
		startRow: number;
		endRow: number;
		fieldColumn: {
			[Field.Class]: string;
			[Field.DayOfWeek]: string;
			[Field.Session]: string;
			[Field.StartDate]: string;
			[Field.EndDate]: string;
			[Field.Teacher]: string;
		};
	}
>; // key: sheetName

export type JSONData = Record<
	string,
	{
		fieldData: {
			[Field.Class]: string[];
			[Field.DayOfWeek]: string[];
			[Field.Session]: string[];
			[Field.StartDate]: string[];
			[Field.EndDate]: string[];
			[Field.Teacher]: string[];
		};
	}
>; // key: sheetName

export type CellData = Record<string, unknown>;

type MajorData = Record<string, SubjectData>; // key: subject name
type SubjectData = Record<string, ClassData>; // key: class code

export interface ClassData {
	practiceSchedules?: Record<string, Schedules>; // key: practice class code
	schedules: Schedules;
	[Field.Teacher]: string;
}

export type Schedules = Schedule[];

interface Schedule {
	[Field.StartDate]: number;
	[Field.EndDate]: number;
	[Field.DayOfWeekStandard]: number;
	[Field.StartSession]: number;
	[Field.EndSession]: number;
}

export interface JSONResultData {
	title: string;
	minDate: number;
	maxDate: number;
	majors: Record<string, MajorData>;
}

// Auto mode types for schedule generation
export type AutoMode =
	| 'refer-non-overlap'
	| 'refer-non-overlap-morning'
	| 'refer-non-overlap-afternoon'
	| 'refer-non-overlap-evening';

// Subject selection types
export type MajorSelectedSubjects = Record<string, SubjectSelectedClass>; // key: major

type SubjectSelectedClass = Record<string, SelectedClass>; // key: subject name

export interface SelectedClass {
	show: boolean;
	class: string | null;
}

// Calendar table data for display
export interface CalendarTableItem {
	startSession: number;
	endSession: number;
	subjectName: string;
	classCode: string;
}

export interface CalendarTableData {
	data: CalendarTableItem[][][]; // [day][row][item]
	totalConflictedSessions: number;
}

// Worker message types
export interface ScheduleWorkerMessage {
	calendar: JSONResultData;
	selectedSubjects: [string, string][]; // [majorKey, subjectName]
	auto: AutoMode;
	autoTh: number;
}

export interface ScheduleWorkerResponse {
	data: {
		selectedClasses: [string, string, string][]; // [majorKey, subjectName, classCode]
		totalConflictedSessions: number;
	};
}

// Course planning state
export interface CoursePlanningState {
	calendar: JSONResultData | null;
	selectedClasses: MajorSelectedSubjects;
	autoTh: number;
	oldAuto: AutoMode | null;
	loading: boolean;
	error: string | null;
}

// Session constants
export const SESSION_CONSTANTS = {
	START_MORNING_SESSION: 1,
	END_MORNING_SESSION: 6,
	START_AFTERNOON_SESSION: 7,
	END_AFTERNOON_SESSION: 12,
	START_EVENING_SESSION: 13,
	END_EVENING_SESSION: 16,
	MIN_SESSION: 1,
	MAX_SESSION: 16,
} as const;

// Session shift type
export type SessionShift = 'morning' | 'afternoon' | 'evening';

// File processing types
export interface ExcelProcessingResult {
	success: boolean;
	data?: JSONResultData;
	error?: string;
}

export interface FileUploadState {
	uploading: boolean;
	processing: boolean;
	error: string | null;
}
