import * as THREE from 'three'

export const STALL_LOOKS = [
	{
		kind: 'Huevo blanco',
		unit: 'docena',
		price: 25,
		eggs: ['--color-cascara'],
	},
	{
		kind: 'Huevo rojo',
		unit: 'docena',
		price: 60,
		eggs: ['--color-cascara-roja'],
	},
	{
		kind: 'Huevo de rancho',
		unit: '30 piezas',
		price: 180,
		eggs: ['--color-cascara', '--color-cascara-roja', '--color-cascara-sombra'],
	},
] as const

export type StallLook = (typeof STALL_LOOKS)[number]

export const STALL_COLOR = '--color-tinta'

export const FRUIT_PALETTES = {
	egg: ['--color-cascara', '--color-cascara-roja', '--color-cascara-sombra'],
	coin: ['--color-tinta'],
	carton: ['--color-carton'],
} as const

export type FruitKind = keyof typeof FRUIT_PALETTES

export const COUNTER_ODDS: FruitKind[] = [
	'egg',
	'egg',
	'egg',
	'egg',
	'egg',
	'egg',
	'carton',
	'coin',
]

export const GROUND_ODDS: FruitKind[] = [
	'egg',
	'egg',
	'egg',
	'egg',
	'carton',
	'carton',
	'coin',
]

export const FRUIT_RADIUS: Record<FruitKind, number> = {
	egg: 0.13,
	coin: 0.14,
	carton: 0.26,
}

export const HENS = {
	count: 4,
	scale: 0.34,
	radius: 0.2,
	speed: 0.45,
	turnRate: 1.6,
	pauseChance: 0.25,
	layDelayMs: 2200,
}

export const EGG_BREAK_SPEED = 5
export const CARTON_BREAK_SPEED = 3.6
export const COINS_PER_EGG = 3
export const MAX_LOOSE_COINS = 30
export const MAX_SPLATS = 24

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
