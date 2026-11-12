const INK = '#1d2740'
const SHELL = '#fbf5e8'
const SHELL_SHADE = '#ecdcbf'
const WHITE = '#ffffff'
const YOLK = '#f4b52e'
const YOLK_EDGE = '#d98a1c'

const EGG =
	'M256 24c-98 0-180 156-180 282 0 108 80 182 180 182s180-74 180-182C436 180 354 24 256 24z'

const CRACK: [number, number][] = [
	[60, 252],
	[112, 224],
	[156, 264],
	[204, 228],
	[252, 268],
	[298, 226],
	[344, 262],
	[392, 230],
	[452, 252],
]

const points = (list: [number, number][]) =>
	list.map(([x, y]) => `${x},${y}`).join(' ')

const TOP_CLIP = `0,0 512,0 512,252 ${points([...CRACK].reverse())} 0,252`
const BOTTOM_CLIP = `0,512 512,512 512,252 ${points([...CRACK].reverse())} 0,252`

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (v: number) => 1 - (1 - v) ** 3

function crackUpTo(progress: number) {
	const reach = progress * (CRACK.length - 1)
	const whole = Math.floor(reach)
	const drawn = CRACK.slice(0, whole + 1)
	const next = CRACK[whole + 1]
	if (next) {
		const [ax, ay] = CRACK[whole]
		const k = reach - whole
		drawn.push([ax + (next[0] - ax) * k, ay + (next[1] - ay) * k])
	}
	return points(drawn)
}

function shell(clip?: string) {
	return `<g${clip ? ` clip-path="url(#${clip})"` : ''}><path d="${EGG}" fill="${SHELL}"/><path d="M330 120c50 60 70 150 60 230" fill="none" stroke="${SHELL_SHADE}" stroke-width="40" stroke-linecap="round"/><path d="${EGG}" fill="none" stroke="${INK}" stroke-width="22"/></g>`
}

export function eggFrame(phase: number) {
	const p = phase - Math.floor(phase)
	const wobble =
		p < 0.32 ? Math.sin((p / 0.32) * Math.PI * 4) * 9 * (1 - p / 0.32) : 0
	const crack = clamp((p - 0.24) / 0.18)
	const open =
		easeOut(clamp((p - 0.44) / 0.16)) * (1 - easeOut(clamp((p - 0.9) / 0.1)))
	const lid = `translate(${(open * 34).toFixed(1)} ${(-open * 64).toFixed(1)}) rotate(${(open * 26).toFixed(1)} 400 250)`
	const crackLine =
		crack > 0
			? `<polyline clip-path="url(#shape)" points="${crackUpTo(crack)}" fill="none" stroke="${INK}" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>`
			: ''
	const inside =
		open > 0.02
			? `<ellipse cx="256" cy="252" rx="${(170 * open).toFixed(1)}" ry="${(46 * open).toFixed(1)}" fill="${WHITE}" stroke="${INK}" stroke-width="12"/><circle cx="256" cy="${(250 - open * 18).toFixed(1)}" r="${(68 * open).toFixed(1)}" fill="${YOLK}" stroke="${YOLK_EDGE}" stroke-width="14"/><ellipse cx="232" cy="${(226 - open * 18).toFixed(1)}" rx="${(18 * open).toFixed(1)}" ry="${(11 * open).toFixed(1)}" fill="${WHITE}" opacity=".85"/>`
			: ''
	const body =
		open > 0.02
			? `${shell('bottom')}${inside}<g transform="${lid}">${shell('top')}<polyline clip-path="url(#shape)" points="${points(CRACK)}" fill="none" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/></g>`
			: `${shell()}${crackLine}`
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><clipPath id="top"><polygon points="${TOP_CLIP}"/></clipPath><clipPath id="bottom"><polygon points="${BOTTOM_CLIP}"/></clipPath><clipPath id="shape"><path d="${EGG}"/></clipPath></defs><g transform="rotate(${wobble.toFixed(1)} 256 470)">${body}</g></svg>`
}
