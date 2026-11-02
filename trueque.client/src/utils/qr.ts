export function qrPaths(code: string) {
	let h = 2166136261
	for (const ch of code) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
	const n = 21
	const finder = (x: number, y: number) =>
		(x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
	const cells: string[] = []
	for (let y = 0; y < n; y++)
		for (let x = 0; x < n; x++) {
			if (finder(x, y)) continue
			h = Math.imul(h ^ (x * 31 + y), 16777619)
			if ((h >>> 7) & 1) cells.push(`M${x} ${y}h1v1h-1z`)
		}
	const eye = (x: number, y: number) =>
		`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`
	return {
		eyes: [eye(0, 0), eye(n - 7, 0), eye(0, n - 7)].join(''),
		cells: cells.join(''),
	}
}
