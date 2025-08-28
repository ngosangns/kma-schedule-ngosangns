import { WorkerFunction } from '@/types';

/**
 * Creates an inline worker with the given function and dependencies
 * @param fn main handler function
 * @param dfn dependence helper functions
 */
export function createInlineWorker(fn: WorkerFunction, ...dfn: WorkerFunction[]): Worker {
	let scriptContent = 'self.onmessage = ' + fn.toString();
	for (const ifn of dfn) scriptContent += '\n' + ifn.toString();
	const blob = new Blob([scriptContent], { type: 'text/javascript' });
	const url = URL.createObjectURL(blob);
	return new Worker(url);
}
