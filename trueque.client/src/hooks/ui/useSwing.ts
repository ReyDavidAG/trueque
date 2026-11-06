import { useEffect, useRef } from 'react'

const SWING_K = 90
const SWING_DAMP = 4
const SPIN_K = 60
const SPIN_DAMP = 5
const DRAG = 0.5
const MAX = 70

export function useSwing<T extends HTMLElement>() {
	const ref = useRef<T>(null)

	useEffect(() => {
		const el = ref.current
		if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
		const s = {
			a: 0,
			v: 0,
			y: 0,
			yv: 0,
			held: false,
			moved: false,
			x0: 0,
			lastT: 0,
			raf: 0,
		}
		let prev = 0

		const paint = () => {
			el.style.setProperty('--swing', `${s.a.toFixed(2)}deg`)
			el.style.setProperty('--spin', `${s.y.toFixed(2)}deg`)
		}
		const step = (now: number) => {
			const dt = Math.min((now - prev) / 1000, 1 / 30)
			prev = now
			if (!s.held) {
				s.v += (-SWING_K * s.a - SWING_DAMP * s.v) * dt
				s.a += s.v * dt
			}
			const rest = Math.round(s.y / 360) * 360
			s.yv += (-SPIN_K * (s.y - rest) - SPIN_DAMP * s.yv) * dt
			s.y += s.yv * dt
			const energy =
				Math.abs(s.a) +
				Math.abs(s.v) * 0.1 +
				Math.abs(s.y - rest) +
				Math.abs(s.yv) * 0.1
			if (s.held || energy > 0.05) {
				paint()
				s.raf = requestAnimationFrame(step)
				return
			}
			Object.assign(s, { a: 0, v: 0, y: 0, yv: 0, raf: 0 })
			paint()
		}
		const wake = () => {
			if (s.raf) return
			prev = performance.now()
			s.raf = requestAnimationFrame(step)
		}

		const down = (e: PointerEvent) => {
			if (e.button !== 0) return
			Object.assign(s, {
				held: true,
				moved: false,
				x0: e.clientX - s.a / DRAG,
				lastT: e.timeStamp,
				v: 0,
			})
			el.setPointerCapture(e.pointerId)
			wake()
		}
		const move = (e: PointerEvent) => {
			if (!s.held) return
			const next = Math.max(-MAX, Math.min(MAX, (e.clientX - s.x0) * DRAG))
			const dt = Math.max((e.timeStamp - s.lastT) / 1000, 1 / 240)
			s.lastT = e.timeStamp
			s.v = s.v * 0.5 + ((next - s.a) / dt) * 0.5
			if (Math.abs(next - s.a) > 0.5) s.moved = true
			s.a = next
		}
		const up = (e: PointerEvent) => {
			if (!s.held) return
			s.held = false
			if (e.timeStamp - s.lastT > 80) s.v = 0
			s.yv += s.moved ? s.v * 1.5 : 540
			wake()
		}
		const click = (e: MouseEvent) => {
			if (!s.moved) return
			e.preventDefault()
			e.stopPropagation()
			s.moved = false
		}
		const block = (e: Event) => e.preventDefault()
		const card = el.closest('.stall') ?? el
		const nudge = () => {
			s.v += 70
			wake()
		}

		el.addEventListener('pointerdown', down)
		el.addEventListener('pointermove', move)
		el.addEventListener('pointerup', up)
		el.addEventListener('pointercancel', up)
		el.addEventListener('click', click, true)
		el.addEventListener('dragstart', block)
		card.addEventListener('pointerenter', nudge)
		return () => {
			cancelAnimationFrame(s.raf)
			el.removeEventListener('pointerdown', down)
			el.removeEventListener('pointermove', move)
			el.removeEventListener('pointerup', up)
			el.removeEventListener('pointercancel', up)
			el.removeEventListener('click', click, true)
			el.removeEventListener('dragstart', block)
			card.removeEventListener('pointerenter', nudge)
		}
	}, [])

	return ref
}
