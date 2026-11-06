import { ART, SYSTEM_ART } from '@/constants/art/artCatalog'
import { SHAPES } from '@/constants/art/artShapes'
import {
	decodeDesign,
	type Layer,
	MIX,
	newLayer,
	parseArt,
	recolor,
	TEXT_COLOR,
} from '@/utils/artRecipe'

const DRAWINGS = new Map(ART.map(a => [a.id, a.draw]))

export const POD_PATHS = {
	body: 'M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z',
	rib: 'M207 92c-24 52-30 108-30 166s6 116 30 166c-24-14-65-80-65-166s41-148 65-166zM305 92c24 52 30 108 30 166s-6 116-30 166c24-14 65-80 65-166s-41-148-65-166zM256 70c-14 56-18 120-18 188s4 132 18 188c14-56 18-120 18-188s-4-132-18-188z',
	stem: 'M256 62c2-20 10-34 24-42',
}

export const POD = `<path class="pod__body" d="${POD_PATHS.body}"/><path class="pod__rib" d="${POD_PATHS.rib}"/><path class="pod__line" d="${POD_PATHS.body}"/><path class="pod__stem" d="${POD_PATHS.stem}"/>`

const SHAPE_DRAWINGS = new Map<string, string>(SHAPES.map(s => [s.id, s.draw]))
const escapeXml = (t: string) =>
	t.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)

export function layerDrawing(l: Layer) {
	if (l.kind === 't')
		return `<text class="art-word a-${TEXT_COLOR}" x="120" y="102" text-anchor="middle">${escapeXml(l.ref)}</text>`
	if (l.kind === 's') return SHAPE_DRAWINGS.get(l.ref) ?? ''
	return (
		DRAWINGS.get(l.ref) ?? SYSTEM_ART[l.ref] ?? DRAWINGS.get('ticket') ?? ''
	)
}

export function artBody(code: string) {
	if (!code.startsWith(MIX)) {
		const recipe = parseArt(code)
		return recolor(layerDrawing({ ...newLayer('f', recipe.id) }), recipe.swaps)
	}
	return decodeDesign(code)
		.map(l => {
			const k = l.s / 100
			return `<g transform="translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.flip ? -k : k} ${k}) translate(-120 -90)">${recolor(layerDrawing(l), l.swaps)}</g>`
		})
		.join('')
}
