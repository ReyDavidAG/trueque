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

export const EGG_PATH =
	'M256 24c-98 0-180 156-180 282 0 108 80 182 180 182s180-74 180-182C436 180 354 24 256 24z'

export const YOLK =
	'<circle class="coin__yolk" cx="256" cy="256" r="132"/><circle class="coin__yolk-edge" cx="256" cy="256" r="132"/><ellipse class="coin__shine" cx="212" cy="206" rx="42" ry="26" transform="rotate(-32 212 206)"/>'

export const EGG = `<path class="egg__shell" d="${EGG_PATH}"/><circle class="egg__yolk" cx="256" cy="318" r="96"/><ellipse class="egg__shine" cx="220" cy="286" rx="26" ry="16" transform="rotate(-32 220 286)"/>`

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
