import Papa from 'papaparse';
import { z } from 'zod';
import {
	GradeRecord,
	RawGradeData,
	ImportResult,
	ExportOptions,
	GradeStatistics
} from '@/types/grades';
import { processGradeRecord } from './calculations';

// Zod schema for validating raw grade data
const RawGradeSchema = z.object({
	'Tên môn': z.string().min(1, 'Tên môn không được để trống'),
	'Kỳ': z.union([z.string(), z.number()]).transform((val) => {
		const num = typeof val === 'string' ? parseInt(val, 10) : val;
		return isNaN(num) ? 1 : num;
	}),
	'Tín': z.union([z.string(), z.number()]).transform((val) => {
		const num = typeof val === 'string' ? parseInt(val, 10) : val;
		return isNaN(num) ? 0 : num;
	}),
	'TP1': z
		.union([z.string(), z.number(), z.null()])
		.transform((val) => {
			if (val === null || val === '' || val === undefined) return null;
			const num = typeof val === 'string' ? parseFloat(val) : val;
			return isNaN(num) ? null : num;
		})
		.nullable(),
	'TP2': z
		.union([z.string(), z.number(), z.null()])
		.transform((val) => {
			if (val === null || val === '' || val === undefined) return null;
			const num = typeof val === 'string' ? parseFloat(val) : val;
			return isNaN(num) ? null : num;
		})
		.nullable(),
	'Thi': z
		.union([z.string(), z.number(), z.null()])
		.transform((val) => {
			if (val === null || val === '' || val === undefined) return null;
			const num = typeof val === 'string' ? parseFloat(val) : val;
			return isNaN(num) ? null : num;
		})
		.nullable(),
	'ĐQT': z
		.union([z.string(), z.number(), z.null()])
		.transform((val) => {
			if (val === null || val === '' || val === undefined) return null;
			const num = typeof val === 'string' ? parseFloat(val) : val;
			return isNaN(num) ? null : num;
		})
		.nullable()
		.optional(),
	'KTHP': z
		.union([z.string(), z.number(), z.null()])
		.transform((val) => {
			if (val === null || val === '' || val === undefined) return null;
			const num = typeof val === 'string' ? parseFloat(val) : val;
			return isNaN(num) ? null : num;
		})
		.nullable()
		.optional(),
	'KTHP hệ 4': z
		.union([z.string(), z.number(), z.null()])
		.transform((val) => {
			if (val === null || val === '' || val === undefined) return null;
			const num = typeof val === 'string' ? parseFloat(val) : val;
			return isNaN(num) ? null : num;
		})
		.nullable()
		.optional(),
	'Điểm chữ': z.string().nullable().optional()
});

/**
 * Parse CSV file content
 */
export function parseCSV(csvContent: string): Promise<ImportResult> {
	return new Promise((resolve) => {
		Papa.parse(csvContent, {
			header: true,
			skipEmptyLines: true,
			transformHeader: (header) => header.trim(),
			complete: (results) => {
				const importResult = processRawData(results.data as RawGradeData[]);
				resolve(importResult);
			},
			error: (error) => {
				resolve({
					success: false,
					data: [],
					errors: [`CSV parsing error: ${error.message}`],
					warnings: [],
					totalRecords: 0,
					validRecords: 0,
					invalidRecords: 0
				});
			}
		});
	});
}

/**
 * Parse JSON file content
 */
export function parseJSON(jsonContent: string): ImportResult {
	try {
		const data = JSON.parse(jsonContent);
		
		// Handle different JSON structures
		let rawData: RawGradeData[];
		
		if (Array.isArray(data)) {
			rawData = data;
		} else if (data.grades && Array.isArray(data.grades)) {
			rawData = data.grades;
		} else if (data.data && Array.isArray(data.data)) {
			rawData = data.data;
		} else {
			return {
				success: false,
				data: [],
				errors: ['Invalid JSON structure. Expected an array of grade records or an object with grades/data property.'],
				warnings: [],
				totalRecords: 0,
				validRecords: 0,
				invalidRecords: 0
			};
		}

		return processRawData(rawData);
	} catch (error) {
		return {
			success: false,
			data: [],
			errors: [`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
			warnings: [],
			totalRecords: 0,
			validRecords: 0,
			invalidRecords: 0
		};
	}
}

/**
 * Process raw data and convert to GradeRecord[]
 */
function processRawData(rawData: RawGradeData[]): ImportResult {
	const errors: string[] = [];
	const warnings: string[] = [];
	const validGrades: GradeRecord[] = [];
	let validRecords = 0;
	let invalidRecords = 0;

	rawData.forEach((row, index) => {
		try {
			// Validate with Zod schema
			const validatedRow = RawGradeSchema.parse(row);
			
			// Convert to GradeRecord format
			const gradeRecord = processGradeRecord({
				tenMon: validatedRow['Tên môn'],
				ky: validatedRow['Kỳ'],
				tin: validatedRow['Tín'],
				tp1: validatedRow['TP1'],
				tp2: validatedRow['TP2'],
				thi: validatedRow['Thi'],
				dqt: validatedRow['ĐQT'],
				kthp: validatedRow['KTHP'],
				kthpHe4: validatedRow['KTHP hệ 4'],
				diemChu: validatedRow['Điểm chữ']
			});

			if (gradeRecord.isValid) {
				validGrades.push(gradeRecord);
				validRecords++;
			} else {
				invalidRecords++;
				if (gradeRecord.errors) {
					errors.push(`Row ${index + 1}: ${gradeRecord.errors.join(', ')}`);
				}
			}

			// Add warnings for missing data
			if (!gradeRecord.tp1 && !gradeRecord.tp2 && !gradeRecord.thi) {
				warnings.push(`Row ${index + 1}: Missing all grade components for ${gradeRecord.tenMon}`);
			}
		} catch (error) {
			invalidRecords++;
			if (error instanceof z.ZodError) {
				const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
				errors.push(`Row ${index + 1}: ${fieldErrors.join(', ')}`);
			} else {
				errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		}
	});

	return {
		success: validRecords > 0,
		data: validGrades,
		errors,
		warnings,
		totalRecords: rawData.length,
		validRecords,
		invalidRecords
	};
}

/**
 * Export grades to CSV format
 */
export function exportToCSV(
	grades: GradeRecord[],
	options: ExportOptions = { format: 'csv', includeCalculated: true, includeSemesterStats: false, includeOverallStats: false }
): string {
	const headers = [
		'Tên môn',
		'Kỳ',
		'Tín',
		'TP1',
		'TP2',
		'Thi'
	];

	if (options.includeCalculated) {
		headers.push('ĐQT', 'KTHP', 'KTHP hệ 4', 'Điểm chữ');
	}

	const rows = grades.map(grade => {
		const row = [
			grade.tenMon,
			grade.ky.toString(),
			grade.tin.toString(),
			grade.tp1?.toString() || '',
			grade.tp2?.toString() || '',
			grade.thi?.toString() || ''
		];

		if (options.includeCalculated) {
			row.push(
				grade.dqt?.toString() || '',
				grade.kthp?.toString() || '',
				grade.kthpHe4?.toString() || '',
				grade.diemChu || ''
			);
		}

		return row;
	});

	return Papa.unparse({
		fields: headers,
		data: rows
	});
}

/**
 * Export grades to JSON format
 */
export function exportToJSON(
	grades: GradeRecord[],
	statistics?: GradeStatistics,
	options: ExportOptions = { format: 'json', includeCalculated: true, includeSemesterStats: false, includeOverallStats: false }
): string {
	const exportData: any = {
		exportDate: new Date().toISOString(),
		totalRecords: grades.length,
		grades: grades.map(grade => {
			const exportGrade: any = {
				'Tên môn': grade.tenMon,
				'Kỳ': grade.ky,
				'Tín': grade.tin,
				'TP1': grade.tp1,
				'TP2': grade.tp2,
				'Thi': grade.thi
			};

			if (options.includeCalculated) {
				exportGrade['ĐQT'] = grade.dqt;
				exportGrade['KTHP'] = grade.kthp;
				exportGrade['KTHP hệ 4'] = grade.kthpHe4;
				exportGrade['Điểm chữ'] = grade.diemChu;
			}

			return exportGrade;
		})
	};

	if (statistics && (options.includeSemesterStats || options.includeOverallStats)) {
		if (options.includeOverallStats) {
			exportData.overallStatistics = {
				totalCredits: statistics.totalCredits,
				totalPassedCredits: statistics.totalPassedCredits,
				overallGPA10: statistics.overallGPA10,
				overallGPA4: statistics.overallGPA4,
				totalSubjects: statistics.totalSubjects,
				passedSubjects: statistics.passedSubjects,
				failedSubjects: statistics.failedSubjects,
				gradeDistribution: statistics.gradeDistribution
			};
		}

		if (options.includeSemesterStats) {
			exportData.semesterStatistics = statistics.semesterStats.map(semester => ({
				semester: semester.semester,
				totalCredits: semester.totalCredits,
				gpa10: semester.gpa10,
				gpa4: semester.gpa4,
				passedCredits: semester.passedCredits,
				failedSubjects: semester.failedSubjects,
				excellentSubjects: semester.excellentSubjects
			}));
		}
	}

	return JSON.stringify(exportData, null, 2);
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
