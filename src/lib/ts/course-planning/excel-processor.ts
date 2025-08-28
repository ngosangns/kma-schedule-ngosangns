// Excel Processing Utilities - Ported and adapted from tin-chi-master for Next.js
import { WorkSheet, utils, read } from 'xlsx';
import {
	Field,
	SheetData,
	JSONData,
	JSONResultData,
	ClassData,
	CellData,
	ExcelProcessingResult
} from '@/types/course-planning';

// Default configuration - can be customized per file
export const DEFAULT_SHEET_DATA: SheetData = {
	CT4: {
		startRow: 5,
		endRow: 112,
		fieldColumn: {
			[Field.Class]: 'D',
			[Field.DayOfWeek]: 'G',
			[Field.Session]: 'H',
			[Field.StartDate]: 'J',
			[Field.EndDate]: 'K',
			[Field.Teacher]: 'L'
		}
	},
	AT17CT5DT4: {
		startRow: 5,
		endRow: 373,
		fieldColumn: {
			[Field.Class]: 'D',
			[Field.DayOfWeek]: 'G',
			[Field.Session]: 'H',
			[Field.StartDate]: 'J',
			[Field.EndDate]: 'K',
			[Field.Teacher]: 'L'
		}
	},
	AT18CT6DT5: {
		startRow: 5,
		endRow: 320,
		fieldColumn: {
			[Field.Class]: 'D',
			[Field.DayOfWeek]: 'G',
			[Field.Session]: 'H',
			[Field.StartDate]: 'J',
			[Field.EndDate]: 'K',
			[Field.Teacher]: 'L'
		}
	},
	AT19CT7DT6: {
		startRow: 5,
		endRow: 424,
		fieldColumn: {
			[Field.Class]: 'D',
			[Field.DayOfWeek]: 'G',
			[Field.Session]: 'H',
			[Field.StartDate]: 'J',
			[Field.EndDate]: 'K',
			[Field.Teacher]: 'L'
		}
	},
	AT20CT8DT7: {
		startRow: 5,
		endRow: 398,
		fieldColumn: {
			[Field.Class]: 'D',
			[Field.DayOfWeek]: 'G',
			[Field.Session]: 'H',
			[Field.StartDate]: 'J',
			[Field.EndDate]: 'K',
			[Field.Teacher]: 'L'
		}
	}
};

// Read sheet and handle merged cells
function readSheetAndUnmerge(fileBuffer: ArrayBuffer, sheetName: string): WorkSheet {
	// Read Excel file from buffer
	const workbook = read(fileBuffer, { type: 'array' });

	// Select worksheet
	const worksheet = workbook.Sheets[sheetName];
	if (!worksheet) {
		throw new Error(`Sheet "${sheetName}" không tìm thấy.`);
	}

	// Handle merged cells
	const mergedCells = worksheet['!merges'] || [];
	mergedCells.forEach((merge) => {
		const startCell = utils.encode_cell(merge.s); // Start cell
		const value = worksheet[startCell]?.v || ''; // Get value from start cell

		// Fill all cells in merged range with same value
		for (let row = merge.s.r; row <= merge.e.r; row++) {
			for (let col = merge.s.c; col <= merge.e.c; col++) {
				const cellAddress = utils.encode_cell({ r: row, c: col });
				worksheet[cellAddress] = { v: value, t: 's' }; // Fill value
			}
		}
	});

	return worksheet;
}

// Read Excel column and convert to JSON
function readExcelColumnToJson(
	workSheet: WorkSheet,
	column: string,
	startRow: number,
	endRow: number
): string[] {
	// Select specific range
	const rangeData = utils.sheet_to_json<CellData>(workSheet, {
		range: `${column}${startRow}:${column}${endRow}`
	});

	return rangeData.map((row: CellData) => Object.values(row) as string[]).flat();
}

// Main processing function
export async function processExcelFile(
	fileBuffer: ArrayBuffer,
	title: string = 'Học kỳ tín chỉ',
	sheetData: SheetData = DEFAULT_SHEET_DATA
): Promise<ExcelProcessingResult> {
	try {
		const jsonData: JSONData = {};

		// Loop through sheets in SHEET_DATA
		for (const sheetName of Object.keys(sheetData)) {
			const currentSheetData = sheetData[sheetName];

			// Skip if sheet data is not defined
			if (!currentSheetData) {
				console.warn(`Warning: Sheet data for "${sheetName}" is not defined`);
				continue;
			}

			try {
				const workSheet = readSheetAndUnmerge(fileBuffer, sheetName);

				// Initialize JSON data for sheet
				jsonData[sheetName] = {
					fieldData: {
						[Field.Class]: [] as string[],
						[Field.DayOfWeek]: [] as string[],
						[Field.Session]: [] as string[],
						[Field.StartDate]: [] as string[],
						[Field.EndDate]: [] as string[],
						[Field.Teacher]: [] as string[]
					}
				};

				const jsonSheetData = jsonData[sheetName];
				const { startRow, endRow } = currentSheetData;

				const fields: [
					Field.Class,
					Field.DayOfWeek,
					Field.Session,
					Field.StartDate,
					Field.EndDate,
					Field.Teacher
				] = [
					Field.Class,
					Field.DayOfWeek,
					Field.Session,
					Field.StartDate,
					Field.EndDate,
					Field.Teacher
				];

				// Read data from columns and save to JSON
				for (const field of fields) {
					jsonSheetData.fieldData[field] = readExcelColumnToJson(
						workSheet,
						currentSheetData.fieldColumn[field],
						startRow,
						endRow
					);
				}
			} catch (sheetError) {
				console.warn(`Warning: Could not process sheet "${sheetName}":`, sheetError);
				// Continue processing other sheets
				continue;
			}
		}

		// Initialize result JSON data
		const jsonResultData: JSONResultData = {
			title,
			minDate: Infinity,
			maxDate: 0,
			majors: {}
		};

		// Process the extracted data
		const processedData = processJsonData(jsonData, jsonResultData);

		return {
			success: true,
			data: processedData
		};
	} catch (error) {
		console.error('Error processing Excel file:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

// Process JSON data and create final structure
function processJsonData(jsonData: JSONData, jsonResultData: JSONResultData): JSONResultData {
	// Loop through sheets in jsonData
	for (const sheetName of Object.keys(jsonData)) {
		const sheetData = jsonData[sheetName];
		if (!sheetData) continue;

		const { fieldData } = sheetData;

		// Loop through classes in fieldData
		for (let i = 0; i < fieldData[Field.Class].length; i++) {
			// Get class title
			const classTitle = fieldData[Field.Class][i];
			if (!classTitle) continue;

			// Get subject name
			const subjectName = classTitle.replace(/\(([^()]+?)\)$/, '').trim();

			// Get class code with practice class code (if any)
			const classCodeWithPracticeClassCode = /\(([^()]+?)\)$/.test(classTitle)
				? classTitle.match(/\(([^()]+?)\)$/)?.[1] || ''
				: '';

			// Get class code
			const classCode = classCodeWithPracticeClassCode.includes('.')
				? classCodeWithPracticeClassCode.split('.')[0]
				: classCodeWithPracticeClassCode;

			// Get practice class code
			const practiceClassCode = classCodeWithPracticeClassCode.includes('.')
				? classCodeWithPracticeClassCode.split('.')[1]
				: '';

			// Get major keys
			const majorKeys: string[] =
				classCode && classCode.includes('-')
					? (() => {
							const codePart = classCode.split('-')[0];
							if (!codePart) return [];
							const matches = codePart.matchAll(/[A-Z]+[0-9]+/g);
							return Array.from(matches, (match: RegExpMatchArray) => match[0]);
						})()
					: [];

			if (majorKeys.length === 0) continue;

			const firstMajorKey = majorKeys[0];
			if (!firstMajorKey) continue;

			// Check if class data already exists
			const isClassDataExist =
				classCode && jsonResultData.majors?.[firstMajorKey]?.[subjectName]?.[classCode];

			// Get current class data or create new if not exists
			const classData =
				isClassDataExist &&
				classCode &&
				jsonResultData.majors[firstMajorKey]?.[subjectName]?.[classCode]
					? jsonResultData.majors[firstMajorKey][subjectName][classCode]
					: ({
							schedules: [],
							[Field.Teacher]: fieldData[Field.Teacher][i] ?? ''
						} as ClassData);

			// Get current class data to add information
			let schedules = classData.schedules;

			// If current class is practice class, assign schedules to practice class array
			if (practiceClassCode && practiceClassCode.length) {
				if (!classData.practiceSchedules) classData.practiceSchedules = {};
				if (!classData.practiceSchedules[practiceClassCode])
					classData.practiceSchedules[practiceClassCode] = [];

				schedules = classData.practiceSchedules[practiceClassCode];
			}

			// Get start and end dates
			const startDateStr = fieldData[Field.StartDate][i];
			const endDateStr = fieldData[Field.EndDate][i];

			if (!startDateStr || !endDateStr) continue;

			const currentStartDate = Number(startDateStr.split('/').reverse().join(''));
			const currentEndDate = Number(endDateStr.split('/').reverse().join(''));

			// Update min and max dates
			if (currentStartDate < jsonResultData.minDate) jsonResultData.minDate = currentStartDate;
			if (currentEndDate > jsonResultData.maxDate) jsonResultData.maxDate = currentEndDate;

			const sessionStr = fieldData[Field.Session][i];
			if (!sessionStr) continue;

			const session = sessionStr.split('->').map(Number);
			const startSession = session[0]; // start session
			const endSession = session[1]; // end session

			if (startSession === undefined || endSession === undefined) continue;

			// Day of week
			const dayOfWeekStr = fieldData[Field.DayOfWeek][i];
			if (!dayOfWeekStr) continue;

			const dayOfWeek = parseInt(dayOfWeekStr === 'CN' ? '8' : dayOfWeekStr);
			const dayOfWeekStandard = dayOfWeek - 1 === 7 ? 0 : dayOfWeek - 1; // convert from 2-8 to 0-6 (0: Sunday)

			schedules.push({
				[Field.StartDate]: currentStartDate,
				[Field.EndDate]: currentEndDate,
				[Field.DayOfWeekStandard]: dayOfWeekStandard,
				[Field.StartSession]: startSession,
				[Field.EndSession]: endSession
			});

			// Update data back to main storage
			if (classCode) {
				for (const majorKey of majorKeys) {
					if (!jsonResultData.majors[majorKey]) jsonResultData.majors[majorKey] = {};

					if (!jsonResultData.majors[majorKey][subjectName])
						jsonResultData.majors[majorKey][subjectName] = {};

					jsonResultData.majors[majorKey][subjectName][classCode] = classData;
				}
			}
		}
	}

	// Merge practice schedules with theory schedules
	mergePracticeSchedules(jsonResultData);

	return jsonResultData;
}

// Merge practice schedules with theory schedules
function mergePracticeSchedules(jsonResultData: JSONResultData): void {
	for (const majorKey in jsonResultData.majors) {
		const majorData = jsonResultData.majors[majorKey];

		for (const subjectKey in majorData) {
			const subjectData = majorData[subjectKey];

			for (const classKey in subjectData) {
				const classData = subjectData[classKey];

				// Skip if classData is undefined
				if (!classData) continue;

				// If class has practice schedules, merge theory + practice into new class
				if (classData.practiceSchedules && Object.keys(classData.practiceSchedules).length) {
					for (const practiceClassKey in classData.practiceSchedules) {
						const practiceSchedule = classData.practiceSchedules[practiceClassKey];
						if (practiceSchedule) {
							subjectData[`${classKey}.${practiceClassKey}`] = {
								schedules: [...classData.schedules, ...practiceSchedule],
								[Field.Teacher]: classData[Field.Teacher]
							} as ClassData;
						}
					}

					// Remove theory class
					delete subjectData[classKey];
				}
			}
		}
	}
}

// Utility function to process file from File object
export async function processExcelFileFromFile(
	file: File,
	title?: string,
	sheetData?: SheetData
): Promise<ExcelProcessingResult> {
	try {
		const arrayBuffer = await file.arrayBuffer();
		return await processExcelFile(arrayBuffer, title, sheetData);
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to read file'
		};
	}
}
