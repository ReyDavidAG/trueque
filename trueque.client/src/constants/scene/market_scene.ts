import * as THREE from 'three'

export const STALL_LOOKS = [
	{ color: '--color-grana', ink: '--color-on-dark', price: 25 },
	{ color: '--color-anil', ink: '--color-on-dark', price: 60 },
	{ color: '--color-achiote', ink: '--color-ink', price: 180 },
] as const

export const FRUIT_PALETTES = {
	round: ['--color-grana', '--color-achiote', '--color-nopal', '--color-maiz'],
	lemon: ['--color-maiz', '--color-nopal'],
	pod: ['--color-achiote', '--color-maiz-2', '--color-cacao-2'],
	grapes: ['--color-anil', '--color-grana', '--color-nopal'],
	pumpkin: ['--color-achiote', '--color-maiz-2'],
	coin: ['--color-cacao-3'],
	crate: ['--color-cacao-2'],
	sack: ['--color-amate-3', '--color-estraza'],
} as const

export type FruitKind = keyof typeof FRUIT_PALETTES

export const COUNTER_ODDS: FruitKind[] = [
	'round',
	'round',
	'round',
	'lemon',
	'lemon',
	'pod',
	'grapes',
	'grapes',
	'coin',
	'coin',
]

export const GROUND_ODDS: FruitKind[] = [
	'round',
	'round',
	'lemon',
	'pod',
	'grapes',
	'coin',
	'pumpkin',
	'pumpkin',
	'crate',
	'crate',
	'sack',
	'sack',
]

export const FRUIT_RADIUS: Record<FruitKind, number> = {
	round: 0.16,
	lemon: 0.17,
	pod: 0.23,
	grapes: 0.13,
	pumpkin: 0.23,
	coin: 0.14,
	crate: 0.24,
	sack: 0.22,
}

export const MAX_FRUIT_SPEED = 12
export const MAX_THROW_SPEED = 14
export const PHYSICS_STEP = 1 / 120
export const REBUILD_DELAY_MS = 6000
export const REBUILD_DURATION_MS = 900
export const STALL_SPACING = 2.5
export const COUNTER_TOP = 0.86
export const COUNTER_AREA = { x: 0.68, z: 0.28 }
export const MARKET_BOUNDS = { x: 4.1, zMin: -1.2, zMax: 1.5 }
export const CAMERA_TARGET = new THREE.Vector3(0, 1.05, 0)
export const CAMERA_VIEW = new THREE.Vector3(0, 0.35, 1).normalize()
export const TAP_TOLERANCE_PX = 6
export const GRAB_FOLLOW = 16

export const stallCenterX = (index: number) => (index - 1) * STALL_SPACING
