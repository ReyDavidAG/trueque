export const MARK_UNIT = 1 / 256
export const MARK_BOARD = {
	w: 446,
	h: 312,
	r: 57,
	depth: 34,
	y: 331 - 60,
	tilt: (6 * Math.PI) / 180,
}
export const MARK_NAIL_Y = (256 - 60) * MARK_UNIT
export const MARK_STRING_POINTS = [
	[-110, -130],
	[0, -6],
	[110, -130],
] as const
export const MARK_SWING = {
	stiffness: 18,
	damping: 1.4,
	maxAngle: 1.4,
	breeze: 0.25,
}
export const MARK_SPIN = {
	stiffness: 9,
	damping: 1.6,
	tapKick: 14,
	throwGain: 1.5,
}
export const MARK_TAP_ANGLE = 0.05
export const MARK_RELEASE_STALE_MS = 80
export const MARK_CAMERA_FOV = 30
