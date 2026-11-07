import type * as CANNON from 'cannon-es'
import * as THREE from 'three'

import {
	MARKET_BOUNDS,
	MAX_THROW_SPEED,
	TAP_TOLERANCE_PX,
} from '@/constants/scene/marketScene'
import { castPointer } from '@/utils/three/stage'

import type { Grab, Part, Picked } from './marketTypes'
import type { StallDamage } from './stallDamage'

type PointerOptions = {
	canvas: HTMLCanvasElement
	camera: THREE.Camera
	pickable: THREE.Object3D[]
	damage: StallDamage
	reducedMotion: boolean
}

export function createMarketPointer({
	canvas,
	camera,
	pickable,
	damage,
	reducedMotion,
}: PointerOptions) {
	const ray = new THREE.Raycaster()
	ray.params.Line = { threshold: 0.01 }
	const ndc = new THREE.Vector2()
	const dragPlane = new THREE.Plane()
	const aim = new THREE.Vector3()
	const target = new THREE.Vector3()
	let grab: Grab | null = null

	const pick = (e: PointerEvent) => {
		castPointer(e, canvas, camera, ray, ndc)
		const hit = ray.intersectObjects(pickable, true)[0]
		if (!hit) return null
		let node: THREE.Object3D | null = hit.object
		while (
			node &&
			!(node.userData as Picked).part &&
			!(node.userData as Picked).fruit
		)
			node = node.parent
		return node ? { ...(node.userData as Picked), point: hit.point } : null
	}

	const hold = (
		e: PointerEvent,
		body: CANNON.Body,
		point: THREE.Vector3,
		part?: Part
	) => {
		body.wakeUp()
		const center = new THREE.Vector3(
			body.position.x,
			body.position.y,
			body.position.z
		)
		grab = {
			body,
			part,
			offset: point.clone().sub(center),
			point: point.clone(),
			direction: ray.ray.direction.clone(),
			x: e.clientX,
			y: e.clientY,
			moved: false,
		}
		target.copy(center)
		dragPlane.setFromNormalAndCoplanarPoint(
			camera.getWorldDirection(aim).negate(),
			point
		)
		canvas.setPointerCapture(e.pointerId)
		canvas.style.cursor = 'var(--cur-grabbing)'
	}

	const pointerdown = (e: PointerEvent) => {
		const hit = pick(e)
		if (!hit) return
		if (hit.fruit) return hold(e, hit.fruit.body, hit.point)
		const part = hit.part
		if (!part || part.stall.rebuildStart) return
		if (part.loose) return hold(e, part.body, hit.point, part)
		const now = performance.now()
		const direction = ray.ray.direction.clone()
		damage.jostleNear(hit.point)
		part.stall.shake = reducedMotion ? 0 : 1
		part.stall.lastHit = now
		if (--part.hp > 0) return
		damage.loosen(part, now)
		damage.strike(part, hit.point, direction, now)
	}

	let hoverEvent: PointerEvent | null = null
	let hoverFrame = 0

	const updateHoverCursor = () => {
		hoverFrame = 0
		if (!hoverEvent || grab) return
		const hit = pick(hoverEvent)
		hoverEvent = null
		canvas.style.cursor = !hit
			? ''
			: hit.fruit || hit.part?.loose
				? 'var(--cur-grab)'
				: 'var(--cur-pointer)'
	}

	const pointermove = (e: PointerEvent) => {
		if (!grab) {
			hoverEvent = e
			if (!hoverFrame) hoverFrame = requestAnimationFrame(updateHoverCursor)
			return
		}
		if (Math.hypot(e.clientX - grab.x, e.clientY - grab.y) > TAP_TOLERANCE_PX)
			grab.moved = true
		castPointer(e, canvas, camera, ray, ndc)
		if (!ray.ray.intersectPlane(dragPlane, aim)) return
		aim.sub(grab.offset)
		target.set(
			THREE.MathUtils.clamp(
				aim.x,
				-MARKET_BOUNDS.x + 0.2,
				MARKET_BOUNDS.x - 0.2
			),
			Math.max(aim.y, 0.15),
			THREE.MathUtils.clamp(
				aim.z,
				MARKET_BOUNDS.zMin + 0.2,
				MARKET_BOUNDS.zMax - 0.2
			)
		)
	}

	const release = () => {
		if (!grab) return
		const released = grab
		grab = null
		canvas.style.cursor = 'var(--cur-grab)'
		if (released.part && !released.moved)
			return damage.strike(
				released.part,
				released.point,
				released.direction,
				performance.now()
			)
		const velocity = released.body.velocity
		const speed = velocity.length()
		if (speed > MAX_THROW_SPEED)
			velocity.scale(MAX_THROW_SPEED / speed, velocity)
		if (released.part) released.part.stall.lastHit = performance.now()
	}

	return {
		handlers: {
			pointerdown,
			pointermove,
			pointerup: release,
			pointercancel: release,
		},
		current: () => grab,
		target,
		dispose: () => cancelAnimationFrame(hoverFrame),
	}
}
