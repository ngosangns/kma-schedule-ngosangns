// Grade Management Library - Main Export File

// Calculations
export {
	calculateDQT,
	calculateKTHP,
	convertToGrade4,
	isSubjectFailed,
	shouldExcludeFromGPA,
	processGradeRecord,
	calculateGPA10,
	calculateGPA4,
	calculateSemesterStats,
	calculateOverallStats
} from './calculations';

// Import/Export
export { parseCSV, parseJSON, exportToCSV, exportToJSON, downloadFile } from './import-export';

// Validation
export { validateGradeRecord, validateGradeRecords, filterGrades, sortGrades } from './validation';

// Study Planning
export {
	calculateStudyPlan,
	calculateMultipleScenarios,
	getRemainingSubjects
} from './study-planning';
export type { StudyPlanInput, StudyPlanResult } from './study-planning';

// Re-export types for convenience
export type {
	GradeRecord,
	RawGradeData,
	SemesterData,
	GradeStatistics,
	ImportResult,
	ExportOptions,
	GradeValidationError,
	GradeSortConfig,
	GradeFilterConfig,
	GradesUIState
} from '@/types/grades';

export { GRADE_CONVERSION_TABLE, CALCULATION_WEIGHTS, EXCLUDED_SUBJECTS } from '@/types/grades';
