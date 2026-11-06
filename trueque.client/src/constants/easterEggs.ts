export type EggKind = 'asteroids' | 'cat' | 'skeleton'

const EGG_PRINTS: Record<string, EggKind> = {
	'171fgvd': 'asteroids',
	'1yaq8dl': 'cat',
	grhp8u: 'skeleton',
}

const fingerprint = (text: string) => {
	let hash = 0x811c9dc5
	for (const ch of text) {
		hash ^= ch.charCodeAt(0)
		hash = Math.imul(hash, 0x01000193) >>> 0
	}
	return hash.toString(36)
}

export const eggFor = (raw: string): EggKind | undefined =>
	EGG_PRINTS[fingerprint(raw.trim().toUpperCase())]

export const ASTEROIDS_BEST_KEY = 'trueque.asteroids.best'
export const ASTEROIDS_LIVES = 3
export const ASTEROIDS_W = 256
export const ASTEROIDS_H = 160
