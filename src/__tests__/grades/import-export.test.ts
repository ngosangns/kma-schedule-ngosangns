import { parseJSON, exportToCSV, exportToJSON } from '@/lib/ts/grades/import-export';
import { GradeRecord, GradeStatistics } from '@/types/grades';

describe('Import/Export Functions', () => {
	const sampleGrades: GradeRecord[] = [
		{
			id: '1',
			tenMon: 'Toán cao cấp A1',
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

	describe('parseJSON', () => {
		it('should parse valid JSON array', () => {
			const jsonData = JSON.stringify([
				{
					'Tên môn': 'Toán cao cấp A1',
					Kỳ: 1,
					Tín: 4,
					TP1: 8.0,
					TP2: 9.0,
					Thi: 7.0
				},
				{
					'Tên môn': 'Lập trình C',
					Kỳ: 1,
					Tín: 3,
					TP1: 9.0,
					TP2: 8.5,
					Thi: 8.5
				}
			]);

			const result = parseJSON(jsonData);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(2);
			expect(result.validRecords).toBe(2);
			expect(result.invalidRecords).toBe(0);
			expect(result.data[0]?.tenMon).toBe('Toán cao cấp A1');
			expect(result.data[1]?.tenMon).toBe('Lập trình C');
		});

		it('should parse JSON with grades property', () => {
			const jsonData = JSON.stringify({
				grades: [
					{
						'Tên môn': 'Toán cao cấp A1',
						Kỳ: 1,
						Tín: 4,
						TP1: 8.0,
						TP2: 9.0,
						Thi: 7.0
					}
				]
			});

			const result = parseJSON(jsonData);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(1);
			expect(result.data[0]?.tenMon).toBe('Toán cao cấp A1');
		});

		it('should handle invalid JSON', () => {
			const result = parseJSON('invalid json');

			expect(result.success).toBe(false);
			expect(result.data).toHaveLength(0);
			expect(result.errors).toContain(expect.stringContaining('JSON parsing error'));
		});

		it('should handle invalid JSON structure', () => {
			const jsonData = JSON.stringify({ invalid: 'structure' });

			const result = parseJSON(jsonData);

			expect(result.success).toBe(false);
			expect(result.errors).toContain(expect.stringContaining('Invalid JSON structure'));
		});

		it('should validate required fields', () => {
			const jsonData = JSON.stringify([
				{
					'Tên môn': '', // Invalid: empty name
					Kỳ: 1,
					Tín: 4,
					TP1: 8.0,
					TP2: 9.0,
					Thi: 7.0
				},
				{
					'Tên môn': 'Valid Subject',
					Kỳ: 1,
					Tín: 3,
					TP1: 9.0,
					TP2: 8.5,
					Thi: 8.5
				}
			]);

			const result = parseJSON(jsonData);

			expect(result.success).toBe(true); // Still success because we have valid records
			expect(result.validRecords).toBe(1);
			expect(result.invalidRecords).toBe(1);
			expect(result.errors).toContain(expect.stringContaining('Tên môn không được để trống'));
		});

		it('should handle missing optional fields', () => {
			const jsonData = JSON.stringify([
				{
					'Tên môn': 'Toán cao cấp A1',
					Kỳ: 1,
					Tín: 4,
					TP1: 8.0,
					TP2: 9.0,
					Thi: null // Missing grade
				}
			]);

			const result = parseJSON(jsonData);

			expect(result.success).toBe(true);
			expect(result.data).toHaveLength(1);
			expect(result.data[0]?.thi).toBeNull();
			expect(result.warnings).toContain(expect.stringContaining('Missing all grade components'));
		});
	});

	describe('exportToCSV', () => {
		it('should export basic CSV without calculated fields', () => {
			const csv = exportToCSV(sampleGrades, {
				format: 'csv',
				includeCalculated: false,
				includeSemesterStats: false,
				includeOverallStats: false
			});

			expect(csv).toContain('Tên môn,Kỳ,Tín,TP1,TP2,Thi');
			expect(csv).toContain('Toán cao cấp A1,1,4,8,9,7');
			expect(csv).toContain('Lập trình C,1,3,9,8.5,8.5');
			expect(csv).not.toContain('ĐQT');
			expect(csv).not.toContain('KTHP');
		});

		it('should export CSV with calculated fields', () => {
			const csv = exportToCSV(sampleGrades, {
				format: 'csv',
				includeCalculated: true,
				includeSemesterStats: false,
				includeOverallStats: false
			});

			expect(csv).toContain('Tên môn,Kỳ,Tín,TP1,TP2,Thi,ĐQT,KTHP,KTHP hệ 4,Điểm chữ');
			expect(csv).toContain('Toán cao cấp A1,1,4,8,9,7,8.3,7.61,3,B+');
			expect(csv).toContain('Lập trình C,1,3,9,8.5,8.5,8.85,8.61,4,A+');
		});

		it('should handle null values in CSV export', () => {
			const gradesWithNulls: GradeRecord[] = [
				{
					...sampleGrades[0]!,
					tp1: null,
					tp2: null,
					thi: null,
					dqt: null,
					kthp: null,
					kthpHe4: null,
					diemChu: null
				}
			];

			const csv = exportToCSV(gradesWithNulls, {
				format: 'csv',
				includeCalculated: true,
				includeSemesterStats: false,
				includeOverallStats: false
			});

			expect(csv).toContain('Toán cao cấp A1,1,4,,,,,,,');
		});
	});

	describe('exportToJSON', () => {
		const mockStatistics: GradeStatistics = {
			totalCredits: 7,
			totalPassedCredits: 7,
			totalFailedCredits: 0,
			overallGPA10: 8.04,
			overallGPA4: 3.43,
			totalSubjects: 2,
			passedSubjects: 2,
			failedSubjects: 0,
			excellentSubjects: 1,
			goodSubjects: 1,
			averageSubjects: 0,
			weakSubjects: 0,
			gradeDistribution: { 'A+': 1, 'B+': 1 },
			semesterStats: [
				{
					semester: 1,
					grades: sampleGrades,
					totalCredits: 7,
					gpa10: 8.04,
					gpa4: 3.43,
					passedCredits: 7,
					failedSubjects: 0,
					excellentSubjects: 1
				}
			]
		};

		it('should export basic JSON without statistics', () => {
			const json = exportToJSON(sampleGrades, undefined, {
				format: 'json',
				includeCalculated: true,
				includeSemesterStats: false,
				includeOverallStats: false
			});

			const parsed = JSON.parse(json);

			expect(parsed.exportDate).toBeDefined();
			expect(parsed.totalRecords).toBe(2);
			expect(parsed.grades).toHaveLength(2);
			expect(parsed.grades[0]['Tên môn']).toBe('Toán cao cấp A1');
			expect(parsed.grades[0]['ĐQT']).toBe(8.3);
			expect(parsed.overallStatistics).toBeUndefined();
			expect(parsed.semesterStatistics).toBeUndefined();
		});

		it('should export JSON with overall statistics', () => {
			const json = exportToJSON(sampleGrades, mockStatistics, {
				format: 'json',
				includeCalculated: true,
				includeSemesterStats: false,
				includeOverallStats: true
			});

			const parsed = JSON.parse(json);

			expect(parsed.overallStatistics).toBeDefined();
			expect(parsed.overallStatistics.totalCredits).toBe(7);
			expect(parsed.overallStatistics.overallGPA10).toBe(8.04);
			expect(parsed.overallStatistics.gradeDistribution).toEqual({ 'A+': 1, 'B+': 1 });
			expect(parsed.semesterStatistics).toBeUndefined();
		});

		it('should export JSON with semester statistics', () => {
			const json = exportToJSON(sampleGrades, mockStatistics, {
				format: 'json',
				includeCalculated: true,
				includeSemesterStats: true,
				includeOverallStats: false
			});

			const parsed = JSON.parse(json);

			expect(parsed.semesterStatistics).toBeDefined();
			expect(parsed.semesterStatistics).toHaveLength(1);
			expect(parsed.semesterStatistics[0].semester).toBe(1);
			expect(parsed.semesterStatistics[0].totalCredits).toBe(7);
			expect(parsed.overallStatistics).toBeUndefined();
		});

		it('should export JSON without calculated fields', () => {
			const json = exportToJSON(sampleGrades, undefined, {
				format: 'json',
				includeCalculated: false,
				includeSemesterStats: false,
				includeOverallStats: false
			});

			const parsed = JSON.parse(json);

			expect(parsed.grades[0]['ĐQT']).toBeUndefined();
			expect(parsed.grades[0]['KTHP']).toBeUndefined();
			expect(parsed.grades[0]['KTHP hệ 4']).toBeUndefined();
			expect(parsed.grades[0]['Điểm chữ']).toBeUndefined();
			expect(parsed.grades[0]['Tên môn']).toBe('Toán cao cấp A1');
			expect(parsed.grades[0]['TP1']).toBe(8.0);
		});
	});
});
