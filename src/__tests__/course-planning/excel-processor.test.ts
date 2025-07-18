import { processExcelFile, DEFAULT_SHEET_DATA } from '@/lib/ts/course-planning/excel-processor';
import { Field } from '@/types/course-planning';

// Mock data for testing
const createMockExcelBuffer = (): ArrayBuffer => {
	// This would normally be a real Excel file buffer
	// For testing purposes, we'll create a minimal mock
	return new ArrayBuffer(0);
};

describe('Excel Processor', () => {
	describe('processExcelFile', () => {
		it('should handle empty buffer gracefully', async () => {
			const buffer = createMockExcelBuffer();
			const result = await processExcelFile(buffer, 'Test Semester');

			// Empty buffer should succeed but with empty data
			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			if (result.data) {
				expect(Object.keys(result.data.majors)).toHaveLength(0);
			}
		});

		it('should have correct default sheet configuration', () => {
			expect(DEFAULT_SHEET_DATA).toBeDefined();
			expect(DEFAULT_SHEET_DATA.CT4).toBeDefined();
			expect(DEFAULT_SHEET_DATA.CT4.fieldColumn[Field.Class]).toBe('D');
			expect(DEFAULT_SHEET_DATA.CT4.fieldColumn[Field.DayOfWeek]).toBe('G');
			expect(DEFAULT_SHEET_DATA.CT4.fieldColumn[Field.Session]).toBe('H');
		});

		it('should validate field mappings', () => {
			const sheetData = DEFAULT_SHEET_DATA.CT4;

			// Check all required fields are mapped
			expect(sheetData.fieldColumn[Field.Class]).toBeDefined();
			expect(sheetData.fieldColumn[Field.DayOfWeek]).toBeDefined();
			expect(sheetData.fieldColumn[Field.Session]).toBeDefined();
			expect(sheetData.fieldColumn[Field.StartDate]).toBeDefined();
			expect(sheetData.fieldColumn[Field.EndDate]).toBeDefined();
			expect(sheetData.fieldColumn[Field.Teacher]).toBeDefined();
		});
	});
});
