import {
	BOUNCE,
	GRAVITY,
	MAX_THROW_SPEED,
	STAND_H,
	STAND_HALF_W,
	STAND_X,
	TAP_TOLERANCE_PX,
} from '@/constants/vendor'

export interface Point {
	x: number
	y: number
}

export interface PhysicsBody extends Point {
	vx: number
	vy: number
	angle: number
	spin: number
	width: number
	height: number
	held: boolean
	attached: boolean
	lastX: number
	lastY: number
	lastAt: number
}

export interface RoomSize {
	w: number
	h: number
}

export type ToLocal = (e: PointerEvent) => Point

type PointerEventName =
	| 'pointerdown'
	| 'pointermove'
	| 'pointerup'
	| 'pointercancel'
	| 'lostpointercapture'

export const createBody = (): PhysicsBody => ({
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	angle: 0,
	spin: 0,
	width: 0,
	height: 0,
	held: false,
	attached: false,
	lastX: 0,
	lastY: 0,
	lastAt: 0,
})

export function listen(
	node: EventTarget | null,
	handlers: Partial<Record<PointerEventName, (e: PointerEvent) => void>>
) {
	if (!node) return () => undefined
	const entries = Object.entries(handlers) as [string, EventListener][]
	entries.forEach(([type, handler]) => node.addEventListener(type, handler))
	return () =>
		entries.forEach(([type, handler]) =>
			node.removeEventListener(type, handler)
		)
}

export function stepBody(body: PhysicsBody, dt: number, room: RoomSize) {
	if (body.held || body.attached) return
	body.vy += GRAVITY * dt
	body.x += body.vx * dt
	body.y += body.vy * dt
	body.angle += body.spin * dt
	const onStand = Math.abs(body.x - room.w * STAND_X) < room.w * STAND_HALF_W
	const floor = room.h - body.height - (onStand ? STAND_H : 0)
	if (body.y > floor) {
		body.y = floor
		body.vy = Math.abs(body.vy) < 120 ? 0 : -body.vy * BOUNCE
		body.vx *= 0.82
		body.spin *= 0.6
		body.angle *= 0.85
	}
	if (body.y < -room.h * 0.4) {
		body.y = -room.h * 0.4
		body.vy = Math.abs(body.vy) * BOUNCE
	}
	if (body.x < body.width / 2) {
		body.x = body.width / 2
		body.vx = Math.abs(body.vx) * 0.5
	}
	if (body.x > room.w - body.width / 2) {
		body.x = room.w - body.width / 2
		body.vx = -Math.abs(body.vx) * 0.5
	}
}

export const placeBody = (node: HTMLElement, body: PhysicsBody) => {
	node.style.transform = `translate(${body.x - body.width / 2}px, ${body.y}px) rotate(${body.angle}rad)`
}

export const sizeBody = (node: HTMLElement, body: PhysicsBody) => {
	node.style.width = `${body.width}px`
	node.style.height = `${body.height}px`
}

export interface DragHandlers {
	onDragStart: () => void
	isPinned: () => boolean
	onRelease: (moved: boolean, speed: number) => void
}

export function bindDraggable(
	node: HTMLElement,
	body: PhysicsBody,
	toLocal: ToLocal,
	handlers: DragHandlers
) {
	let start: Point = { x: 0, y: 0 }
	let offset: Point = { x: 0, y: 0 }
	let moved = false
	const press = (e: PointerEvent) => {
		e.preventDefault()
		node.setPointerCapture(e.pointerId)
		const p = toLocal(e)
		start = p
		moved = false
		offset = { x: p.x - body.x, y: p.y - body.y }
		body.held = true
		body.lastX = p.x
		body.lastY = p.y
		body.lastAt = performance.now()
		body.vx = body.vy = 0
	}
	const drag = (e: PointerEvent) => {
		if (!body.held) return
		const p = toLocal(e)
		if (!moved && Math.hypot(p.x - start.x, p.y - start.y) > TAP_TOLERANCE_PX) {
			moved = true
			handlers.onDragStart()
		}
		if (handlers.isPinned()) return
		const now = performance.now()
		const dt = Math.max(1, now - body.lastAt) / 1000
		body.vx = (p.x - body.lastX) / dt
		body.vy = (p.y - body.lastY) / dt
		body.lastX = p.x
		body.lastY = p.y
		body.lastAt = now
		body.x = p.x - offset.x
		body.y = p.y - offset.y
	}
	const release = () => {
		if (!body.held) return
		body.held = false
		if (performance.now() - body.lastAt > 80) body.vx = body.vy = 0
		const speed = Math.hypot(body.vx, body.vy)
		if (speed > MAX_THROW_SPEED) {
			body.vx *= MAX_THROW_SPEED / speed
			body.vy *= MAX_THROW_SPEED / speed
		}
		body.spin = body.vx * 0.01
		handlers.onRelease(moved, speed)
	}
	return listen(node, {
		pointerdown: press,
		pointermove: drag,
		pointerup: release,
		pointercancel: release,
		lostpointercapture: release,
	})
}
