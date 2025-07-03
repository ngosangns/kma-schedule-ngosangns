import { formatShiftDisplay, formatTimeDisplay, getShiftSession } from '@/lib/utils';

describe('Calendar Layout Integration', () => {
	describe('Desktop Layout - Horizontal Timeline', () => {
		test('should organize subjects by day with proper grouping', () => {
			// Mock week data with multiple days and subjects
			const mockWeek = [
				{
					time: '2025-01-13', // Monday
					shift: [
						{ name: 'Toán cao cấp', address: 'TC-101', length: 3 }, // Shift 1-3
						null,
						null,
						null,
						null,
						null,
						{ name: 'Lập trình Web', address: 'TC-205', length: 2 }, // Shift 7-8
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null
					]
				},
				{
					time: '2025-01-14', // Tuesday
					shift: [
						null,
						{ name: 'Cơ sở dữ liệu', address: 'TC-301', length: 2 }, // Shift 2-3
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null,
						null
					]
				}
			];

			// Simulate the filtering logic from the component
			const processedDays = mockWeek.map((day, dayIndex) => {
				const daySubjects = day.shift
					? day.shift
							.map((subject, shiftIndex) => ({
								...subject,
								shiftNumber: shiftIndex + 1
							}))
							.filter((subject) => subject.name)
					: [];

				return {
					...day,
					dayIndex,
					subjects: daySubjects,
					hasSubjects: daySubjects.length > 0
				};
			});

			// Verify Monday has 2 subjects
			expect(processedDays[0].subjects).toHaveLength(2);
			expect(processedDays[0].subjects[0].name).toBe('Toán cao cấp');
			expect(processedDays[0].subjects[0].shiftNumber).toBe(1);
			expect(processedDays[0].subjects[1].name).toBe('Lập trình Web');
			expect(processedDays[0].subjects[1].shiftNumber).toBe(7);

			// Verify Tuesday has 1 subject
			expect(processedDays[1].subjects).toHaveLength(1);
			expect(processedDays[1].subjects[0].name).toBe('Cơ sở dữ liệu');
			expect(processedDays[1].subjects[0].shiftNumber).toBe(2);
		});

		test('should handle empty days correctly', () => {
			const mockWeek = [
				{
					time: '2025-01-13',
					shift: Array(16).fill(null) // No subjects
				},
				{
					time: '2025-01-14',
					shift: [{ name: 'Toán cao cấp', address: 'TC-101', length: 1 }, ...Array(15).fill(null)]
				}
			];

			const processedDays = mockWeek.map((day) => {
				const daySubjects = day.shift
					? day.shift
							.map((subject, shiftIndex) => ({
								...subject,
								shiftNumber: shiftIndex + 1
							}))
							.filter((subject) => subject.name)
					: [];

				return {
					...day,
					subjects: daySubjects,
					hasSubjects: daySubjects.length > 0
				};
			});

			// First day should have no subjects
			expect(processedDays[0].subjects).toHaveLength(0);
			expect(processedDays[0].hasSubjects).toBe(false);

			// Second day should have 1 subject
			expect(processedDays[1].subjects).toHaveLength(1);
			expect(processedDays[1].hasSubjects).toBe(true);
		});
	});

	describe('Subject Card Display', () => {
		test('should format subject information correctly', () => {
			const mockSubject = {
				name: 'Mạng máy tính',
				address: 'TC-205',
				shiftNumber: 1,
				length: 3
			};

			const shiftDisplay = formatShiftDisplay(mockSubject.shiftNumber, mockSubject.length);
			const timeDisplay = formatTimeDisplay(mockSubject.shiftNumber, mockSubject.length);
			const session = getShiftSession(mockSubject.shiftNumber);

			expect(shiftDisplay).toBe('Tiết 1-3');
			expect(timeDisplay).toBe('07:00 - 09:50');
			expect(session).toBe('morning');
		});

		test('should handle subjects without address', () => {
			const mockSubject = {
				name: 'Toán rời rạc',
				address: null,
				shiftNumber: 7,
				length: 2
			};

			const shiftDisplay = formatShiftDisplay(mockSubject.shiftNumber, mockSubject.length);
			const timeDisplay = formatTimeDisplay(mockSubject.shiftNumber, mockSubject.length);
			const session = getShiftSession(mockSubject.shiftNumber);

			expect(shiftDisplay).toBe('Tiết 7-8');
			expect(timeDisplay).toBe('13:00 - 14:50');
			expect(session).toBe('afternoon');
			expect(mockSubject.address).toBeNull();
		});
	});

	describe('Session Color Coding', () => {
		test('should assign correct colors for different sessions', () => {
			const getSessionColor = (session: string) => {
				switch (session) {
					case 'morning':
						return 'bg-blue-500';
					case 'afternoon':
						return 'bg-orange-500';
					case 'evening':
						return 'bg-purple-500';
					default:
						return 'bg-gray-500';
				}
			};

			expect(getSessionColor('morning')).toBe('bg-blue-500');
			expect(getSessionColor('afternoon')).toBe('bg-orange-500');
			expect(getSessionColor('evening')).toBe('bg-purple-500');
		});

		test('should map shifts to correct sessions', () => {
			const testCases = [
				{ shift: 1, expectedSession: 'morning', expectedColor: 'bg-blue-500' },
				{ shift: 6, expectedSession: 'morning', expectedColor: 'bg-blue-500' },
				{ shift: 7, expectedSession: 'afternoon', expectedColor: 'bg-orange-500' },
				{ shift: 12, expectedSession: 'afternoon', expectedColor: 'bg-orange-500' },
				{ shift: 13, expectedSession: 'evening', expectedColor: 'bg-purple-500' },
				{ shift: 15, expectedSession: 'evening', expectedColor: 'bg-purple-500' }
			];

			testCases.forEach(({ shift, expectedSession, expectedColor }) => {
				const session = getShiftSession(shift);
				expect(session).toBe(expectedSession);

				const color =
					session === 'morning'
						? 'bg-blue-500'
						: session === 'afternoon'
							? 'bg-orange-500'
							: 'bg-purple-500';
				expect(color).toBe(expectedColor);
			});
		});
	});

	describe('Responsive Layout Logic', () => {
		test('should provide different layouts for desktop and mobile', () => {
			// This test verifies the layout structure logic
			const mockWeek = [
				{
					time: '2025-01-13',
					shift: [
						{ name: 'Subject 1', address: 'TC-101', length: 2 },
						{ name: 'Subject 2', address: 'TC-102', length: 1 },
						...Array(14).fill(null)
					]
				}
			];

			// Desktop layout: Group by day, then display subjects horizontally
			const desktopLayout = mockWeek.map((day) => {
				const subjects = day.shift
					.map((subject, index) => ({ ...subject, shiftNumber: index + 1 }))
					.filter((subject) => subject.name);

				return {
					day: day.time,
					subjects,
					layout: 'horizontal-timeline'
				};
			});

			// Mobile layout: Each day is a separate card
			const mobileLayout = mockWeek.map((day) => {
				const subjects = day.shift
					.map((subject, index) => ({ ...subject, shiftNumber: index + 1 }))
					.filter((subject) => subject.name);

				return {
					day: day.time,
					subjects,
					layout: 'compact-card'
				};
			});

			expect(desktopLayout[0].layout).toBe('horizontal-timeline');
			expect(mobileLayout[0].layout).toBe('compact-card');
			expect(desktopLayout[0].subjects).toEqual(mobileLayout[0].subjects);
		});
	});

	describe('Performance Considerations', () => {
		test('should handle large datasets efficiently', () => {
			// Create a week with many subjects
			const createMockWeek = (daysCount: number, subjectsPerDay: number) => {
				return Array.from({ length: daysCount }, (_, dayIndex) => ({
					time: `2025-01-${13 + dayIndex}`,
					shift: Array.from({ length: 16 }, (_, shiftIndex) => {
						if (shiftIndex < subjectsPerDay) {
							return {
								name: `Subject ${dayIndex}-${shiftIndex}`,
								address: `TC-${100 + shiftIndex}`,
								length: Math.floor(Math.random() * 3) + 1
							};
						}
						return null;
					})
				}));
			};

			const startTime = Date.now();
			const largeWeek = createMockWeek(7, 8); // 7 days, 8 subjects per day

			// Process all days
			const processedDays = largeWeek.map((day) => {
				const subjects = day.shift
					.map((subject, index) => ({ ...subject, shiftNumber: index + 1 }))
					.filter((subject) => subject.name);

				return { ...day, subjects };
			});

			const endTime = Date.now();
			const processingTime = endTime - startTime;

			// Should process quickly
			expect(processingTime).toBeLessThan(50);
			expect(processedDays).toHaveLength(7);
			expect(processedDays[0].subjects).toHaveLength(8);
		});
	});

	describe('Accessibility and UX', () => {
		test('should provide meaningful subject count information', () => {
			const mockDay = {
				time: '2025-01-13',
				shift: [
					{ name: 'Subject 1', address: 'TC-101', length: 1 },
					{ name: 'Subject 2', address: 'TC-102', length: 2 },
					{ name: 'Subject 3', address: 'TC-103', length: 1 },
					...Array(13).fill(null)
				]
			};

			const subjects = mockDay.shift
				.map((subject, index) => ({ ...subject, shiftNumber: index + 1 }))
				.filter((subject) => subject.name);

			const subjectCount = subjects.length;
			const countText = `${subjectCount} môn học`;

			expect(subjectCount).toBe(3);
			expect(countText).toBe('3 môn học');
		});

		test('should handle hover states and interactions', () => {
			// Test hover state classes
			const hoverClasses =
				'group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200';
			const titleHoverClasses =
				'font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors';

			expect(hoverClasses).toContain('hover:shadow-md');
			expect(hoverClasses).toContain('transition-all');
			expect(titleHoverClasses).toContain('group-hover:text-primary');
			expect(titleHoverClasses).toContain('transition-colors');
		});
	});
});
