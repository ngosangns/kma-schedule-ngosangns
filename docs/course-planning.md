# Course Planning (Lập lịch tín chỉ)

## Overview

The Course Planning feature allows students to create optimal schedules from Excel files containing course information. This feature was integrated from the tin-chi-master Angular application into the existing Next.js KMA Schedule application.

## Features

### 1. Excel File Processing

- **File Upload**: Drag-and-drop or click to upload Excel files (.xlsx, .xls)
- **Multi-sheet Support**: Processes multiple sheets representing different majors
- **Data Validation**: Validates Excel structure and provides error feedback
- **Merged Cell Handling**: Properly handles merged cells in Excel files

### 2. Subject Selection

- **Major-based Organization**: Subjects organized by major/specialization
- **Interactive Selection**: Checkbox-based selection with expand/collapse functionality
- **Class Options**: Multiple class options per subject with teacher and schedule information
- **Bulk Selection**: Select all subjects in a major at once

### 3. Automatic Schedule Generation

- **Conflict Detection**: Identifies and minimizes schedule conflicts
- **Optimization Modes**:
  - General optimization (minimal conflicts)
  - Morning preference (sessions 1-6)
  - Afternoon preference (sessions 7-12)
  - Evening preference (sessions 13-16)
- **Multiple Solutions**: Generate alternative schedule solutions
- **Web Worker Processing**: Heavy computations run in background workers

### 4. Calendar Visualization

- **Weekly View**: Display generated schedules in weekly calendar format
- **Color Coding**: Different colors for different subjects
- **Conflict Highlighting**: Visual indicators for schedule conflicts
- **Session Details**: Shows session times, class codes, and teachers

## Technical Architecture

### Components Structure

```
src/
├── components/course-planning/
│   ├── FileUpload.tsx           # Excel file upload interface
│   ├── SubjectSelection.tsx     # Subject and class selection
│   ├── ScheduleControls.tsx     # Schedule generation controls
│   └── ScheduleCalendar.tsx     # Calendar display for generated schedules
├── contexts/
│   └── CoursePlanningContext.tsx # State management for course planning
├── lib/ts/course-planning/
│   ├── excel-processor.ts       # Excel file processing utilities
│   └── schedule-generator.ts    # Schedule generation algorithms
├── workers/
│   └── schedule-worker.ts       # Web worker for schedule optimization
├── types/
│   └── course-planning.ts       # TypeScript types and interfaces
└── app/course-planning/
    └── page.tsx                 # Main course planning page
```

### Data Flow

1. **File Upload** → Excel processing → JSON data structure
2. **Subject Selection** → User selections → State management
3. **Schedule Generation** → Web worker processing → Optimized schedule
4. **Calendar Display** → Schedule visualization → User interface

### State Management

The course planning feature uses a dedicated React Context (`CoursePlanningContext`) that manages:

- Calendar data from Excel files
- Subject and class selections
- Schedule generation state
- Loading and error states

## Usage Guide

### For Users

1. **Upload Excel File**
   - Navigate to "Lập lịch tín chỉ" in the main navigation
   - Upload an Excel file containing course information
   - Wait for processing to complete

2. **Select Subjects**
   - Browse subjects organized by major
   - Check subjects you want to register for
   - Choose specific classes for each subject (optional)

3. **Generate Schedule**
   - Choose optimization mode based on your preference
   - Click "Tạo lịch tự động" to generate optimal schedule
   - After first generation, the button changes to "Giải pháp khác" to find alternative solutions
   - Solution number is displayed to track which alternative you're viewing

4. **View Schedule**
   - Review the generated schedule in calendar format
   - Check for any conflicts (highlighted in red)
   - Print or save the schedule as needed

### For Developers

#### Adding New Optimization Modes

```typescript
// Add to AutoMode type in course-planning.ts
export type AutoMode =
  | 'refer-non-overlap'
  | 'refer-non-overlap-morning'
  | 'refer-non-overlap-afternoon'
  | 'refer-non-overlap-evening'
  | 'your-new-mode'; // Add here

// Update AUTO_MODES array in ScheduleControls.tsx
const AUTO_MODES = [
  // ... existing modes
  {
    value: 'your-new-mode',
    label: 'Your Mode Label',
    description: 'Description of your mode',
    icon: <YourIcon className="h-4 w-4" />,
  },
];
```

#### Customizing Excel Processing

```typescript
// Modify DEFAULT_SHEET_DATA in excel-processor.ts
export const CUSTOM_SHEET_DATA: SheetData = {
	YourSheetName: {
		startRow: 5,
		endRow: 200,
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
```

## Excel File Format

### Required Structure

- **Sheet Names**: Each sheet represents a major (e.g., "CT4", "AT17CT5DT4")
- **Data Rows**: Starting from row 5 (configurable)
- **Required Columns**:
  - Column D: Class name and code
  - Column G: Day of week (2-8, CN for Sunday)
  - Column H: Session range (e.g., "1->3")
  - Column J: Start date (DD/MM/YYYY)
  - Column K: End date (DD/MM/YYYY)
  - Column L: Teacher name

### Example Data Format

```
| D (Class)                    | G (Day) | H (Session) | J (Start)  | K (End)    | L (Teacher)     |
|------------------------------|---------|-------------|------------|------------|-----------------|
| Toán cao cấp A1 (CT4-01)     | 2       | 1->3        | 01/09/2024 | 15/12/2024 | Nguyễn Văn A    |
| Lập trình C (CT4-02.01)      | 3       | 7->9        | 01/09/2024 | 15/12/2024 | Trần Thị B      |
```

## Testing

### Unit Tests

- Excel processing functions
- Schedule generation algorithms
- Date and session utilities
- State management logic

### Integration Tests

- File upload and processing flow
- Subject selection and state updates
- Schedule generation with real data
- Calendar display functionality

### Running Tests

```bash
# Run all course planning tests
yarn test --testPathPattern="course-planning"

# Run specific test file
yarn test src/__tests__/course-planning/excel-processor.test.ts
```

## Performance Considerations

### Web Workers

Heavy schedule generation computations run in Web Workers to prevent UI blocking:

- Combination generation for multiple subjects
- Conflict detection algorithms
- Schedule optimization calculations

### Memory Management

- Large Excel files are processed in chunks
- Unused data structures are cleaned up after processing
- State updates are batched to minimize re-renders

### Optimization Tips

- Limit the number of subjects selected simultaneously
- Use specific class selections to reduce computation complexity
- Consider breaking large Excel files into smaller sheets

## Troubleshooting

### Common Issues

1. **Excel File Not Processing**
   - Check file format (.xlsx or .xls)
   - Verify sheet names match expected format
   - Ensure data starts from correct row (default: row 5)

2. **No Schedule Generated**
   - Verify subjects are selected
   - Check for data conflicts in Excel file
   - Try different optimization modes

3. **Performance Issues**
   - Reduce number of selected subjects
   - Use Web Worker for heavy computations
   - Check browser console for errors

### Error Messages

- "Sheet not found": Excel sheet name doesn't match configuration
- "No valid data": Excel file structure is incorrect
- "Generation failed": Too many conflicts or invalid selections

## Future Enhancements

### Planned Features

- Export generated schedules to various formats (PDF, ICS)
- Save and load schedule configurations
- Advanced filtering and search capabilities
- Integration with university course databases
- Mobile-responsive design improvements

### API Integration

- Direct integration with university course management systems
- Real-time course availability updates
- Automatic conflict resolution suggestions
- Student preference learning algorithms

## Contributing

When contributing to the course planning feature:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new functionality
3. Update documentation for any API changes
4. Consider performance implications of new features
5. Test with various Excel file formats and sizes

## Dependencies

### Core Dependencies

- `xlsx`: Excel file processing
- `react-dropzone`: File upload interface
- `@radix-ui/react-*`: UI components

### Development Dependencies

- `@types/node`: TypeScript support
- `jest`: Testing framework
- `@testing-library/react`: Component testing

## License

This feature is part of the KMA Schedule application and follows the same licensing terms.
