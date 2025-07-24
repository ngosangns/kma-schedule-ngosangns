'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
	CoursePlanningState,
	JSONResultData,
	MajorSelectedSubjects,
	AutoMode,
	ScheduleWorkerMessage,
	ScheduleWorkerResponse,
	ExcelProcessingResult,
	CalendarTableData
} from '@/types/course-planning';
import { generateCalendarTableData } from '@/lib/ts/course-planning/schedule-generator';
import {
	saveCoursePlanningData,
	loadCoursePlanningData,
	clearCoursePlanningData
} from '@/lib/ts/storage';

// Action Types
type CoursePlanningAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null }
	| { type: 'SET_CALENDAR'; payload: JSONResultData }
	| { type: 'SET_SELECTED_CLASSES'; payload: MajorSelectedSubjects }
	| {
			type: 'UPDATE_SELECTED_CLASS';
			payload: { majorKey: string; subjectName: string; classCode: string | null };
	  }
	| {
			type: 'UPDATE_SHOW_SUBJECT';
			payload: { majorKey: string; subjectName: string; show: boolean };
	  }
	| { type: 'SELECT_MAJOR'; payload: { major: string; select: boolean } }
	| { type: 'SET_SELECTED_MODE'; payload: AutoMode }
	| { type: 'SET_AUTO_TH'; payload: number }
	| { type: 'SET_OLD_AUTO'; payload: AutoMode | null }
	| { type: 'RESET_STATE' };

// Initial State
const initialState: CoursePlanningState = {
	calendar: null,
	selectedClasses: {},
	selectedMode: 'refer-non-overlap',
	autoTh: -1,
	oldAuto: null,
	loading: false,
	error: null
};

// Reducer
function coursePlanningReducer(
	state: CoursePlanningState,
	action: CoursePlanningAction
): CoursePlanningState {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, loading: action.payload };

		case 'SET_ERROR':
			return { ...state, error: action.payload, loading: false };

		case 'SET_CALENDAR':
			return { ...state, calendar: action.payload, error: null };

		case 'SET_SELECTED_CLASSES':
			return { ...state, selectedClasses: action.payload };

		case 'UPDATE_SELECTED_CLASS':
			const { majorKey, subjectName, classCode } = action.payload;
			const updatedClasses = { ...state.selectedClasses };

			if (!updatedClasses[majorKey]) updatedClasses[majorKey] = {};
			if (!updatedClasses[majorKey][subjectName]) {
				updatedClasses[majorKey][subjectName] = { show: false, class: classCode };
			} else {
				updatedClasses[majorKey][subjectName].class = classCode;
			}

			return { ...state, selectedClasses: updatedClasses };

		case 'UPDATE_SHOW_SUBJECT':
			const { majorKey: showMajorKey, subjectName: showSubjectName, show } = action.payload;
			const updatedShowClasses = { ...state.selectedClasses };

			if (!updatedShowClasses[showMajorKey]) updatedShowClasses[showMajorKey] = {};
			if (!updatedShowClasses[showMajorKey][showSubjectName]) {
				updatedShowClasses[showMajorKey][showSubjectName] = { show, class: null };
			} else {
				updatedShowClasses[showMajorKey][showSubjectName].show = show;
			}

			return { ...state, selectedClasses: updatedShowClasses, autoTh: -1 };

		case 'SELECT_MAJOR':
			if (!state.calendar) return state;

			const { major, select } = action.payload;
			const allSubjectNamesOfMajor = Object.keys(state.calendar.majors[major] || {});
			const selectedClasses = { ...state.selectedClasses };

			if (!selectedClasses[major]) selectedClasses[major] = {};

			for (const subjectName of allSubjectNamesOfMajor) {
				if (!selectedClasses[major][subjectName]) {
					selectedClasses[major][subjectName] = { show: select, class: null };
				} else {
					selectedClasses[major][subjectName].show = select;
				}
			}

			return { ...state, selectedClasses, autoTh: -1 };

		case 'SET_SELECTED_MODE':
			return { ...state, selectedMode: action.payload };

		case 'SET_AUTO_TH':
			return { ...state, autoTh: action.payload };

		case 'SET_OLD_AUTO':
			return { ...state, oldAuto: action.payload };

		case 'RESET_STATE':
			return initialState;

		default:
			return state;
	}
}

// Context Interface
interface CoursePlanningContextType {
	state: CoursePlanningState;
	// Data loading
	loadCalendarData: (data: JSONResultData) => void;
	processExcelFile: (file: File, title?: string) => Promise<ExcelProcessingResult>;

	// Subject selection
	selectMajor: (major: string, select: boolean) => void;
	updateSelectedClass: (majorKey: string, subjectName: string, classCode: string | null) => void;
	updateShowSubject: (majorKey: string, subjectName: string, show: boolean) => void;

	// Schedule generation
	generateSchedule: (auto: AutoMode) => Promise<void>;
	getCalendarTableData: () => CalendarTableData | null;
	setSelectedMode: (mode: AutoMode) => void;

	// Utility
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	resetState: () => void;
	clearStoredData: () => void;
}

// Context
const CoursePlanningContext = createContext<CoursePlanningContextType | null>(null);

// Provider Component
export function CoursePlanningProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(coursePlanningReducer, initialState);

	// Load data from localStorage on mount
	useEffect(() => {
		const storedData = loadCoursePlanningData();
		if (storedData?.calendar) {
			dispatch({ type: 'SET_CALENDAR', payload: storedData.calendar });
			if (storedData.selectedClasses) {
				dispatch({ type: 'SET_SELECTED_CLASSES', payload: storedData.selectedClasses });
			}
			if (storedData.selectedMode) {
				dispatch({ type: 'SET_SELECTED_MODE', payload: storedData.selectedMode });
			}
		}
	}, []);

	// Save data to localStorage when state changes
	useEffect(() => {
		if (state.calendar) {
			saveCoursePlanningData({
				calendar: state.calendar,
				selectedClasses: state.selectedClasses,
				selectedMode: state.selectedMode,
				lastUpdated: new Date().toISOString()
			});
		}
	}, [state.calendar, state.selectedClasses, state.selectedMode]);

	// Data loading
	const loadCalendarData = useCallback((data: JSONResultData) => {
		dispatch({ type: 'SET_CALENDAR', payload: data });
	}, []);

	const processExcelFile = useCallback(
		async (file: File, title?: string): Promise<ExcelProcessingResult> => {
			dispatch({ type: 'SET_LOADING', payload: true });
			dispatch({ type: 'SET_ERROR', payload: null });

			try {
				// Dynamic import to avoid bundling issues
				const { processExcelFileFromFile } = await import(
					'@/lib/ts/course-planning/excel-processor'
				);
				const result = await processExcelFileFromFile(file, title);

				if (result.success && result.data) {
					dispatch({ type: 'SET_CALENDAR', payload: result.data });
				} else {
					dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to process file' });
				}

				dispatch({ type: 'SET_LOADING', payload: false });
				return result;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				dispatch({ type: 'SET_ERROR', payload: errorMessage });
				dispatch({ type: 'SET_LOADING', payload: false });
				return { success: false, error: errorMessage };
			}
		},
		[]
	);

	// Subject selection
	const selectMajor = useCallback((major: string, select: boolean) => {
		dispatch({ type: 'SELECT_MAJOR', payload: { major, select } });
	}, []);

	const updateSelectedClass = useCallback(
		(majorKey: string, subjectName: string, classCode: string | null) => {
			dispatch({ type: 'UPDATE_SELECTED_CLASS', payload: { majorKey, subjectName, classCode } });
		},
		[]
	);

	const updateShowSubject = useCallback((majorKey: string, subjectName: string, show: boolean) => {
		dispatch({ type: 'UPDATE_SHOW_SUBJECT', payload: { majorKey, subjectName, show } });
	}, []);

	// Schedule generation
	const generateSchedule = useCallback(
		async (auto: AutoMode) => {
			if (!state.calendar) return;

			dispatch({ type: 'SET_LOADING', payload: true });

			try {
				// Calculate new autoTh value
				let newAutoTh: number;
				if (auto !== state.oldAuto) {
					newAutoTh = 0;
					dispatch({ type: 'SET_AUTO_TH', payload: 0 });
				} else {
					newAutoTh = state.autoTh + 1;
					dispatch({ type: 'SET_AUTO_TH', payload: newAutoTh });
				}
				dispatch({ type: 'SET_OLD_AUTO', payload: auto });

				// Prepare selected subjects for worker
				const selectedSubjects = Object.entries(state.selectedClasses).flatMap(
					([majorKey, majorData]) =>
						Object.entries(majorData)
							.filter((subject) => subject[1].show)
							.map((subject) => [majorKey, subject[0]] as [string, string])
				);

				// Create worker message
				const workerMessage: ScheduleWorkerMessage = {
					calendar: state.calendar,
					selectedSubjects,
					auto,
					autoTh: newAutoTh
				};

				// Use worker for heavy computation
				const worker = new Worker(new URL('@/workers/schedule-worker.ts', import.meta.url));

				const response = await new Promise<ScheduleWorkerResponse>((resolve, reject) => {
					worker.onmessage = (event: MessageEvent<ScheduleWorkerResponse>) => {
						resolve(event.data);
						worker.terminate();
					};

					worker.onerror = (error) => {
						reject(error);
						worker.terminate();
					};

					worker.postMessage(workerMessage);
				});

				// Update selected classes with generated schedule
				const selectedClasses = { ...state.selectedClasses };

				for (const [majorKey, subjectName, classCode] of response.data.selectedClasses) {
					if (!selectedClasses[majorKey]) selectedClasses[majorKey] = {};
					selectedClasses[majorKey][subjectName] = {
						show: true,
						class: classCode
					};
				}

				dispatch({ type: 'SET_SELECTED_CLASSES', payload: selectedClasses });
			} catch (error) {
				console.error('Schedule generation error:', error);
				dispatch({ type: 'SET_ERROR', payload: 'Failed to generate schedule' });
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false });
			}
		},
		[state.calendar, state.selectedClasses, state.autoTh, state.oldAuto]
	);

	// Get calendar table data for display
	const getCalendarTableData = useCallback((): CalendarTableData | null => {
		if (!state.calendar) return null;
		return generateCalendarTableData(state.calendar, state.selectedClasses);
	}, [state.calendar, state.selectedClasses]);

	// Utility functions
	const setLoading = useCallback((loading: boolean) => {
		dispatch({ type: 'SET_LOADING', payload: loading });
	}, []);

	const setError = useCallback((error: string | null) => {
		dispatch({ type: 'SET_ERROR', payload: error });
	}, []);

	const resetState = useCallback(() => {
		dispatch({ type: 'RESET_STATE' });
	}, []);

	const clearStoredData = useCallback(() => {
		clearCoursePlanningData();
		dispatch({ type: 'RESET_STATE' });
	}, []);

	const setSelectedMode = useCallback((mode: AutoMode) => {
		dispatch({ type: 'SET_SELECTED_MODE', payload: mode });
	}, []);

	const contextValue: CoursePlanningContextType = {
		state,
		loadCalendarData,
		processExcelFile,
		selectMajor,
		updateSelectedClass,
		updateShowSubject,
		generateSchedule,
		getCalendarTableData,
		setSelectedMode,
		setLoading,
		setError,
		resetState,
		clearStoredData
	};

	return (
		<CoursePlanningContext.Provider value={contextValue}>{children}</CoursePlanningContext.Provider>
	);
}

// Hook to use the context
export function useCoursePlanning() {
	const context = useContext(CoursePlanningContext);
	if (!context) {
		throw new Error('useCoursePlanning must be used within a CoursePlanningProvider');
	}
	return context;
}

// Hook return type for external use
export type UseCoursePlanningReturn = CoursePlanningContextType;
