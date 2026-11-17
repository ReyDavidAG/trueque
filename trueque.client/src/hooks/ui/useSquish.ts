import { type RefObject, useEffect, useState } from 'react'

import { prefersReducedMotion } from '@/utils/reducedMotion'

const BODY = { stiffness: 620, damping: 13 }
const YOLK = { stiffness: 260, damping: 9 }
const HOLD_MS = 700
const TAP_MS = 140
const REST = 0.002
const MAX_STEP = 0.032
const STILL_SQUASH = 0.6

type Spring = { x: number; v: number }

const pull = (s: Spring, target: number, k: number, c: number, dt: number) => {
	s.v += (-k * (s.x - target) - c * s.v) * dt
	s.x += s.v * dt
}

const resting = (s: Spring) => Math.abs(s.x) < REST && Math.abs(s.v) < REST

const depth = (pressedAt: number | null, now: number) =>
	pressedAt === null
		? 0
		: 0.55 + 0.45 * Math.min(1, (now - pressedAt) / HOLD_MS)

function createSquish(host: RefObject<HTMLElement | null>) {
	const body: Spring = { x: 0, v: 0 }
	const yolk: Spring = { x: 0, v: 0 }
	let pressedAt: number | null = null
	let frame = 0
	let last = 0

	const paint = () => {
		host.current?.style.setProperty('--squash', body.x.toFixed(3))
		host.current?.style.setProperty('--yolk', yolk.x.toFixed(3))
	}

	const settle = (value: number) => {
		body.x = yolk.x = value
		body.v = yolk.v = 0
		paint()
	}

	function step(now: number) {
		const dt = Math.min(MAX_STEP, (now - last) / 1000)
		last = now
		pull(body, depth(pressedAt, now), BODY.stiffness, BODY.damping, dt)
		pull(yolk, body.x, YOLK.stiffness, YOLK.damping, dt)
		paint()
		if (pressedAt === null && resting(body) && resting(yolk)) {
			settle(0)
			frame = 0
			return
		}
		frame = requestAnimationFrame(step)
	}

	const run = () => {
		if (frame) return
		last = performance.now()
		frame = requestAnimationFrame(step)
	}

	const press = () => {
		pressedAt = performance.now()
		if (prefersReducedMotion()) settle(STILL_SQUASH)
		else run()
	}

	const release = () => {
		if (pressedAt === null) return
		pressedAt = null
		if (prefersReducedMotion()) settle(0)
		else run()
	}

	return {
		press,
		release,
		tap: () => {
			press()
			window.setTimeout(release, TAP_MS)
		},
		stop: () => cancelAnimationFrame(frame),
	}
}

export function useSquish(host: RefObject<HTMLElement | null>) {
	const [squish] = useState(() => createSquish(host))
	useEffect(() => squish.stop, [squish])
	return squish
}
