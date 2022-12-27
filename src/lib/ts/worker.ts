/**
 *
 * @param {*} fn main handler
 * @param  {...any} dfn dependence helpers
 */
export function createInlineWorker(fn: any, ...dfn: any[]) {
	let scriptContent = 'self.onmessage = ' + fn.toString();
	for (const ifn of dfn) scriptContent += '\n' + ifn.toString();
	const blob = new Blob([scriptContent], { type: 'text/javascript' });
	const url = URL.createObjectURL(blob);
	return new Worker(url);
}
