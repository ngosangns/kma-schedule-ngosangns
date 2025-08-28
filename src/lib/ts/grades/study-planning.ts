import { GradeRecord } from '@/types/grades';
import { calculateGPA10, calculateGPA4, isSubjectFailed } from './calculations';

export interface StudyPlanInput {
	targetGPA: number;
	useGPA4Scale: boolean;
	remainingSubjects: Array<{
		name: string;
		credits: number;
		semester: number;
	}>;
}

export interface StudyPlanResult {
	success: boolean;
	targetGPA: number;
	currentGPA: number | null;
	requiredAverageScore: number | null;
	totalRemainingCredits: number;
	isAchievable: boolean;
	isAlreadyAchieved: boolean;
	message: string;
	breakdown?: {
		currentWeightedScore: number;
		currentTotalCredits: number;
		requiredWeightedScore: number;
		totalCreditsAfterCompletion: number;
	};
}

/**
 * Calculate study plan to achieve target GPA
 */
export function calculateStudyPlan(
	existingGrades: GradeRecord[],
	input: StudyPlanInput
): StudyPlanResult {
	const { targetGPA, useGPA4Scale, remainingSubjects } = input;

	// Validate input
	if (targetGPA <= 0 || targetGPA > (useGPA4Scale ? 4 : 10)) {
		return {
			success: false,
			targetGPA,
			currentGPA: null,
			requiredAverageScore: null,
			totalRemainingCredits: 0,
			isAchievable: false,
			isAlreadyAchieved: false,
			message: `GPA mục tiêu không hợp lệ. Phải từ 0 đến ${useGPA4Scale ? 4 : 10}.`
		};
	}

	if (remainingSubjects.length === 0) {
		return {
			success: false,
			targetGPA,
			currentGPA: null,
			requiredAverageScore: null,
			totalRemainingCredits: 0,
			isAchievable: false,
			isAlreadyAchieved: false,
			message: 'Không có môn học nào còn lại để cải thiện điểm.'
		};
	}

	// Calculate current GPA
	const currentGPA = useGPA4Scale ? calculateGPA4(existingGrades) : calculateGPA10(existingGrades);

	if (currentGPA === null) {
		return {
			success: false,
			targetGPA,
			currentGPA: null,
			requiredAverageScore: null,
			totalRemainingCredits: 0,
			isAchievable: false,
			isAlreadyAchieved: false,
			message: 'Không thể tính GPA hiện tại. Vui lòng kiểm tra dữ liệu điểm.'
		};
	}

	// Check if target is already achieved
	if (currentGPA >= targetGPA) {
		return {
			success: true,
			targetGPA,
			currentGPA,
			requiredAverageScore: null,
			totalRemainingCredits: remainingSubjects.reduce((sum, subject) => sum + subject.credits, 0),
			isAchievable: true,
			isAlreadyAchieved: true,
			message: `Bạn đã đạt được GPA mục tiêu! GPA hiện tại: ${currentGPA.toFixed(2)}`
		};
	}

	// Calculate current weighted score and credits
	const validGrades = existingGrades.filter(
		(grade) => !grade.excludeFromGPA && grade.tin > 0 && !isSubjectFailed(grade)
	);

	const currentWeightedScore = validGrades.reduce((sum, grade) => {
		const score = useGPA4Scale ? grade.kthpHe4 : grade.kthp;
		return sum + (score || 0) * grade.tin;
	}, 0);

	const currentTotalCredits = validGrades.reduce((sum, grade) => sum + grade.tin, 0);
	const totalRemainingCredits = remainingSubjects.reduce(
		(sum, subject) => sum + subject.credits,
		0
	);
	const totalCreditsAfterCompletion = currentTotalCredits + totalRemainingCredits;

	// Calculate required weighted score for remaining subjects
	const requiredTotalWeightedScore = targetGPA * totalCreditsAfterCompletion;
	const requiredWeightedScore = requiredTotalWeightedScore - currentWeightedScore;
	const requiredAverageScore = requiredWeightedScore / totalRemainingCredits;

	// Check if achievable
	const maxPossibleScore = useGPA4Scale ? 4 : 10;
	const isAchievable = requiredAverageScore <= maxPossibleScore && requiredAverageScore >= 0;

	let message = '';
	if (!isAchievable) {
		if (requiredAverageScore > maxPossibleScore) {
			message = `Không thể đạt được GPA mục tiêu. Cần điểm trung bình ${requiredAverageScore.toFixed(2)} cho các môn còn lại (vượt quá điểm tối đa ${maxPossibleScore}).`;
		} else {
			message = `Không thể đạt được GPA mục tiêu. Điểm trung bình cần thiết âm: ${requiredAverageScore.toFixed(2)}.`;
		}
	} else {
		const difficulty = getDifficultyLevel(requiredAverageScore, useGPA4Scale);
		message = `Để đạt GPA ${targetGPA}, bạn cần điểm trung bình ${requiredAverageScore.toFixed(2)} cho ${remainingSubjects.length} môn còn lại (${totalRemainingCredits} tín chỉ). Mức độ: ${difficulty}`;
	}

	return {
		success: true,
		targetGPA,
		currentGPA,
		requiredAverageScore: isAchievable ? requiredAverageScore : null,
		totalRemainingCredits,
		isAchievable,
		isAlreadyAchieved: false,
		message,
		breakdown: {
			currentWeightedScore,
			currentTotalCredits,
			requiredWeightedScore,
			totalCreditsAfterCompletion
		}
	};
}

/**
 * Get difficulty level based on required average score
 */
function getDifficultyLevel(requiredScore: number, useGPA4Scale: boolean): string {
	if (useGPA4Scale) {
		if (requiredScore >= 3.7) return 'Rất khó (A)';
		if (requiredScore >= 3.0) return 'Khó (B)';
		if (requiredScore >= 2.0) return 'Trung bình (C)';
		return 'Dễ (D)';
	} else {
		if (requiredScore >= 8.5) return 'Rất khó (Giỏi)';
		if (requiredScore >= 7.0) return 'Khó (Khá)';
		if (requiredScore >= 5.5) return 'Trung bình';
		if (requiredScore >= 4.0) return 'Dễ (Đạt)';
		return 'Rất dễ';
	}
}

/**
 * Get remaining subjects from grade records
 * This is a helper function to identify subjects that don't have final grades yet
 */
export function getRemainingSubjects(
	allGrades: GradeRecord[],
	plannedSubjects?: Array<{ name: string; credits: number; semester: number }>
): Array<{ name: string; credits: number; semester: number }> {
	// If planned subjects are provided, use them
	if (plannedSubjects && plannedSubjects.length > 0) {
		return plannedSubjects;
	}

	// Otherwise, find subjects without final grades (kthp is null)
	const remainingFromExisting = allGrades
		.filter((grade) => grade.kthp === null && grade.tin > 0)
		.map((grade) => ({
			name: grade.tenMon,
			credits: grade.tin,
			semester: grade.ky
		}));

	return remainingFromExisting;
}

/**
 * Calculate multiple scenarios for different target GPAs
 */
export function calculateMultipleScenarios(
	existingGrades: GradeRecord[],
	remainingSubjects: Array<{ name: string; credits: number; semester: number }>,
	useGPA4Scale: boolean
): StudyPlanResult[] {
	const targetGPAs = useGPA4Scale
		? [2.0, 2.5, 3.0, 3.2, 3.5, 3.7, 4.0]
		: [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

	return targetGPAs
		.map((targetGPA) =>
			calculateStudyPlan(existingGrades, {
				targetGPA,
				useGPA4Scale,
				remainingSubjects
			})
		)
		.filter((result) => result.success);
}
