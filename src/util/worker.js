// fn: main handler
// dfn: dependence helpers
export function createInlineWorker(fn, ...dfn) {
    let scriptContent = 'self.onmessage = ' + fn.toString()
    for (const ifn of dfn)
        scriptContent += "\n" + ifn.toString()
    let blob = new Blob([scriptContent], { type: 'text/javascript' });
    let url = URL.createObjectURL(blob);

    return new Worker(url);
}