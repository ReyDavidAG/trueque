import { type RefObject, useEffect, useRef } from 'react'

import {
	ARM_REST_ANGLE,
	BONK_COOLDOWN_MS,
	BONK_SPEED,
	GAZE_HOLD_MS,
	HAT_ASPECT,
	HAT_BRIM_RATIO,
	HAT_SNAP_PX,
	HAT_TIP_MS,
	STAND_H,
	STAND_X,
	THROW_SPEED,
	type VendorPart,
} from '@/constants/vendor'
import {
	bindDraggable,
	createBody,
	listen,
	placeBody,
	type Point,
	sizeBody,
	stepBody,
} from '@/utils/stallPhysics'
import {
	aimPupils,
	type ArmState,
	arrivalRise,
	bindArm,
	bindStache,
	type Gaze,
	measureLayout,
	seatHat,
	type StacheState,
	stepArm,
	stepStache,
} from '@/utils/stallRig'

interface StallPhysicsOptions {
	say: RefObject<(part: VendorPart) => void>
	arrivedAt: RefObject<number | null>
	stachePulled: RefObject<boolean>
}

export function useStallPhysics({
	say,
	arrivedAt,
	stachePulled,
}: StallPhysicsOptions) {
	const roomRef = useRef<HTMLDivElement>(null)
	const vendorRef = useRef<HTMLDivElement>(null)
	const armRef = useRef<HTMLDivElement>(null)
	const hatRef = useRef<HTMLDivElement>(null)
	const goodsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const room = roomRef.current
		const vendor = vendorRef.current
		const armNode = armRef.current
		const hatNode = hatRef.current
		const goodsNode = goodsRef.current
		if (!room || !vendor || !armNode || !hatNode || !goodsNode) return
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
		const stacheNode = room.querySelector<SVGGElement>('.v-stache-g')
		const pupils = room.querySelector<SVGGElement>('.v-pupils')
		const goods = createBody()
		const hat = createBody()
		hat.attached = true
		const arm: ArmState = {
			angle: ARM_REST_ANGLE,
			spin: 0,
			held: false,
			target: ARM_REST_ANGLE,
		}
		const stache: StacheState = {
			angle: 0,
			spin: 0,
			stretch: 1,
			stretchSpeed: 0,
			held: false,
			x: 0,
			y: 0,
			moved: false,
		}
		const gaze: Gaze = { x: 0, y: 0, at: -1e9, offsetX: 0, offsetY: 0 }
		let layout = measureLayout(room, vendor)
		let lift = 0
		let placed = false
		let lastBonkAt = 0
		let tipAt = -1e9

		const toLocal = (e: PointerEvent): Point => {
			const r = room.getBoundingClientRect()
			return {
				x: e.clientX - r.left - room.clientLeft,
				y: e.clientY - r.top - room.clientTop,
			}
		}

		const measure = () => {
			layout = measureLayout(room, vendor)
			goods.width = goods.height = Math.min(
				layout.w * 0.5,
				layout.h * 0.68,
				380
			)
			hat.width = vendor.offsetWidth * 0.95
			hat.height = hat.width * HAT_ASPECT
			sizeBody(goodsNode, goods)
			sizeBody(hatNode, hat)
			if (placed) return
			goods.x = layout.w * STAND_X
			goods.y = layout.h - goods.height - STAND_H
			placed = true
		}

		const hatNearHead = () =>
			Math.hypot(
				hat.x - layout.head.x,
				hat.y + hat.height * HAT_BRIM_RATIO - layout.head.y - lift
			) < Math.max(HAT_SNAP_PX, hat.width * 0.35)

		const unbind = [
			listen(room, {
				pointermove: e => {
					Object.assign(gaze, toLocal(e))
					gaze.at = performance.now()
				},
			}),
			bindDraggable(goodsNode, goods, toLocal, {
				onDragStart: () => undefined,
				isPinned: () => false,
				onRelease: (moved, speed) => {
					if (!moved) say.current('goods')
					else if (speed > THROW_SPEED) say.current('throw')
				},
			}),
			bindDraggable(hatNode, hat, toLocal, {
				onDragStart: () => {
					if (!hat.attached) return
					hat.attached = false
					say.current('hat')
				},
				isPinned: () => hat.attached,
				onRelease: moved => {
					if (!moved && hat.attached) {
						tipAt = performance.now()
						say.current('tip')
					} else if (!moved) say.current('hat')
					if (hat.attached || !hatNearHead()) return
					hat.attached = true
					say.current('hatBack')
				},
			}),
			bindArm(
				armNode,
				arm,
				toLocal,
				() => ({ x: layout.shoulder.x, y: layout.shoulder.y + lift }),
				moved => say.current(moved ? 'arm' : 'five')
			),
			bindStache(stacheNode, stache, toLocal, stachePulled, () =>
				say.current('pull')
			),
		]

		const resize = new ResizeObserver(measure)
		resize.observe(room)
		measure()

		const bonkIfHit = (now: number, rise: number, bob: number) => {
			const speed = Math.hypot(goods.vx, goods.vy)
			const gap = Math.hypot(
				goods.x - layout.face.x,
				goods.y + goods.height / 2 - layout.face.y - bob
			)
			if (
				goods.held ||
				rise !== 1 ||
				speed <= BONK_SPEED ||
				now - lastBonkAt <= BONK_COOLDOWN_MS
			)
				return
			if (gap >= layout.face.r + goods.width * 0.35) return
			lastBonkAt = now
			goods.vx = -goods.vx * 0.5
			goods.vy = -Math.abs(goods.vy) * 0.4
			say.current('bonk')
		}

		let frame = 0
		let prev = performance.now()
		const tick = (now: number) => {
			const dt = Math.min((now - prev) / 1000, 1 / 30)
			prev = now
			const rise = arrivalRise(arrivedAt.current, now, reduced)
			const bob =
				(reduced ? 0 : Math.sin(now / 700) * 3) + (1 - rise) * layout.h * 0.75
			vendor.style.transform = `translateY(${bob}px)`
			lift = bob
			stepBody(goods, dt, layout)
			stepBody(hat, dt, layout)
			if (hat.attached)
				seatHat(hat, layout.head, bob, (now - tipAt) / HAT_TIP_MS)
			if (pupils) {
				const watching = now - gaze.at < GAZE_HOLD_MS
				const focus = watching
					? gaze
					: { x: goods.x, y: goods.y + goods.height / 2 }
				aimPupils(
					pupils,
					gaze,
					focus,
					{ x: layout.face.x, y: layout.face.y + bob },
					dt
				)
			}
			stepArm(
				arm,
				ARM_REST_ANGLE + (reduced ? 0 : Math.sin(now / 420) * 0.22),
				dt
			)
			armNode.style.transform = `rotate(${arm.angle}rad)`
			stepStache(stache, dt)
			if (stacheNode)
				stacheNode.style.transform = `rotate(${stache.angle}rad) scaleX(${stache.stretch})`
			bonkIfHit(now, rise, bob)
			placeBody(goodsNode, goods)
			placeBody(hatNode, hat)
			frame = requestAnimationFrame(tick)
		}

		const visibility = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(frame)
			if (!entry.isIntersecting) return
			prev = performance.now()
			frame = requestAnimationFrame(tick)
		})
		visibility.observe(room)

		return () => {
			cancelAnimationFrame(frame)
			visibility.disconnect()
			resize.disconnect()
			unbind.forEach(off => off())
		}
	}, [say, arrivedAt, stachePulled])

	return { roomRef, vendorRef, armRef, hatRef, goodsRef }
}
