export type VendorPart =
	| 'face'
	| 'eye'
	| 'stache'
	| 'pull'
	| 'shoulder'
	| 'belly'
	| 'arm'
	| 'hat'
	| 'goods'
	| 'throw'
	| 'bonk'
	| 'hatBack'
	| 'nose'
	| 'five'
	| 'tip'
	| 'sign'
	| 'bell'
	| 'idle'
	| 'arrive'
	| 'cheek'
	| 'pit'
	| 'head'
	| 'board'
	| 'newPrice'
	| 'newName'
	| 'newLook'

export type VendorAct =
	| 'shrug'
	| 'laugh'
	| 'bonk'
	| 'wince'
	| 'honk'
	| 'swing'
	| 'ring'

export type VendorDent = { id: number; x: number; y: number }

export const PART_ACTS: Partial<Record<VendorPart, VendorAct>> = {
	shoulder: 'shrug',
	belly: 'laugh',
	pit: 'laugh',
	bonk: 'bonk',
	pull: 'wince',
	nose: 'honk',
	sign: 'swing',
	bell: 'ring',
	five: 'laugh',
}

export const ANNOYING_PARTS: VendorPart[] = [
	'face',
	'eye',
	'stache',
	'pull',
	'belly',
	'arm',
	'hat',
	'throw',
	'bonk',
	'nose',
	'cheek',
	'pit',
	'head',
]

export const PRICE_TALK_PARTS: VendorPart[] = ['goods', 'sign', 'idle']

export const HAT_TIP_MS = 700
export const STAND_X = 0.45
export const STAND_HALF_W = 0.22
export const STAND_H = 44
export const VENDOR_ARRIVE_MS = 700
export const IDLE_TALK_MS = 11000
export const IDLE_CHECK_MS = 3000
export const HAT_BRIM_RATIO = 44 / 56
export const HAT_ASPECT = 56 / 140
export const PUPIL_TRAVEL_PX = 3.5
export const GAZE_HOLD_MS = 2500
export const ACT_MS = 650
export const DENT_MS = 600
export const BONK_SPEED = 500
export const BONK_COOLDOWN_MS = 900
export const ARM_REST_ANGLE = -2.3
export const WARN_AFTER_POKES = 6
export const ANGRY_AFTER_POKES = 9
export const CALM_MS = 5000
export const QUIP_MS = 3000
export const KICK_OUT_MS = 2200
export const GRAVITY = 2400
export const BOUNCE = 0.35
export const THROW_SPEED = 1100
export const MAX_THROW_SPEED = 1800
export const HAT_SNAP_PX = 60
export const ARM_STIFFNESS = 60
export const ARM_DAMPING = 7
export const TAP_TOLERANCE_PX = 6
