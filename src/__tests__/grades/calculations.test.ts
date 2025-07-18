import {
	calculateDQT,
	calculateKTHP,
	convertToGrade4,
	convertToLetterGrade,
	shouldExcludeFromGPA,
	processGradeRecord,
	calculateGPA10,
	calculateGPA4,
	calculateOverallStats
} from '@/lib/ts/grades/calculations';
import { GradeRecord } from '@/types/grades';

describe('Grade Calculations', () => {
	describe('calculateDQT', () => {
		it('should calculate DQT correctly with valid inputs', () => {
			expect(calculateDQT(8.0, 9.0)).toBe(8.3); // 0.7 * 8.0 + 0.3 * 9.0 = 5.6 + 2.7 = 8.3
			expect(calculateDQT(7.5, 8.5)).toBe(7.8); // 0.7 * 7.5 + 0.3 * 8.5 = 5.25 + 2.55 = 7.8
		});

		it('should return null for invalid inputs', () => {
			expect(calculateDQT(null, 9.0)).toBeNull();
			expect(calculateDQT(8.0, null)).toBeNull();
			expect(calculateDQT(null, null)).toBeNull();
			expect(calculateDQT(-1, 9.0)).toBeNull();
			expect(calculateDQT(8.0, 11)).toBeNull();
		});
	});

	describe('calculateKTHP', () => {
		it('should calculate KTHP correctly with valid inputs', () => {
			expect(calculateKTHP(8.0, 7.0)).toBe(7.3); // 0.3 * 8.0 + 0.7 * 7.0 = 2.4 + 4.9 = 7.3
			expect(calculateKTHP(9.0, 8.0)).toBe(8.3); // 0.3 * 9.0 + 0.7 * 8.0 = 2.7 + 5.6 = 8.3
		});

		it('should return null for invalid inputs', () => {
			expect(calculateKTHP(null, 7.0)).toBeNull();
			expect(calculateKTHP(8.0, null)).toBeNull();
			expect(calculateKTHP(null, null)).toBeNull();
		});
	});

	describe('convertToGrade4', () => {
		it('should convert grades correctly', () => {
			expect(convertToGrade4(9.5)).toBe(4.0); // Xuất sắc
			expect(convertToGrade4(8.2)).toBe(3.0); // Giỏi
			expect(convertToGrade4(7.5)).toBe(3.0); // Giỏi
			expect(convertToGrade4(6.7)).toBe(2.0); // Khá
			expect(convertToGrade4(6.2)).toBe(2.0); // Khá
			expect(convertToGrade4(5.7)).toBe(2.0); // Khá
			expect(convertToGrade4(5.2)).toBe(1.0); // Trung bình
			expect(convertToGrade4(4.5)).toBe(1.0); // Trung bình
			expect(convertToGrade4(3.0)).toBe(0.0); // Yếu/Kém
		});

		it('should return null for invalid inputs', () => {
			expect(convertToGrade4(null)).toBeNull();
			expect(convertToGrade4(-1)).toBeNull();
			expect(convertToGrade4(11)).toBeNull();
		});
	});

	describe('convertToLetterGrade', () => {
		it('should convert to letter grades correctly', () => {
			expect(convertToLetterGrade(9.5)).toBe('Xuất sắc');
			expect(convertToLetterGrade(8.2)).toBe('Giỏi');
			expect(convertToLetterGrade(7.5)).toBe('Giỏi');
			expect(convertToLetterGrade(6.7)).toBe('Khá');
			expect(convertToLetterGrade(6.2)).toBe('Khá');
			expect(convertToLetterGrade(5.7)).toBe('Khá');
			expect(convertToLetterGrade(5.2)).toBe('Trung bình');
			expect(convertToLetterGrade(4.5)).toBe('Trung bình');
			expect(convertToLetterGrade(3.0)).toBe('Yếu/Kém');
		});
	});

	describe('shouldExcludeFromGPA', () => {
		it('should identify excluded subjects', () => {
			expect(shouldExcludeFromGPA('Giáo dục thể chất 1')).toBe(true);
			expect(shouldExcludeFromGPA('Giáo dục quốc phòng')).toBe(true);
			expect(shouldExcludeFromGPA('Thể dục')).toBe(true);
			expect(shouldExcludeFromGPA('Toán cao cấp')).toBe(false);
			expect(shouldExcludeFromGPA('Lập trình C')).toBe(false);
		});
	});

	describe('processGradeRecord', () => {
		it('should process a complete grade record', () => {
			const input = {
				tenMon: 'Toán cao cấp A1',
				ky: 1,
				tin: 4,
				tp1: 8.0,
				tp2: 9.0,
				thi: 7.0
			};

			const result = processGradeRecord(input);

			expect(result.tenMon).toBe('Toán cao cấp A1');
			expect(result.ky).toBe(1);
			expect(result.tin).toBe(4);
			expect(result.tp1).toBe(8.0);
			expect(result.tp2).toBe(9.0);
			expect(result.thi).toBe(7.0);
			expect(result.dqt).toBe(8.3); // 0.7 * 8.0 + 0.3 * 9.0
			expect(result.kthp).toBe(7.39); // 0.3 * 8.3 + 0.7 * 7.0
			expect(result.kthpHe4).toBe(3.0);
			expect(result.diemChu).toBe('Giỏi');
			expect(result.isValid).toBe(true);
		});

		it('should handle excluded subjects', () => {
			const input = {
				tenMon: 'Giáo dục thể chất 1',
				ky: 1,
				tin: 1,
				tp1: 8.0,
				tp2: 9.0,
				thi: 8.0
			};

			const result = processGradeRecord(input);
			expect(result.excludeFromGPA).toBe(true);
		});

		it('should validate required fields', () => {
			const input = {
				tenMon: '',
				ky: 0,
				tin: -1,
				tp1: 8.0,
				tp2: 9.0,
				thi: 7.0
			};

			const result = processGradeRecord(input);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Tên môn không được để trống');
			expect(result.errors).toContain('Kỳ học không hợp lệ');
			expect(result.errors).toContain('Số tín chỉ không hợp lệ');
		});
	});

	describe('calculateGPA10', () => {
		const sampleGrades: GradeRecord[] = [
			{
				id: '1',
				tenMon: 'Toán cao cấp',
				ky: 1,
				tin: 4,
				tp1: 8.0,
				tp2: 9.0,
				thi: 7.0,
				dqt: 8.3,
				kthp: 7.61,
				kthpHe4: 3.0,
				diemChu: 'B+',
				excludeFromGPA: false,
				isValid: true
			},
			{
				id: '2',
				tenMon: 'Lập trình C',
				ky: 1,
				tin: 3,
				tp1: 9.0,
				tp2: 8.5,
				thi: 8.5,
				dqt: 8.85,
				kthp: 8.61,
				kthpHe4: 4.0,
				diemChu: 'A+',
				excludeFromGPA: false,
				isValid: true
			},
			{
				id: '3',
				tenMon: 'Giáo dục thể chất',
				ky: 1,
				tin: 1,
				tp1: 9.0,
				tp2: 9.0,
				thi: 9.0,
				dqt: 9.0,
				kthp: 9.0,
				kthpHe4: 4.0,
				diemChu: 'A+',
				excludeFromGPA: true,
				isValid: true
			}
		];

		it('should calculate GPA correctly excluding non-GPA subjects', () => {
			const gpa = calculateGPA10(sampleGrades);
			// (7.61 * 4 + 8.61 * 3) / (4 + 3) = (30.44 + 25.83) / 7 = 56.27 / 7 = 8.04
			expect(gpa).toBeCloseTo(8.04, 2);
		});

		it('should return null for empty grades', () => {
			expect(calculateGPA10([])).toBeNull();
		});
	});

	describe('calculateGPA4', () => {
		const sampleGrades: GradeRecord[] = [
			{
				id: '1',
				tenMon: 'Toán cao cấp',
				ky: 1,
				tin: 4,
				tp1: 8.0,
				tp2: 9.0,
				thi: 7.0,
				dqt: 8.3,
				kthp: 7.61,
				kthpHe4: 3.0,
				diemChu: 'B+',
				excludeFromGPA: false,
				isValid: true
			},
			{
				id: '2',
				tenMon: 'Lập trình C',
				ky: 1,
				tin: 3,
				tp1: 9.0,
				tp2: 8.5,
				thi: 8.5,
				dqt: 8.85,
				kthp: 8.61,
				kthpHe4: 4.0,
				diemChu: 'A+',
				excludeFromGPA: false,
				isValid: true
			}
		];

		it('should calculate GPA4 correctly', () => {
			const gpa = calculateGPA4(sampleGrades);
			// (3.0 * 4 + 4.0 * 3) / (4 + 3) = (12 + 12) / 7 = 24 / 7 = 3.43
			expect(gpa).toBeCloseTo(3.43, 2);
		});
	});

	describe('calculateOverallStats', () => {
		const sampleGrades: GradeRecord[] = [
			{
				id: '1',
				tenMon: 'Toán cao cấp',
				ky: 1,
				tin: 4,
				tp1: 8.0,
				tp2: 9.0,
				thi: 7.0,
				dqt: 8.3,
				kthp: 7.61,
				kthpHe4: 3.0,
				diemChu: 'B+',
				excludeFromGPA: false,
				isValid: true
			},
			{
				id: '2',
				tenMon: 'Lập trình C',
				ky: 1,
				tin: 3,
				tp1: 9.0,
				tp2: 8.5,
				thi: 8.5,
				dqt: 8.85,
				kthp: 8.61,
				kthpHe4: 4.0,
				diemChu: 'A+',
				excludeFromGPA: false,
				isValid: true
			},
			{
				id: '3',
				tenMon: 'Cơ sở dữ liệu',
				ky: 2,
				tin: 3,
				tp1: 4.0,
				tp2: 5.0,
				thi: 3.0,
				dqt: 4.3,
				kthp: 3.79,
				kthpHe4: 0.0,
				diemChu: 'F',
				excludeFromGPA: false,
				isValid: true
			}
		];

		it('should calculate overall statistics correctly', () => {
			const stats = calculateOverallStats(sampleGrades);

			expect(stats.totalSubjects).toBe(3);
			expect(stats.totalCredits).toBe(10);
			expect(stats.passedSubjects).toBe(2);
			expect(stats.failedSubjects).toBe(1);
			expect(stats.excellentSubjects).toBe(1); // A+
			expect(stats.goodSubjects).toBe(1); // B+
			expect(stats.gradeDistribution['A+']).toBe(1);
			expect(stats.gradeDistribution['B+']).toBe(1);
			expect(stats.gradeDistribution['F']).toBe(1);
			expect(stats.semesterStats).toHaveLength(2);
		});
	});
});
