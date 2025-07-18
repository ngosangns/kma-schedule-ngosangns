// Grade Management Types

export interface GradeRecord {
	id: string;
	tenMon: string; // Tên môn học
	ky: number; // Kỳ học (1, 2, 3, ...)
	tin: number; // Số tín chỉ
	tp1: number | null; // Thành phần 1 - Điểm giữa kỳ
	tp2: number | null; // Thành phần 2 - Điểm chuyên cần
	thi: number | null; // Điểm thi cuối kỳ
	dqt: number | null; // Điểm quá trình (calculated)
	kthp: number | null; // Kết thúc học phần (calculated)
	kthpHe4: number | null; // KTHP hệ 4 (calculated)
	diemChu: string | null; // Điểm chữ (calculated)
	excludeFromGPA?: boolean; // Loại trừ khỏi tính GPA (Giáo dục thể chất, Giáo dục quốc phòng)
	isValid?: boolean; // Validation status
	errors?: string[]; // Validation errors
}

export interface RawGradeData {
	'Tên môn': string;
	Kỳ: string | number;
	Tín: string | number;
	TP1: string | number | null;
	TP2: string | number | null;
	Thi: string | number | null;
	ĐQT?: string | number | null;
	KTHP?: string | number | null;
	'KTHP hệ 4'?: string | number | null;
	'Điểm chữ'?: string | null;
}

export interface SemesterData {
	semester: number;
	grades: GradeRecord[];
	totalCredits: number;
	gpa10: number | null;
	gpa4: number | null;
	passedCredits: number;
	failedSubjects: number;
	excellentSubjects: number;
}

export interface GradeStatistics {
	totalCredits: number;
	totalPassedCredits: number;
	totalFailedCredits: number;
	overallGPA10: number | null;
	overallGPA4: number | null;
	totalSubjects: number;
	passedSubjects: number;
	failedSubjects: number;
	excellentSubjects: number; // A+, A
	goodSubjects: number; // B+, B
	averageSubjects: number; // C+, C
	weakSubjects: number; // D+, D
	gradeDistribution: {
		[key: string]: number; // Grade letter -> count
	};
	semesterStats: SemesterData[];
}

export interface GradeConversionRule {
	minScore: number;
	maxScore: number;
	grade4: number;
	gradeLetter: string;
}

export interface ImportResult {
	success: boolean;
	data: GradeRecord[];
	errors: string[];
	warnings: string[];
	totalRecords: number;
	validRecords: number;
	invalidRecords: number;
}

export interface ExportOptions {
	format: 'csv' | 'json';
	includeCalculated: boolean;
	includeSemesterStats: boolean;
	includeOverallStats: boolean;
}

export interface GradeValidationError {
	recordId: string;
	field: string;
	message: string;
	severity: 'error' | 'warning';
}

export interface GradeSortConfig {
	field: keyof GradeRecord;
	direction: 'asc' | 'desc';
}

export interface GradeFilterConfig {
	semester?: number;
	minGPA?: number;
	maxGPA?: number;
	onlyFailed?: boolean;
	onlyExcellent?: boolean;
	excludeFromGPA?: boolean;
	searchTerm?: string;
}

// Grade calculation constants
export const GRADE_CONVERSION_TABLE: GradeConversionRule[] = [
	{ minScore: 8.5, maxScore: 10, grade4: 4.0, gradeLetter: 'Xuất sắc' },
	{ minScore: 7.0, maxScore: 8.4, grade4: 3.0, gradeLetter: 'Giỏi' },
	{ minScore: 5.5, maxScore: 6.9, grade4: 2.0, gradeLetter: 'Khá' },
	{ minScore: 4.0, maxScore: 5.4, grade4: 1.0, gradeLetter: 'Trung bình' },
	{ minScore: 0, maxScore: 3.9, grade4: 0.0, gradeLetter: 'Yếu/Kém' }
];

export const CALCULATION_WEIGHTS = {
	DQT_TP2_WEIGHT: 0.3,
	DQT_TP1_WEIGHT: 0.7,
	KTHP_DQT_WEIGHT: 0.3,
	KTHP_THI_WEIGHT: 0.7
} as const;

export const EXCLUDED_SUBJECTS = [
	'Giáo dục thể chất',
	'Giáo dục quốc phòng',
	'Giáo dục an ninh',
	'Thể dục',
	'Quân sự'
];

// UI State types
export interface GradesUIState {
	currentView: 'import' | 'table' | 'statistics' | 'export';
	selectedSemester: number | null;
	sortConfig: GradeSortConfig | null;
	filterConfig: GradeFilterConfig;
	isLoading: boolean;
	error: string | null;
}
