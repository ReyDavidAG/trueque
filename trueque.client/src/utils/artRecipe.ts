export const ART_COLORS = [
	['grana', 'Grana'],
	['anil', 'Añil'],
	['nopal', 'Nopal'],
	['achiote', 'Achiote'],
	['maiz', 'Maíz'],
	['cacao', 'Cacao'],
	['estraza', 'Estraza'],
	['ink', 'Tinta'],
] as const

export type ArtColor = (typeof ART_COLORS)[number][0]
export type Swaps = Partial<Record<ArtColor, ArtColor>>

const NAMES = ART_COLORS.map(([c]) => c)
const isColor = (v: string): v is ArtColor => (NAMES as string[]).includes(v)
const CLASS = new RegExp(`a-(${NAMES.join('|')})(?=["\\s])`, 'g')

export function parseArt(code: string) {
	const [id, recipe = ''] = code.split(':')
	const swaps: Swaps = {}
	for (const pair of recipe.split(',')) {
		const [from, to] = pair.split('=')
		if (from && to && isColor(from) && isColor(to) && from !== to)
			swaps[from] = to
	}
	return { id, swaps }
}

export function artCode(id: string, swaps: Swaps) {
	const recipe = Object.entries(swaps)
		.filter(([from, to]) => from !== to)
		.map(([from, to]) => `${from}=${to}`)
		.join(',')
	return recipe ? `${id}:${recipe}` : id
}

export function recolor(body: string, swaps: Swaps) {
	if (!Object.keys(swaps).length) return body
	return body.replace(CLASS, (_match, c: ArtColor) => `a-${swaps[c] ?? c}`)
}

export type LayerKind = 'f' | 's' | 't'
export type Layer = {
	kind: LayerKind
	ref: string
	swaps: Swaps
	x: number
	y: number
	s: number
	r: number
	flip: boolean
}

export const MIX = 'mix~'
export const MAX_LAYERS = 6
export const MAX_WORD = 16
export const TEXT_COLOR: ArtColor = 'grana'

export const newLayer = (kind: LayerKind, ref: string): Layer => ({
	kind,
	ref,
	swaps: {},
	x: 120,
	y: 90,
	s: 100,
	r: 0,
	flip: false,
})

const swapText = (swaps: Swaps) =>
	Object.entries(swaps)
		.map(([from, to]) => `${from}=${to}`)
		.join(',')

const isPlain = (l: Layer) =>
	l.kind === 'f' &&
	l.x === 120 &&
	l.y === 90 &&
	l.s === 100 &&
	l.r === 0 &&
	!l.flip

export function encodeDesign(layers: Layer[]) {
	if (layers.length === 1 && isPlain(layers[0]))
		return artCode(layers[0].ref, layers[0].swaps)
	return (
		MIX +
		layers
			.map(l =>
				[
					l.kind,
					l.kind === 't' ? encodeURIComponent(l.ref) : l.ref,
					swapText(l.swaps),
					Math.round(l.x),
					Math.round(l.y),
					Math.round(l.s),
					Math.round(l.r),
					l.flip ? 1 : 0,
				].join('|')
			)
			.join(';')
	)
}

const num = (
	v: string | undefined,
	fallback: number,
	lo: number,
	hi: number
) => {
	const n = Number(v)
	return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
}

export function decodeDesign(code: string): Layer[] {
	if (!code.startsWith(MIX)) {
		const { id, swaps } = parseArt(code)
		return [{ ...newLayer('f', id), swaps }]
	}
	return code
		.slice(MIX.length)
		.split(';')
		.filter(Boolean)
		.slice(0, MAX_LAYERS)
		.map(chunk => {
			const [kind, ref = '', swaps = '', x, y, s, r, flip] = chunk.split('|')
			const k: LayerKind = kind === 's' || kind === 't' ? kind : 'f'
			let text = ref
			try {
				text = k === 't' ? decodeURIComponent(ref).slice(0, MAX_WORD) : ref
			} catch {
				text = ''
			}
			return {
				kind: k,
				ref: text,
				swaps: parseArt(`x:${swaps}`).swaps,
				x: num(x, 120, 0, 240),
				y: num(y, 90, 0, 180),
				s: num(s, 100, 20, 220),
				r: num(r, 0, -180, 180),
				flip: flip === '1',
			}
		})
}

export function colorsIn(body: string) {
	const count = new Map<ArtColor, number>()
	for (const [, c] of body.matchAll(CLASS))
		if (isColor(c) && c !== 'ink') count.set(c, (count.get(c) ?? 0) + 1)
	return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
}
