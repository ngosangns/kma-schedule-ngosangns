# Grade Management System Documentation

## Overview

The Grade Management System is a comprehensive feature for importing, processing, analyzing, and exporting academic grade data. It supports both CSV and JSON file formats and provides detailed statistics and validation.

## Features

### 📊 Core Functionality

- **Data Import**: Support for CSV and JSON file formats
- **Manual Entry**: Form-based data entry with real-time validation
- **Grade Calculation**: Automatic calculation of ĐQT, KTHP, and GPA
- **Statistics Dashboard**: Comprehensive analytics and visualizations
- **Data Validation**: Real-time error detection and warnings
- **Export Capabilities**: Export to CSV/JSON with customizable options

### 🧮 Grade Calculation Formulas

#### Process Grade (ĐQT)

```
ĐQT = 0.3 × TP2 + 0.7 × TP1
```

- TP1: Midterm exam score (Điểm giữa kỳ)
- TP2: Attendance/participation score (Điểm chuyên cần)

#### Final Grade (KTHP)

```
KTHP = 0.3 × ĐQT + 0.7 × Thi
```

- ĐQT: Process grade
- Thi: Final exam score

#### Grade Conversion Table

| KTHP (10-point) | 4-point Scale | Xếp loại   |
| --------------- | ------------- | ---------- |
| 9.0 – 10        | 4.0           | Xuất sắc   |
| 8.5 – 8.9       | 3.8           | Xuất sắc   |
| 7.8 – 8.4       | 3.5           | Giỏi       |
| 7.0 – 7.7       | 3.0           | Giỏi       |
| 6.3 – 6.9       | 2.5           | Khá        |
| 5.5 – 6.2       | 2.0           | Khá        |
| 4.8 – 5.4       | 1.5           | Trung bình |
| 4.0 – 4.7       | 1.0           | Trung bình |
| < 4.0           | 0.0           | Yếu/Kém    |

#### GPA Calculation

```
GPA (10-point) = Σ(KTHP × Credits) / Σ(Credits)
GPA (4-point) = Σ(Grade4 × Credits) / Σ(Credits)
```

## Data Structure

### Required Fields

| Field   | Type        | Description             | Example           |
| ------- | ----------- | ----------------------- | ----------------- |
| Tên môn | string      | Subject name            | "Toán cao cấp A1" |
| Kỳ      | number      | Semester number         | 1, 2, 3...        |
| Tín     | number      | Credit hours            | 3, 4, 5...        |
| TP1     | number/null | Midterm score (0-10)    | 8.5               |
| TP2     | number/null | Attendance score (0-10) | 9.0               |
| Thi     | number/null | Final exam score (0-10) | 7.5               |

### Optional Fields (Auto-calculated)

| Field     | Type        | Description         |
| --------- | ----------- | ------------------- |
| ĐQT       | number/null | Process grade       |
| KTHP      | number/null | Final grade         |
| KTHP hệ 4 | number/null | 4-point scale grade |
| Điểm chữ  | string/null | Letter grade        |

## File Formats

### CSV Format

```csv
Tên môn,Kỳ,Tín,TP1,TP2,Thi
Toán cao cấp A1,1,4,8.5,9.0,7.5
Vật lý đại cương,1,3,7.0,8.5,6.5
Hóa học đại cương,1,3,9.0,8.0,8.5
```

### JSON Format

```json
[
	{
		"Tên môn": "Toán cao cấp A1",
		"Kỳ": 1,
		"Tín": 4,
		"TP1": 8.5,
		"TP2": 9.0,
		"Thi": 7.5
	},
	{
		"Tên môn": "Vật lý đại cương",
		"Kỳ": 1,
		"Tín": 3,
		"TP1": 7.0,
		"TP2": 8.5,
		"Thi": 6.5
	}
]
```

## Component Architecture

### Core Components

- **`FileImport`**: Drag-and-drop file upload with validation
- **`SampleDataGenerator`**: Downloadable sample files
- **`GradeTable`**: Desktop table view with sorting/filtering
- **`StatisticsDashboard`**: Analytics and charts
- **`DataExport`**: Export functionality

### Utility Functions

- **`calculations.ts`**: Grade calculation logic
- **`import-export.ts`**: File processing and export
- **`validation.ts`**: Data validation and filtering

## Usage Examples

### Importing Data

```typescript
import { parseCSV, parseJSON } from '@/lib/ts/grades/import-export';

// Parse CSV
const csvResult = await parseCSV(csvContent);
if (csvResult.success) {
	console.log(`Imported ${csvResult.validRecords} records`);
}

// Parse JSON
const jsonResult = parseJSON(jsonContent);
if (jsonResult.success) {
	console.log(`Imported ${jsonResult.validRecords} records`);
}
```

### Calculating Grades

```typescript
import { processGradeRecord, calculateOverallStats } from '@/lib/ts/grades/calculations';

// Process single grade
const grade = processGradeRecord({
	tenMon: 'Toán cao cấp A1',
	ky: 1,
	tin: 4,
	tp1: 8.5,
	tp2: 9.0,
	thi: 7.5
});

// Calculate statistics
const stats = calculateOverallStats(grades);
console.log(`Overall GPA: ${stats.overallGPA10}`);
```

### Exporting Data

```typescript
import { exportToCSV, exportToJSON, downloadFile } from '@/lib/ts/grades/import-export';

// Export to CSV
const csvContent = exportToCSV(grades, {
	format: 'csv',
	includeCalculated: true,
	includeSemesterStats: false,
	includeOverallStats: false
});

// Export to JSON with statistics
const jsonContent = exportToJSON(grades, statistics, {
	format: 'json',
	includeCalculated: true,
	includeSemesterStats: true,
	includeOverallStats: true
});

// Download file
downloadFile(csvContent, 'grades.csv', 'text/csv');
```

## Validation Rules

### Required Field Validation

- **Subject Name**: Must not be empty
- **Semester**: Must be between 1-20
- **Credits**: Must be between 0-10
- **Grades**: Must be between 0-10 (if provided)

### Data Consistency Checks

- **ĐQT Calculation**: Warns if provided ĐQT doesn't match calculated value
- **KTHP Calculation**: Warns if provided KTHP doesn't match calculated value
- **Duplicate Detection**: Identifies duplicate subjects in same semester

### GPA Exclusions

Subjects automatically excluded from GPA calculation:

- Giáo dục thể chất (Physical Education)
- Giáo dục quốc phòng (National Defense Education)
- Giáo dục an ninh (Security Education)
- Thể dục (Physical Training)
- Quân sự (Military Training)

## Mobile Responsiveness

The system automatically adapts to different screen sizes:

- **Desktop (≥768px)**: Full table view with all features
- **Mobile (<768px)**: Card-based layout grouped by semester
- **Touch-friendly**: Optimized for mobile interaction

## Local Storage

Grade data is automatically saved to browser localStorage:

- **Key**: `grades-data`
- **Format**: JSON array of GradeRecord objects
- **Auto-save**: Triggered on any data change
- **Auto-load**: Restored on page refresh

## Error Handling

### Import Errors

- **File Format**: Invalid CSV/JSON structure
- **Data Validation**: Missing required fields, invalid values
- **Encoding**: UTF-8 encoding issues

### Calculation Errors

- **Missing Data**: Null values in calculations
- **Invalid Ranges**: Grades outside 0-10 range
- **Type Errors**: Non-numeric values in numeric fields

### Export Errors

- **Empty Data**: No records to export
- **File Generation**: Browser compatibility issues
- **Download**: File system access problems

## Performance Considerations

- **Large Datasets**: Optimized for up to 1000+ grade records
- **Real-time Calculations**: Debounced for performance
- **Memory Usage**: Efficient data structures
- **Rendering**: Virtualized tables for large datasets

## Testing

The system includes comprehensive tests:

- **Unit Tests**: Calculation functions, validation logic
- **Integration Tests**: Import/export workflows
- **Component Tests**: UI component behavior
- **E2E Tests**: Complete user workflows

Run tests with:

```bash
npm test src/__tests__/grades/
```

## Future Enhancements

- **Transcript Generation**: PDF transcript export
- **Grade Trends**: Historical GPA tracking
- **Semester Comparison**: Side-by-side analysis
- **Goal Setting**: Target GPA calculations
- **Data Backup**: Cloud storage integration
