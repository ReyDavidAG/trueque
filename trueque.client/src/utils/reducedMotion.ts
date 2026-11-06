export const prefersReducedMotion = () =>
	matchMedia('(prefers-reduced-motion: reduce)').matches

export const motionMs = (ms: number) => (prefersReducedMotion() ? 0 : ms)
