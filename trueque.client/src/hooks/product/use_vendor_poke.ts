import { type MouseEvent, type RefObject, useRef, useState } from 'react'

import { ACT_MS, DENT_MS, type VendorDent, type VendorPart } from '@/constants/vendor'

const closestDent = (group: Element, point: DOMPoint) =>
	[...group.querySelectorAll<SVGGraphicsElement>('[data-dent]')]
		.map(el => {
			const box = el.getBBox()
			return {
				el,
				distance: Math.hypot(box.x + box.width / 2 - point.x, box.y + box.height / 2 - point.y),
			}
		})
		.sort((a, b) => a.distance - b.distance)[0]?.el

const replayDent = (el: Element) => {
	el.classList.remove('is-dent')
	el.getBoundingClientRect()
	el.classList.add('is-dent')
}

export function useVendorPoke(
	say: RefObject<(part: VendorPart) => void>,
	later: (run: () => void, ms: number) => void
) {
	const [wink, setWink] = useState<number | null>(null)
	const [dents, setDents] = useState<VendorDent[]>([])
	const dentId = useRef(0)
	const stachePulled = useRef(false)

	const dentAt = (group: Element, point: DOMPoint) => {
		const id = ++dentId.current
		setDents(d => [...d.slice(-3), { id, x: point.x, y: point.y }])
		later(() => setDents(d => d.filter(x => x.id !== id)), DENT_MS)
		const dent = closestDent(group, point)
		if (dent) replayDent(dent)
	}

	const blink = (eye: number) => {
		setWink(eye)
		later(() => setWink(w => (w === eye ? null : w)), ACT_MS)
	}

	const poke = (e: MouseEvent<HTMLButtonElement>) => {
		if (stachePulled.current) {
			stachePulled.current = false
			return
		}
		const target = e.target as Element
		const group = target.closest('[data-part]')
		const ctm = target.closest('svg')?.getScreenCTM()
		if (group && ctm && e.detail > 0)
			dentAt(group, new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()))
		const eye = target.getAttribute('data-eye')
		if (eye) blink(Number(eye))
		const part = group?.getAttribute('data-part')
		say.current((part as VendorPart | null | undefined) ?? 'belly')
	}

	return { wink, dents, stachePulled, poke }
}
