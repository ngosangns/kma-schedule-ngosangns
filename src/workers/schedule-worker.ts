// Schedule Generation Web Worker - Ported and adapted from tin-chi-master
import { generateCombinationOfSubjects } from '@/lib/ts/course-planning/schedule-generator';
import { ScheduleWorkerMessage, ScheduleWorkerResponse } from '@/types/course-planning';

// Handle messages from main thread
self.onmessage = (event: MessageEvent<ScheduleWorkerMessage>) => {
	try {
		const result = generateCombinationOfSubjects(event.data);
		self.postMessage(result);
	} catch (error) {
		console.error('Schedule worker error:', error);
		self.postMessage({
			data: {
				selectedClasses: [],
				totalConflictedSessions: 0
			}
		} as ScheduleWorkerResponse);
	}
};

// Export for TypeScript
export {};
