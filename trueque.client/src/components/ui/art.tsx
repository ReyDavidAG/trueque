import type { ReactNode } from 'react'

import { ART, SYSTEM_ART } from '@/constants/art/art_catalog'
import { SHAPES } from '@/constants/art/art_shapes'
import {
	decodeDesign,
	type Layer,
	MIX,
	newLayer,
	parseArt,
	recolor,
	TEXT_COLOR,
} from '@/utils/art_recipe'
import { qrPaths } from '@/utils/qr'

const DRAWINGS = new Map(ART.map(a => [a.id, a.draw]))

export const POD_PATHS = {
	body: 'M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z',
	rib: 'M207 92c-24 52-30 108-30 166s6 116 30 166c-24-14-65-80-65-166s41-148 65-166zM305 92c24 52 30 108 30 166s-6 116-30 166c24-14 65-80 65-166s-41-148-65-166zM256 70c-14 56-18 120-18 188s4 132 18 188c14-56 18-120 18-188s-4-132-18-188z',
	stem: 'M256 62c2-20 10-34 24-42',
}

const POD = `<path class="pod__body" d="${POD_PATHS.body}"/><path class="pod__rib" d="${POD_PATHS.rib}"/><path class="pod__line" d="${POD_PATHS.body}"/><path class="pod__stem" d="${POD_PATHS.stem}"/>`

const SHAPE_DRAWINGS = new Map<string, string>(SHAPES.map(s => [s.id, s.draw]))
const escapeXml = (t: string) =>
	t.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)

export function layerDrawing(l: Layer) {
	if (l.kind === 't')
		return `<text class="art-word a-${TEXT_COLOR}" x="120" y="102" text-anchor="middle">${escapeXml(l.ref)}</text>`
	if (l.kind === 's') return SHAPE_DRAWINGS.get(l.ref) ?? ''
	return DRAWINGS.get(l.ref) ?? SYSTEM_ART[l.ref] ?? DRAWINGS.get('ticket') ?? ''
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

export function Art({ id, label = '' }: { id: string; label?: string }) {
	const body = artBody(id)
	return (
		<svg
			className='art'
			viewBox='0 0 240 180'
			role={label ? 'img' : undefined}
			aria-label={label || undefined}
			aria-hidden={label ? undefined : true}
			focusable='false'
			dangerouslySetInnerHTML={{
				__html: `<ellipse class="a-halo" cx="120" cy="96" rx="92" ry="70"/><g class="a-shift">${body}</g><g>${body}</g>`,
			}}
		/>
	)
}

export function Coin({ className = '' }: { className?: string }) {
	return (
		<svg
			className={`coin ${className}`}
			viewBox='0 0 512 512'
			aria-hidden='true'
			focusable='false'
			dangerouslySetInnerHTML={{
				__html: `<circle class="coin__rim" cx="256" cy="256" r="246"/><circle class="coin__face" cx="256" cy="256" r="224"/><circle class="coin__ring" cx="256" cy="256" r="200"/><g transform="translate(256 262) rotate(-32) scale(.84) translate(-256 -256)">${POD}</g>`,
			}}
		/>
	)
}

export function Mark({ className = '' }: { className?: string }) {
	return (
		<svg
			className={`mark ${className}`}
			viewBox='0 0 512 512'
			aria-hidden='true'
			focusable='false'
			dangerouslySetInnerHTML={{
				__html: `<path class="mark__string" d="M146 190L256 66l110 124"/><circle class="mark__nail" cx="256" cy="60" r="26"/><g transform="rotate(-6 256 330)"><rect class="mark__board" x="44" y="186" width="424" height="290" rx="46"/><g transform="translate(256 331) rotate(-58) scale(.58) translate(-256 -256)">${POD}</g></g>`,
			}}
		/>
	)
}

export function Wordmark({ mark = <Mark /> }: { mark?: ReactNode }) {
	return (
		<span className='wordmark' role='img' aria-label='El Trueque'>
			{mark}
			<span aria-hidden='true'>
				<small>El</small>Trueque
			</span>
		</span>
	)
}

export function Qr({ code }: { code: string }) {
	const { eyes, cells } = qrPaths(code)
	return (
		<svg
			className='qr'
			viewBox='-1 -1 23 23'
			role='img'
			aria-label={`Código ${code}`}>
			<rect x='-1' y='-1' width='23' height='23' className='qr__bg' />
			<path d={eyes} fillRule='evenodd' />
			<path d={cells} />
		</svg>
	)
}
