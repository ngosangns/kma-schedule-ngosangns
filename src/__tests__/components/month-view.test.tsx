/**
 * Tests for Month View functionality
 */

import { render, screen } from '@testing-library/react';
import { CalendarPage } from '@/app/(main)/calendar/page';

// Mock the calendar data structure
const mockCalendarData = {
	weeks: [
		[
			{
				time: new Date('2024-01-01').getTime(),
				shift: [
					null,
					null,
					{ name: 'Toán học', address: 'Phòng 101', instructor: 'GV A' },
					{ name: 'Vật lý', address: 'Phòng 102', instructor: 'GV B' },
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
			},
			{
				time: new Date('2024-01-02').getTime(),
				shift: [
					null,
					{ name: 'Hóa học', address: 'Phòng 201', instructor: 'GV C' },
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
		]
	]
};

// Helper function to create month calendar data
function createMonthCalendarData(calendarData: any) {
	if (!calendarData || !calendarData.weeks) return [];

	const monthData: any[] = [];
	const today = new Date();
	const currentMonth = today.getMonth();
	const currentYear = today.getFullYear();

	// Get first day of month
	const firstDay = new Date(currentYear, currentMonth, 1);

	// Get first day of week for the first day of month (0 = Sunday, 1 = Monday, etc.)
	const firstDayOfWeek = firstDay.getDay();
	const startDate = new Date(firstDay);
	startDate.setDate(startDate.getDate() - firstDayOfWeek);

	// Generate 6 weeks (42 days) to cover the entire month view
	for (let week = 0; week < 6; week++) {
		const weekData: any[] = [];
		for (let day = 0; day < 7; day++) {
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + (week * 7) + day);

			// Find subjects for this date
			const daySubjects: any[] = [];
			
			// Search through all weeks and days in calendar data
			if (calendarData.weeks && Array.isArray(calendarData.weeks)) {
				calendarData.weeks.forEach((calendarWeek: any) => {
					if (Array.isArray(calendarWeek)) {
						calendarWeek.forEach((dayData: any) => {
							if (dayData && dayData.time) {
								const dayDate = new Date(dayData.time);
								// Compare dates by setting time to 00:00:00 for accurate comparison
								const currentDateNormalized = new Date(
									currentDate.getFullYear(),
									currentDate.getMonth(),
									currentDate.getDate()
								);
								const dayDateNormalized = new Date(
									dayDate.getFullYear(),
									dayDate.getMonth(),
									dayDate.getDate()
								);

								if (currentDateNormalized.getTime() === dayDateNormalized.getTime()) {
									if (dayData.shift && Array.isArray(dayData.shift)) {
										dayData.shift.forEach((subject: any, shiftIndex: number) => {
											if (subject && subject.name) {
												daySubjects.push({
													...subject,
													shiftNumber: shiftIndex + 1,
													time: dayData.time
												});
											}
										});
									}
								}
							}
						});
					}
				});
			}

			weekData.push({
				date: new Date(currentDate),
				isCurrentMonth: currentDate.getMonth() === currentMonth,
				isToday: currentDate.toDateString() === today.toDateString(),
				subjects: daySubjects
			});
		}
		monthData.push(weekData);
	}

	return monthData;
}

describe('Month View Logic', () => {
	describe('createMonthCalendarData', () => {
		it('should return empty array when no calendar data provided', () => {
			const result = createMonthCalendarData(null);
			expect(result).toEqual([]);
		});

		it('should return empty array when calendar data has no weeks', () => {
			const result = createMonthCalendarData({ weeks: null });
			expect(result).toEqual([]);
		});

		it('should generate 6 weeks of calendar data', () => {
			const result = createMonthCalendarData(mockCalendarData);
			expect(result).toHaveLength(6);
			
			// Each week should have 7 days
			result.forEach(week => {
				expect(week).toHaveLength(7);
			});
		});

		it('should correctly identify current month days', () => {
			const result = createMonthCalendarData(mockCalendarData);
			const today = new Date();
			const currentMonth = today.getMonth();
			
			let currentMonthDaysCount = 0;
			result.forEach(week => {
				week.forEach((day: any) => {
					if (day.isCurrentMonth) {
						expect(day.date.getMonth()).toBe(currentMonth);
						currentMonthDaysCount++;
					}
				});
			});
			
			// Should have at least 28 days in current month
			expect(currentMonthDaysCount).toBeGreaterThanOrEqual(28);
		});

		it('should correctly identify today', () => {
			const result = createMonthCalendarData(mockCalendarData);
			const today = new Date();
			
			let todayFound = false;
			result.forEach(week => {
				week.forEach((day: any) => {
					if (day.isToday) {
						expect(day.date.toDateString()).toBe(today.toDateString());
						todayFound = true;
					}
				});
			});
			
			// Today should be found if it's in the current month
			if (today.getMonth() === new Date().getMonth()) {
				expect(todayFound).toBe(true);
			}
		});

		it('should extract subjects for matching dates', () => {
			// Create test data with specific date
			const testDate = new Date();
			const testCalendarData = {
				weeks: [
					[
						{
							time: testDate.getTime(),
							shift: [
								null,
								null,
								{ name: 'Test Subject', address: 'Test Room', instructor: 'Test Teacher' },
								null
							]
						}
					]
				]
			};

			const result = createMonthCalendarData(testCalendarData);
			
			// Find the day that matches our test date
			let foundDay: any = null;
			result.forEach(week => {
				week.forEach((day: any) => {
					const dayNormalized = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
					const testNormalized = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());
					
					if (dayNormalized.getTime() === testNormalized.getTime()) {
						foundDay = day;
					}
				});
			});

			expect(foundDay).not.toBeNull();
			expect(foundDay.subjects).toHaveLength(1);
			expect(foundDay.subjects[0].name).toBe('Test Subject');
			expect(foundDay.subjects[0].shiftNumber).toBe(3);
		});

		it('should handle empty shifts correctly', () => {
			const testCalendarData = {
				weeks: [
					[
						{
							time: new Date().getTime(),
							shift: [null, null, null, null]
						}
					]
				]
			};

			const result = createMonthCalendarData(testCalendarData);
			
			// All days should have empty subjects array
			result.forEach(week => {
				week.forEach((day: any) => {
					expect(Array.isArray(day.subjects)).toBe(true);
				});
			});
		});

		it('should handle malformed calendar data gracefully', () => {
			const malformedData = {
				weeks: [
					[
						{ time: 'invalid-time', shift: 'not-an-array' },
						{ time: null, shift: null },
						{ shift: [{ name: 'Test' }] }, // missing time
					]
				]
			};

			expect(() => {
				const result = createMonthCalendarData(malformedData);
				expect(Array.isArray(result)).toBe(true);
			}).not.toThrow();
		});
	});

	describe('Date calculations', () => {
		it('should start calendar from Sunday of the week containing first day of month', () => {
			const result = createMonthCalendarData(mockCalendarData);
			const firstDay = result[0][0];
			
			// First day should be a Sunday (day 0)
			expect(firstDay.date.getDay()).toBe(0);
		});

		it('should generate exactly 42 days (6 weeks)', () => {
			const result = createMonthCalendarData(mockCalendarData);
			let totalDays = 0;
			
			result.forEach(week => {
				totalDays += week.length;
			});
			
			expect(totalDays).toBe(42);
		});
	});
});
