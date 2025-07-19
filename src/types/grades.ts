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
	excellentSubjects: number; // >= 8.5
	goodSubjects: number; // 7.0 - 8.4
	averageSubjects: number; // 5.5 - 6.9
	weakSubjects: number; // 4.0 - 5.4
	semesterStats: SemesterData[];
}

export interface GradeConversionRule {
	minScore: number;
	maxScore: number;
	grade4: number;
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
	{ minScore: 9.0, maxScore: 10, grade4: 4.0 },
	{ minScore: 8.5, maxScore: 8.9, grade4: 3.8 },
	{ minScore: 7.8, maxScore: 8.4, grade4: 3.5 },
	{ minScore: 7.0, maxScore: 7.7, grade4: 3.0 },
	{ minScore: 6.3, maxScore: 6.9, grade4: 2.5 },
	{ minScore: 5.5, maxScore: 6.2, grade4: 2.0 },
	{ minScore: 4.8, maxScore: 5.4, grade4: 1.5 },
	{ minScore: 4.0, maxScore: 4.7, grade4: 1.0 },
	{ minScore: 0, maxScore: 3.9, grade4: 0.0 }
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

// Form validation schema for grade input
import { z } from 'zod';

export const gradeFormSchema = z.object({
	tenMon: z.string().min(1, 'Tên môn không được để trống'),
	ky: z.number().min(1, 'Kỳ học phải lớn hơn 0').max(20, 'Kỳ học không được vượt quá 20'),
	tin: z.number().min(0, 'Số tín chỉ không được âm').max(10, 'Số tín chỉ không được vượt quá 10'),
	tp1: z.number().min(0, 'TP1 phải từ 0-10').max(10, 'TP1 phải từ 0-10').nullable(),
	tp2: z.number().min(0, 'TP2 phải từ 0-10').max(10, 'TP2 phải từ 0-10').nullable(),
	thi: z.number().min(0, 'Điểm thi phải từ 0-10').max(10, 'Điểm thi phải từ 0-10').nullable()
});

export type GradeFormData = z.infer<typeof gradeFormSchema>;

// UI State types
export interface GradesUIState {
	currentView: 'import' | 'table' | 'statistics' | 'export';
	selectedSemester: number | null;
	sortConfig: GradeSortConfig | null;
	filterConfig: GradeFilterConfig;
	isLoading: boolean;
	error: string | null;
}
