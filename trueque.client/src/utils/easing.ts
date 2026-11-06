const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

export const easeOutCubic = (t: number) => 1 - (1 - clamp01(t)) ** 3

export const easeOutBack = (t: number) => {
	const k = clamp01(t)
	return 1 + 2.4 * (k - 1) ** 3 + 1.4 * (k - 1) ** 2
}

export const easeOutBounce = (t: number) => {
	const n = 7.5625
	const d = 2.75
	if (t < 1 / d) return n * t * t
	if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
	if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
	return n * (t -= 2.625 / d) * t + 0.984375
}
