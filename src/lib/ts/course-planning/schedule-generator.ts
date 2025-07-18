// Schedule Generation Logic - Ported and adapted from tin-chi-master
import {
	AutoMode,
	JSONResultData,
	Field,
	SESSION_CONSTANTS,
	CalendarTableData,
	CalendarTableItem,
	MajorSelectedSubjects,
	ScheduleWorkerMessage,
	ScheduleWorkerResponse
} from '@/types/course-planning';

// Date utility functions
export const numToDate = (n: number): Date =>
	new Date(((n / 10000) | 0) + 2000, (((n / 100) | 0) % 100) - 1, n % 100);

export const dateToNum = (d: Date): number =>
	(d.getFullYear() % 100) * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

export const getTotalDaysBetweenDates = (startDate: Date, endDate: Date) =>
	(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) | 0;

// Session shift helper
export function getSessionShift(session: number): 'morning' | 'afternoon' | 'evening' {
	if (session >= SESSION_CONSTANTS.START_MORNING_SESSION && session <= SESSION_CONSTANTS.END_MORNING_SESSION)
		return 'morning';
	if (session >= SESSION_CONSTANTS.START_AFTERNOON_SESSION && session <= SESSION_CONSTANTS.END_AFTERNOON_SESSION)
		return 'afternoon';
	return 'evening';
}

// Generate calendar table data for display
export function generateCalendarTableData(
	calendar: JSONResultData,
	selectedClasses: MajorSelectedSubjects
): CalendarTableData {
	const minDate = numToDate(calendar.minDate);
	const maxDate = numToDate(calendar.maxDate);
	const totalDays = getTotalDaysBetweenDates(minDate, maxDate);

	const calendarTableData: CalendarTableItem[][][] = new Array(totalDays + 1)
		.fill(null)
		.map(() => []);

	let totalConflictedSessions = 0;

	for (const majorKey of Object.keys(selectedClasses)) {
		for (const subjectName of Object.keys(selectedClasses[majorKey])) {
			const selectedSubjectData = selectedClasses[majorKey][subjectName];
			if (!selectedSubjectData.show || !selectedSubjectData.class) continue;

			const classData = calendar.majors[majorKey][subjectName][selectedSubjectData.class];

			for (const schedule of classData.schedules) {
				let isMeetRightDayOfWeek = false;

				const startDate = numToDate(schedule[Field.StartDate]);
				const endDate = numToDate(schedule[Field.EndDate]);

				for (
					const date = new Date(startDate);
					date <= endDate;
					date.setDate(date.getDate() + (isMeetRightDayOfWeek ? 7 : 1))
				) {
					if (date.getDay() === schedule[Field.DayOfWeekStandard])
						isMeetRightDayOfWeek = true;
					else continue;

					const dateTableData =
						calendarTableData[getTotalDaysBetweenDates(minDate, date)];

					let isAdded = false;

					for (const row of dateTableData) {
						let isConflicted = false;

						for (const item of row) {
							if (
								item.startSession <= schedule[Field.EndSession] &&
								item.endSession >= schedule[Field.StartSession]
							) {
								isConflicted = true;
								totalConflictedSessions +=
									Math.min(item.endSession, schedule[Field.EndSession]) -
									Math.max(item.startSession, schedule[Field.StartSession]) +
									1;
								break;
							}
						}

						if (isConflicted) continue;

						row.push({
							startSession: schedule[Field.StartSession],
							endSession: schedule[Field.EndSession],
							subjectName,
							classCode: selectedSubjectData.class,
						});
						isAdded = true;
						break;
					}

					if (!isAdded) {
						dateTableData.push([
							{
								startSession: schedule[Field.StartSession],
								endSession: schedule[Field.EndSession],
								subjectName,
								classCode: selectedSubjectData.class,
							},
						]);
					}
				}
			}
		}
	}

	return {
		data: calendarTableData,
		totalConflictedSessions,
	};
}

// Core schedule generation function
export function generateCombinationOfSubjects(params: {
	calendar: JSONResultData;
	selectedSubjects: [string, string][]; // [majorKey, subjectName]
	auto: AutoMode;
	autoTh: number;
}): ScheduleWorkerResponse {
	const { calendar, selectedSubjects, auto, autoTh } = params;

	const classes: [string, string, string][][] = []; // [majorKey, subjectKey, classCode][numClasses][numSubjects]
	const timeGrid: [number, number, number, number][][][] = []; // [startDate, endDate, dayOfWeek, sessionBitmask][numSchedules][numClasses][numSubjects]
	const totalSessionsInShift: number[][] = []; // Total sessions in auto shift [numClasses][numSubjects]

	const autoData = [
		['refer-non-overlap-morning', SESSION_CONSTANTS.START_MORNING_SESSION, SESSION_CONSTANTS.END_MORNING_SESSION],
		['refer-non-overlap-afternoon', SESSION_CONSTANTS.START_AFTERNOON_SESSION, SESSION_CONSTANTS.END_AFTERNOON_SESSION],
		['refer-non-overlap-evening', SESSION_CONSTANTS.START_EVENING_SESSION, SESSION_CONSTANTS.END_EVENING_SESSION],
	].find((item) => item[0] === auto) as [string, number, number];

	const aDayInMilliseconds = 24 * 60 * 60 * 1000;

	selectedSubjects.forEach(([majorKey, subjectKey]) => {
		const subjectData = calendar.majors[majorKey][subjectKey];
		const subjectClasses: [string, string, string][] = [];
		const subjectTimeGrid: [number, number, number, number][][] = [];
		const subjectTotalSessionsInShift: number[] = [];

		Object.entries(subjectData).forEach(([classCode, classData]) => {
			const classScheduleGrid: [number, number, number, number][] = [];
			let totalShiftSession = 0;

			for (const schedule of classData.schedules) {
				const classScheduleGridAtI: [number, number, number, number] = [
					numToDate(schedule[Field.StartDate]).getTime(),
					numToDate(schedule[Field.EndDate]).getTime() + aDayInMilliseconds - 1,
					schedule[Field.DayOfWeekStandard],
					((1 << (schedule[Field.EndSession] - schedule[Field.StartSession] + 1)) - 1) <<
						(SESSION_CONSTANTS.MAX_SESSION - SESSION_CONSTANTS.MIN_SESSION + 1 - schedule[Field.EndSession]),
				];

				// Calculate weeks between start and end date
				const [startDate, endDate] = classScheduleGridAtI;
				const totalWeeks = (endDate + 1 - startDate) / (aDayInMilliseconds * 7);

				classScheduleGrid.push(classScheduleGridAtI);

				// Calculate sessions in shift
				if (
					autoData &&
					schedule[Field.StartSession] <= autoData[2] &&
					schedule[Field.EndSession] >= autoData[1]
				) {
					totalShiftSession +=
						(Math.min(autoData[2], schedule[Field.EndSession]) -
							Math.max(autoData[1], schedule[Field.StartSession]) +
							1) *
						totalWeeks;
				}
			}

			subjectTimeGrid.push(classScheduleGrid);
			subjectClasses.push([majorKey, subjectKey, classCode]);
			subjectTotalSessionsInShift.push(totalShiftSession);
		});

		classes.push(subjectClasses);
		timeGrid.push(subjectTimeGrid);
		totalSessionsInShift.push(subjectTotalSessionsInShift);
	});

	const combinations: number[][] = [];
	const threshold = 12; // Maximum overlapping sessions allowed

	function countBit1(n: number): number {
		let count = 0;
		while (n > 0) {
			count += n & 1;
			n >>= 1;
		}
		return count;
	}

	// Calculate overlap between two classes
	function calculateOverlapBetween2Classes(
		c1: [number, number, number, number][],
		c2: [number, number, number, number][]
	): number {
		if (c1.length === 0 || c2.length === 0) return 0;

		// Check if time ranges don't overlap
		if (c1[c1.length - 1][1] < c2[0][0] || c2[c2.length - 1][1] < c1[0][0])
			return 0;

		let overlap = 0;

		// Check if time ranges overlap and same day of week
		for (const [startDate1, endDate1, dayOfWeek1, timeGrid1] of c1) {
			for (const [startDate2, endDate2, dayOfWeek2, timeGrid2] of c2) {
				if (
					startDate1 <= endDate2 &&
					endDate1 >= startDate2 &&
					dayOfWeek1 === dayOfWeek2
				) {
					// Calculate overlap using bitmask
					const _overlap = timeGrid1 & timeGrid2;
					// Calculate total weeks of overlap
					const totalWeeks =
						(Math.min(endDate1, endDate2) -
							Math.max(startDate1, startDate2) +
							aDayInMilliseconds) /
						(aDayInMilliseconds * 7);
					// If overlap exists, count bits and add to total
					if (_overlap > 0) overlap += countBit1(_overlap) * totalWeeks;
				}
			}
		}

		return overlap;
	}

	// Generate combinations
	function generateCombination(current: number[], index: number, overlap: number) {
		// If all subjects selected, add combination
		if (index === selectedSubjects.length) {
			combinations.push([overlap, ...current]);
			return;
		}

		const classesData = classes[index];
		for (let i = 0; i < classesData.length; i++) {
			let newOverlap = overlap;
			const currentClassTimeGrid = timeGrid[index][i];

			// Calculate overlapping sessions when adding this class
			for (let j = 0; j < index; j++) {
				newOverlap += calculateOverlapBetween2Classes(
					timeGrid[j][current[j]],
					currentClassTimeGrid
				);

				// Skip if overlap exceeds threshold
				if (newOverlap > threshold) break;
			}

			// Skip if overlap exceeds threshold
			if (newOverlap > threshold) continue;

			current[index] = i;
			generateCombination(current, index + 1, newOverlap);
		}
	}

	const start = performance.now();
	generateCombination(new Array(selectedSubjects.length).fill(0), 0, 0);

	console.log('Generate combinations time:', performance.now() - start);
	console.log('Total combinations:', combinations.length);

	// Sort combinations by overlap and preference
	const combinationsWithOverlapSorted = combinations.sort((a, b) => {
		const diff = a[0] - b[0];
		if (diff !== 0 || !autoData) return diff;

		return (
			b.slice(1).reduce((acc, cur, i) => acc + totalSessionsInShift[i][cur], 0) -
			a.slice(1).reduce((acc, cur, i) => acc + totalSessionsInShift[i][cur], 0)
		);
	});

	if (combinationsWithOverlapSorted.length) {
		// Find optimal combination based on autoTh
		const bestCombinationIndex = autoTh % combinationsWithOverlapSorted.length;
		const bestCombination = combinationsWithOverlapSorted[bestCombinationIndex].slice(1);

		return {
			data: {
				selectedClasses: bestCombination.map((classIndex, i) => classes[i][classIndex]),
				totalConflictedSessions: combinationsWithOverlapSorted[bestCombinationIndex][0],
			},
		};
	}

	return {
		data: {
			selectedClasses: [],
			totalConflictedSessions: 0,
		},
	};
}
