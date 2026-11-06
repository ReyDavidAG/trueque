import {
	ARM_DAMPING,
	ARM_STIFFNESS,
	HAT_BRIM_RATIO,
	PUPIL_TRAVEL_PX,
	TAP_TOLERANCE_PX,
	VENDOR_ARRIVE_MS,
} from '@/constants/vendor'

import {
	listen,
	type PhysicsBody,
	type Point,
	type ToLocal,
} from './stallPhysics'

export interface ArmState {
	angle: number
	spin: number
	held: boolean
	target: number
}

export interface StacheState extends Point {
	angle: number
	spin: number
	stretch: number
	stretchSpeed: number
	held: boolean
	moved: boolean
}

export interface Gaze extends Point {
	at: number
	offsetX: number
	offsetY: number
}

export interface StallLayout {
	w: number
	h: number
	head: Point
	face: Point & { r: number }
	shoulder: Point
}

export function measureLayout(
	room: HTMLElement,
	vendor: HTMLElement
): StallLayout {
	const left = vendor.offsetLeft
	const top = vendor.offsetTop
	const width = vendor.offsetWidth
	const height = vendor.offsetHeight
	return {
		w: room.clientWidth,
		h: room.clientHeight,
		head: { x: left + width * 0.5, y: top + height * 0.183 },
		face: { x: left + width * 0.5, y: top + height * 0.31, r: width * 0.24 },
		shoulder: { x: left + width * 0.79, y: top + height * 0.614 },
	}
}

export function arrivalRise(
	arrivedAt: number | null,
	now: number,
	reduced: boolean
) {
	const since =
		arrivedAt == null ? 0 : reduced ? 1 : (now - arrivedAt) / VENDOR_ARRIVE_MS
	const t = Math.min(1, since)
	return 1 - (1 - t) ** 3
}

export function seatHat(
	hat: PhysicsBody,
	head: Point,
	bob: number,
	tipProgress: number
) {
	const raise = tipProgress < 1 ? Math.sin(Math.PI * tipProgress) : 0
	hat.x = head.x
	hat.y = head.y - hat.height * HAT_BRIM_RATIO + bob - raise * hat.height * 0.7
	hat.angle = -raise * 0.3
	hat.vx = hat.vy = hat.spin = 0
}

export function aimPupils(
	node: SVGGElement,
	gaze: Gaze,
	focus: Point,
	face: Point,
	dt: number
) {
	const tx = focus.x - face.x
	const ty = focus.y - face.y
	const distance = Math.hypot(tx, ty) || 1
	const reach = Math.min(1, distance / 120) * PUPIL_TRAVEL_PX
	const ease = Math.min(1, dt * 10)
	gaze.offsetX += ((tx / distance) * reach - gaze.offsetX) * ease
	gaze.offsetY += ((ty / distance) * reach - gaze.offsetY) * ease
	node.style.transform = `translate(${gaze.offsetX}px, ${gaze.offsetY}px)`
}

export function stepArm(arm: ArmState, rest: number, dt: number) {
	if (arm.held) {
		arm.angle += (arm.target - arm.angle) * Math.min(1, dt * 18)
		return
	}
	arm.spin +=
		(-(arm.angle - rest) * ARM_STIFFNESS - arm.spin * ARM_DAMPING) * dt
	arm.angle += arm.spin * dt
}

export function stepStache(stache: StacheState, dt: number) {
	if (stache.held) return
	stache.spin += (-stache.angle * 120 - stache.spin * 6) * dt
	stache.angle += stache.spin * dt
	stache.stretchSpeed +=
		(-(stache.stretch - 1) * 160 - stache.stretchSpeed * 7) * dt
	stache.stretch += stache.stretchSpeed * dt
}

export function bindArm(
	node: HTMLElement,
	arm: ArmState,
	toLocal: ToLocal,
	pivot: () => Point,
	onRelease: (moved: boolean) => void
) {
	let start: Point = { x: 0, y: 0 }
	let moved = false
	const press = (e: PointerEvent) => {
		e.preventDefault()
		node.setPointerCapture(e.pointerId)
		start = toLocal(e)
		moved = false
		arm.held = true
	}
	const drag = (e: PointerEvent) => {
		if (!arm.held) return
		const p = toLocal(e)
		if (Math.hypot(p.x - start.x, p.y - start.y) > TAP_TOLERANCE_PX)
			moved = true
		const origin = pivot()
		arm.target = Math.atan2(-(p.x - origin.x), p.y - origin.y)
	}
	const release = () => {
		if (!arm.held) return
		arm.held = false
		if (!moved) arm.spin += 14
		onRelease(moved)
	}
	return listen(node, {
		pointerdown: press,
		pointermove: drag,
		pointerup: release,
		pointercancel: release,
	})
}

export function bindStache(
	node: SVGGElement | null,
	stache: StacheState,
	toLocal: ToLocal,
	pulled: { current: boolean },
	onPull: () => void
) {
	const press = (e: PointerEvent) => {
		if (!node) return
		node.setPointerCapture(e.pointerId)
		const p = toLocal(e)
		stache.held = true
		stache.moved = false
		stache.x = p.x
		stache.y = p.y
		pulled.current = false
	}
	const drag = (e: PointerEvent) => {
		if (!stache.held) return
		const p = toLocal(e)
		const dx = p.x - stache.x
		const dy = p.y - stache.y
		if (Math.hypot(dx, dy) > TAP_TOLERANCE_PX) {
			stache.moved = true
			pulled.current = true
		}
		stache.angle = Math.max(-0.6, Math.min(0.6, dx * 0.012))
		stache.stretch = 1 + Math.min(0.7, Math.hypot(dx, dy) * 0.006)
	}
	const release = () => {
		if (!stache.held) return
		stache.held = false
		if (stache.moved) onPull()
	}
	return listen(node, {
		pointerdown: press,
		pointermove: drag,
		pointerup: release,
		pointercancel: release,
	})
}
