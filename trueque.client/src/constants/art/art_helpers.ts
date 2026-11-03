export const gear = (
	cx: number,
	cy: number,
	r: number,
	teeth: number,
	depth: number
) => {
	const pts: string[] = []
	for (let i = 0; i < teeth * 4; i++) {
		const a = (Math.PI * 2 * i) / (teeth * 4)
		const rr = i % 4 < 2 ? r + depth : r
		pts.push(
			`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`
		)
	}
	return `M${pts.join('L')}z`
}

export const pentagon = (cx: number, cy: number, r: number, rot = -90) =>
	`M${Array.from({ length: 5 }, (_, i) => {
		const a = ((rot + i * 72) * Math.PI) / 180
		return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`
	}).join('L')}z`

export const ballPatches = (cx: number, cy: number) =>
	[-90, -18, 54, 126, 198]
		.map(deg => {
			const a = (deg * Math.PI) / 180
			return pentagon(
				cx + 44 * Math.cos(a),
				cy + 44 * Math.sin(a),
				15,
				deg + 180
			)
		})
		.join('')

export const ballSeams = (cx: number, cy: number) =>
	[-90, -18, 54, 126, 198]
		.map(deg => {
			const a = (deg * Math.PI) / 180
			return `M${(cx + 17 * Math.cos(a)).toFixed(1)} ${(cy + 17 * Math.sin(a)).toFixed(1)}L${(cx + 30 * Math.cos(a)).toFixed(1)} ${(cy + 30 * Math.sin(a)).toFixed(1)}`
		})
		.join('')

export const custodiaTag = (
	x: number,
	y: number,
	rot: number
) => `<g transform="rotate(${rot} ${x} ${y})">
      <path class="ln" d="M${x - 22} ${y - 30}c10 4 16 12 18 22"/>
      <path class="a-cacao ln" d="M${x - 14} ${y - 12}h30l10 14-10 14h-30z"/>
      <circle class="a-amate2" cx="${x + 18}" cy="${y + 2}" r="3.5"/>
      <path class="a-on-dark" d="M${x - 8} ${y}h18v4h-18z" opacity=".8"/>
    </g>`

export const calendarGrid = () => {
	let s = ''
	for (let row = 0; row < 3; row++)
		for (let col = 0; col < 5; col++) {
			if (row === 1 && col === 3) continue
			s += `<rect x="${66 + col * 20}" y="${82 + row * 20}" width="12" height="12" rx="3"/>`
		}
	return s
}
