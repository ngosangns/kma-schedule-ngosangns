import {
	GradeRecord,
	GradeConversionRule,
	SemesterData,
	GradeStatistics,
	GRADE_CONVERSION_TABLE,
	CALCULATION_WEIGHTS,
	EXCLUDED_SUBJECTS
} from '@/types/grades';

/**
 * Calculate ĐQT (Điểm quá trình) = 0.3 * TP2 + 0.7 * TP1
 */
export function calculateDQT(tp1: number | null, tp2: number | null): number | null {
	if (tp1 === null || tp2 === null) return null;
	if (tp1 < 0 || tp1 > 10 || tp2 < 0 || tp2 > 10) return null;

	return Number(
		(CALCULATION_WEIGHTS.DQT_TP2_WEIGHT * tp2 + CALCULATION_WEIGHTS.DQT_TP1_WEIGHT * tp1).toFixed(2)
	);
}

/**
 * Calculate KTHP (Kết thúc học phần) = 0.3 * ĐQT + 0.7 * Thi
 */
export function calculateKTHP(dqt: number | null, thi: number | null): number | null {
	if (dqt === null || thi === null) return null;
	if (dqt < 0 || dqt > 10 || thi < 0 || thi > 10) return null;

	return Number(
		(CALCULATION_WEIGHTS.KTHP_DQT_WEIGHT * dqt + CALCULATION_WEIGHTS.KTHP_THI_WEIGHT * thi).toFixed(2)
	);
}

/**
 * Convert KTHP (10-point scale) to 4-point scale
 */
export function convertToGrade4(kthp: number | null): number | null {
	if (kthp === null || kthp < 0 || kthp > 10) return null;

	const rule = GRADE_CONVERSION_TABLE.find(
		(rule) => kthp >= rule.minScore && kthp <= rule.maxScore
	);

	return rule ? rule.grade4 : null;
}

/**
 * Convert KTHP to letter grade
 */
export function convertToLetterGrade(kthp: number | null): string | null {
	if (kthp === null || kthp < 0 || kthp > 10) return null;

	const rule = GRADE_CONVERSION_TABLE.find(
		(rule) => kthp >= rule.minScore && kthp <= rule.maxScore
	);

	return rule ? rule.gradeLetter : null;
}

/**
 * Check if a subject should be excluded from GPA calculation
 */
export function shouldExcludeFromGPA(subjectName: string): boolean {
	return EXCLUDED_SUBJECTS.some((excluded) =>
		subjectName.toLowerCase().includes(excluded.toLowerCase())
	);
}

/**
 * Process a single grade record with calculations
 */
export function processGradeRecord(record: Partial<GradeRecord>): GradeRecord {
	const id = record.id || `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	// Calculate DQT if not provided or incorrect
	const calculatedDQT = calculateDQT(record.tp1 || null, record.tp2 || null);
	const dqt = record.dqt !== null && record.dqt !== undefined ? record.dqt : calculatedDQT;

	// Calculate KTHP if not provided or incorrect
	const calculatedKTHP = calculateKTHP(dqt, record.thi || null);
	const kthp = record.kthp !== null && record.kthp !== undefined ? record.kthp : calculatedKTHP;

	// Convert to 4-point scale and letter grade
	const kthpHe4 = convertToGrade4(kthp);
	const diemChu = convertToLetterGrade(kthp);

	// Check if should be excluded from GPA
	const excludeFromGPA = record.excludeFromGPA || shouldExcludeFromGPA(record.tenMon || '');

	// Validation
	const errors: string[] = [];
	if (!record.tenMon) errors.push('Tên môn không được để trống');
	if (!record.ky || record.ky < 1) errors.push('Kỳ học không hợp lệ');
	if (!record.tin || record.tin < 0) errors.push('Số tín chỉ không hợp lệ');
	if (record.tp1 !== null && (record.tp1 < 0 || record.tp1 > 10)) errors.push('TP1 phải từ 0-10');
	if (record.tp2 !== null && (record.tp2 < 0 || record.tp2 > 10)) errors.push('TP2 phải từ 0-10');
	if (record.thi !== null && (record.thi < 0 || record.thi > 10)) errors.push('Điểm thi phải từ 0-10');

	return {
		id,
		tenMon: record.tenMon || '',
		ky: record.ky || 1,
		tin: record.tin || 0,
		tp1: record.tp1 || null,
		tp2: record.tp2 || null,
		thi: record.thi || null,
		dqt,
		kthp,
		kthpHe4,
		diemChu,
		excludeFromGPA,
		isValid: errors.length === 0,
		errors: errors.length > 0 ? errors : undefined
	};
}

/**
 * Calculate GPA for a set of grades (10-point scale)
 */
export function calculateGPA10(grades: GradeRecord[]): number | null {
	const validGrades = grades.filter(
		(grade) => grade.kthp !== null && !grade.excludeFromGPA && grade.tin > 0
	);

	if (validGrades.length === 0) return null;

	const totalWeightedScore = validGrades.reduce(
		(sum, grade) => sum + (grade.kthp! * grade.tin),
		0
	);
	const totalCredits = validGrades.reduce((sum, grade) => sum + grade.tin, 0);

	return totalCredits > 0 ? Number((totalWeightedScore / totalCredits).toFixed(2)) : null;
}

/**
 * Calculate GPA for a set of grades (4-point scale)
 */
export function calculateGPA4(grades: GradeRecord[]): number | null {
	const validGrades = grades.filter(
		(grade) => grade.kthpHe4 !== null && !grade.excludeFromGPA && grade.tin > 0
	);

	if (validGrades.length === 0) return null;

	const totalWeightedScore = validGrades.reduce(
		(sum, grade) => sum + (grade.kthpHe4! * grade.tin),
		0
	);
	const totalCredits = validGrades.reduce((sum, grade) => sum + grade.tin, 0);

	return totalCredits > 0 ? Number((totalWeightedScore / totalCredits).toFixed(2)) : null;
}

/**
 * Calculate semester statistics
 */
export function calculateSemesterStats(grades: GradeRecord[], semester: number): SemesterData {
	const semesterGrades = grades.filter((grade) => grade.ky === semester);

	const totalCredits = semesterGrades.reduce((sum, grade) => sum + grade.tin, 0);
	const passedCredits = semesterGrades
		.filter((grade) => grade.kthp !== null && grade.kthp >= 5)
		.reduce((sum, grade) => sum + grade.tin, 0);

	const failedSubjects = semesterGrades.filter(
		(grade) => grade.kthp !== null && grade.kthp < 5
	).length;

	const excellentSubjects = semesterGrades.filter(
		(grade) => grade.kthp !== null && grade.kthp >= 8.5
	).length;

	return {
		semester,
		grades: semesterGrades,
		totalCredits,
		gpa10: calculateGPA10(semesterGrades),
		gpa4: calculateGPA4(semesterGrades),
		passedCredits,
		failedSubjects,
		excellentSubjects
	};
}

/**
 * Calculate overall statistics for all grades
 */
export function calculateOverallStats(grades: GradeRecord[]): GradeStatistics {
	const semesters = [...new Set(grades.map((grade) => grade.ky))].sort((a, b) => a - b);
	const semesterStats = semesters.map((semester) => calculateSemesterStats(grades, semester));

	const totalCredits = grades.reduce((sum, grade) => sum + grade.tin, 0);
	const totalPassedCredits = grades
		.filter((grade) => grade.kthp !== null && grade.kthp >= 5)
		.reduce((sum, grade) => sum + grade.tin, 0);
	const totalFailedCredits = totalCredits - totalPassedCredits;

	const totalSubjects = grades.length;
	const passedSubjects = grades.filter((grade) => grade.kthp !== null && grade.kthp >= 5).length;
	const failedSubjects = grades.filter((grade) => grade.kthp !== null && grade.kthp < 5).length;
	const excellentSubjects = grades.filter((grade) => grade.kthp !== null && grade.kthp >= 8.5).length;
	const goodSubjects = grades.filter(
		(grade) => grade.kthp !== null && grade.kthp >= 7.0 && grade.kthp < 8.5
	).length;
	const averageSubjects = grades.filter(
		(grade) => grade.kthp !== null && grade.kthp >= 5.5 && grade.kthp < 7.0
	).length;
	const weakSubjects = grades.filter(
		(grade) => grade.kthp !== null && grade.kthp >= 4.0 && grade.kthp < 5.5
	).length;

	// Grade distribution
	const gradeDistribution: { [key: string]: number } = {};
	grades.forEach((grade) => {
		if (grade.diemChu) {
			gradeDistribution[grade.diemChu] = (gradeDistribution[grade.diemChu] || 0) + 1;
		}
	});

	return {
		totalCredits,
		totalPassedCredits,
		totalFailedCredits,
		overallGPA10: calculateGPA10(grades),
		overallGPA4: calculateGPA4(grades),
		totalSubjects,
		passedSubjects,
		failedSubjects,
		excellentSubjects,
		goodSubjects,
		averageSubjects,
		weakSubjects,
		gradeDistribution,
		semesterStats
	};
}
