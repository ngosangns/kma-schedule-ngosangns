import {
	GradeRecord,
	GradeValidationError,
	GradeFilterConfig,
	GradeSortConfig
} from '@/types/grades';

/**
 * Validate a single grade record
 */
export function validateGradeRecord(record: GradeRecord): GradeValidationError[] {
	const errors: GradeValidationError[] = [];

	// Required fields validation
	if (!record.tenMon || record.tenMon.trim() === '') {
		errors.push({
			recordId: record.id,
			field: 'tenMon',
			message: 'Tên môn học không được để trống',
			severity: 'error'
		});
	}

	if (!record.ky || record.ky < 1 || record.ky > 20) {
		errors.push({
			recordId: record.id,
			field: 'ky',
			message: 'Kỳ học phải từ 1 đến 20',
			severity: 'error'
		});
	}

	if (!record.tin || record.tin < 0 || record.tin > 10) {
		errors.push({
			recordId: record.id,
			field: 'tin',
			message: 'Số tín chỉ phải từ 0 đến 10',
			severity: 'error'
		});
	}

	// Grade component validation
	if (record.tp1 !== null && (record.tp1 < 0 || record.tp1 > 10)) {
		errors.push({
			recordId: record.id,
			field: 'tp1',
			message: 'TP1 phải từ 0 đến 10',
			severity: 'error'
		});
	}

	if (record.tp2 !== null && (record.tp2 < 0 || record.tp2 > 10)) {
		errors.push({
			recordId: record.id,
			field: 'tp2',
			message: 'TP2 phải từ 0 đến 10',
			severity: 'error'
		});
	}

	if (record.thi !== null && (record.thi < 0 || record.thi > 10)) {
		errors.push({
			recordId: record.id,
			field: 'thi',
			message: 'Điểm thi phải từ 0 đến 10',
			severity: 'error'
		});
	}

	if (record.dqt !== null && (record.dqt < 0 || record.dqt > 10)) {
		errors.push({
			recordId: record.id,
			field: 'dqt',
			message: 'ĐQT phải từ 0 đến 10',
			severity: 'error'
		});
	}

	if (record.kthp !== null && (record.kthp < 0 || record.kthp > 10)) {
		errors.push({
			recordId: record.id,
			field: 'kthp',
			message: 'KTHP phải từ 0 đến 10',
			severity: 'error'
		});
	}

	if (record.kthpHe4 !== null && (record.kthpHe4 < 0 || record.kthpHe4 > 4)) {
		errors.push({
			recordId: record.id,
			field: 'kthpHe4',
			message: 'KTHP hệ 4 phải từ 0 đến 4',
			severity: 'error'
		});
	}

	// Warning for missing data
	if (record.tp1 === null && record.tp2 === null && record.thi === null) {
		errors.push({
			recordId: record.id,
			field: 'grades',
			message: 'Thiếu tất cả thành phần điểm',
			severity: 'warning'
		});
	}

	if (record.tp1 === null || record.tp2 === null) {
		errors.push({
			recordId: record.id,
			field: 'processGrades',
			message: 'Thiếu điểm thành phần để tính ĐQT',
			severity: 'warning'
		});
	}

	if (record.thi === null) {
		errors.push({
			recordId: record.id,
			field: 'thi',
			message: 'Thiếu điểm thi cuối kỳ',
			severity: 'warning'
		});
	}

	// Consistency checks
	if (record.dqt !== null && record.tp1 !== null && record.tp2 !== null) {
		const expectedDQT = Number((0.3 * record.tp2 + 0.7 * record.tp1).toFixed(2));
		if (Math.abs(record.dqt - expectedDQT) > 0.01) {
			errors.push({
				recordId: record.id,
				field: 'dqt',
				message: `ĐQT không khớp với công thức (mong đợi: ${expectedDQT})`,
				severity: 'warning'
			});
		}
	}

	if (record.kthp !== null && record.dqt !== null && record.thi !== null) {
		const expectedKTHP = Number((0.3 * record.dqt + 0.7 * record.thi).toFixed(1));
		if (Math.abs(record.kthp - expectedKTHP) > 0.01) {
			errors.push({
				recordId: record.id,
				field: 'kthp',
				message: `KTHP không khớp với công thức (mong đợi: ${expectedKTHP})`,
				severity: 'warning'
			});
		}
	}

	return errors;
}

/**
 * Validate multiple grade records
 */
export function validateGradeRecords(records: GradeRecord[]): GradeValidationError[] {
	const allErrors: GradeValidationError[] = [];

	records.forEach((record) => {
		const recordErrors = validateGradeRecord(record);
		allErrors.push(...recordErrors);
	});

	// Check for duplicate subjects in the same semester
	const subjectSemesterMap = new Map<string, string[]>();
	records.forEach((record) => {
		const key = `${record.tenMon}_${record.ky}`;
		if (!subjectSemesterMap.has(key)) {
			subjectSemesterMap.set(key, []);
		}
		subjectSemesterMap.get(key)!.push(record.id);
	});

	subjectSemesterMap.forEach((recordIds, key) => {
		if (recordIds.length > 1) {
			const [subjectName, semester] = key.split('_');
			recordIds.forEach((recordId) => {
				allErrors.push({
					recordId,
					field: 'duplicate',
					message: `Môn học "${subjectName}" bị trùng lặp trong kỳ ${semester}`,
					severity: 'warning'
				});
			});
		}
	});

	return allErrors;
}

/**
 * Filter grades based on criteria
 */
export function filterGrades(grades: GradeRecord[], filter: GradeFilterConfig): GradeRecord[] {
	return grades.filter((grade) => {
		// Semester filter
		if (filter.semester !== undefined && grade.ky !== filter.semester) {
			return false;
		}

		// GPA range filter
		if (filter.minGPA !== undefined && grade.kthp !== null && grade.kthp < filter.minGPA) {
			return false;
		}

		if (filter.maxGPA !== undefined && grade.kthp !== null && grade.kthp > filter.maxGPA) {
			return false;
		}

		// Failed subjects filter
		if (filter.onlyFailed && (grade.kthp === null || grade.kthp >= 5)) {
			return false;
		}

		// Excellent subjects filter
		if (filter.onlyExcellent && (grade.kthp === null || grade.kthp < 8.5)) {
			return false;
		}

		// Exclude from GPA filter
		if (filter.excludeFromGPA !== undefined && grade.excludeFromGPA !== filter.excludeFromGPA) {
			return false;
		}

		// Search term filter
		if (filter.searchTerm) {
			const searchLower = filter.searchTerm.toLowerCase();
			const subjectNameMatch = grade.tenMon.toLowerCase().includes(searchLower);
			const gradeLetterMatch = grade.diemChu?.toLowerCase().includes(searchLower);

			if (!subjectNameMatch && !gradeLetterMatch) {
				return false;
			}
		}

		return true;
	});
}

/**
 * Sort grades based on configuration
 */
export function sortGrades(grades: GradeRecord[], sortConfig: GradeSortConfig): GradeRecord[] {
	return [...grades].sort((a, b) => {
		const aValue = a[sortConfig.field];
		const bValue = b[sortConfig.field];

		// Handle null values
		if (aValue === null && bValue === null) return 0;
		if (aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
		if (bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

		// Compare values
		let comparison = 0;
		if (typeof aValue === 'string' && typeof bValue === 'string') {
			comparison = aValue.localeCompare(bValue, 'vi', { numeric: true });
		} else if (typeof aValue === 'number' && typeof bValue === 'number') {
			comparison = aValue - bValue;
		} else {
			comparison = String(aValue).localeCompare(String(bValue), 'vi', { numeric: true });
		}

		return sortConfig.direction === 'asc' ? comparison : -comparison;
	});
}

/**
 * Get validation summary
 */
export function getValidationSummary(errors: GradeValidationError[]): {
	totalErrors: number;
	totalWarnings: number;
	errorsByField: Record<string, number>;
	warningsByField: Record<string, number>;
} {
	const errorsByField: Record<string, number> = {};
	const warningsByField: Record<string, number> = {};
	let totalErrors = 0;
	let totalWarnings = 0;

	errors.forEach((error) => {
		if (error.severity === 'error') {
			totalErrors++;
			errorsByField[error.field] = (errorsByField[error.field] || 0) + 1;
		} else {
			totalWarnings++;
			warningsByField[error.field] = (warningsByField[error.field] || 0) + 1;
		}
	});

	return {
		totalErrors,
		totalWarnings,
		errorsByField,
		warningsByField
	};
}

/**
 * Check if grades data is complete enough for GPA calculation
 */
export function isDataCompleteForGPA(grades: GradeRecord[]): {
	isComplete: boolean;
	missingDataCount: number;
	totalGradableSubjects: number;
	issues: string[];
} {
	const gradableSubjects = grades.filter((grade) => !grade.excludeFromGPA);
	const missingData = gradableSubjects.filter((grade) => grade.kthp === null || grade.tin === 0);

	const issues: string[] = [];

	if (missingData.length > 0) {
		issues.push(`${missingData.length} môn học thiếu điểm KTHP hoặc tín chỉ`);
	}

	const duplicates = new Set();
	const duplicateSubjects = gradableSubjects.filter((grade) => {
		const key = `${grade.tenMon}_${grade.ky}`;
		if (duplicates.has(key)) {
			return true;
		}
		duplicates.add(key);
		return false;
	});

	if (duplicateSubjects.length > 0) {
		issues.push(`${duplicateSubjects.length} môn học bị trùng lặp`);
	}

	return {
		isComplete: missingData.length === 0 && duplicateSubjects.length === 0,
		missingDataCount: missingData.length,
		totalGradableSubjects: gradableSubjects.length,
		issues
	};
}
