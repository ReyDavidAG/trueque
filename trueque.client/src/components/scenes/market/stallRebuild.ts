import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import {
	REBUILD_DELAY_MS,
	REBUILD_DURATION_MS,
} from '@/constants/scene/marketScene'

import { copyBodyToMesh, copyMeshToBody, spread } from './marketMath'
import type { Fruit, Part, Stall } from './marketTypes'

const COUNTER_INDEX = 4
const AABB_MARGIN = 0.02

const isInside = (part: Part, at: CANNON.Vec3) => {
	const { lowerBound: lo, upperBound: hi } = part.body.aabb
	return (
		at.x > lo.x - AABB_MARGIN &&
		at.x < hi.x + AABB_MARGIN &&
		at.y > lo.y - AABB_MARGIN &&
		at.y < hi.y + AABB_MARGIN &&
		at.z > lo.z - AABB_MARGIN &&
		at.z < hi.z + AABB_MARGIN
	)
}

function ejectTrappedFruit(stall: Stall, fruits: Fruit[]) {
	const centerX = stall.parts[COUNTER_INDEX].home.x
	for (const f of fruits) {
		const body = f.body
		if (!stall.parts.some(p => isInside(p, body.position))) continue
		const front = body.position.z > -0.1
		body.position.set(
			THREE.MathUtils.clamp(body.position.x, centerX - 0.9, centerX + 0.9),
			0.3,
			front ? 0.75 + Math.random() * 0.4 : -0.75
		)
		body.velocity.set(spread(0.6), 0.5, front ? 0.6 : -0.3)
		body.angularVelocity.setZero()
		body.wakeUp()
	}
}

function freeze(part: Part) {
	const body = part.body
	body.type = CANNON.Body.STATIC
	body.mass = 0
	body.updateMassProperties()
	body.velocity.setZero()
	body.angularVelocity.setZero()
	body.collisionResponse = true
	body.aabbNeedsUpdate = true
	body.updateAABB()
	Object.assign(part, { loose: false, hp: part.maxHp })
}

function startRebuild(stall: Stall, now: number) {
	stall.rebuildStart = now
	for (const p of stall.parts) {
		if (!p.loose) continue
		p.from.copy(p.mesh.position)
		p.fromQuaternion.copy(p.mesh.quaternion)
		p.body.type = CANNON.Body.KINEMATIC
		p.body.collisionResponse = false
		p.body.velocity.setZero()
		p.body.angularVelocity.setZero()
	}
}

const SHAKE_DECAY_PER_SECOND = 4

function shake(stall: Stall, now: number, dt: number) {
	if (!stall.shake) return
	stall.shake = Math.max(0, stall.shake - dt * SHAKE_DECAY_PER_SECOND)
	const offset = Math.sin(now * 0.06) * 0.04 * stall.shake
	for (const p of stall.parts)
		if (!p.loose) p.mesh.position.x = p.home.x + offset
}

export function createStallRebuild(fruits: Fruit[], wakeAll: () => void) {
	const animateRebuild = (stall: Stall, now: number) => {
		const t = Math.min(1, (now - stall.rebuildStart) / REBUILD_DURATION_MS)
		const eased = 1 - (1 - t) ** 3
		for (const p of stall.parts) {
			if (!p.loose) continue
			p.mesh.position.lerpVectors(p.from, p.home, eased)
			p.mesh.quaternion.slerpQuaternions(
				p.fromQuaternion,
				p.homeQuaternion,
				eased
			)
			copyMeshToBody(p.mesh, p.body)
		}
		if (t < 1) return
		stall.rebuildStart = 0
		for (const p of stall.parts) if (p.loose) freeze(p)
		stall.lastHit = 0
		ejectTrappedFruit(stall, fruits)
		wakeAll()
	}

	return (stall: Stall, now: number, dt: number, isHeld: boolean) => {
		if (stall.rebuildStart) return animateRebuild(stall, now)
		if (isHeld) stall.lastHit = now
		if (
			stall.parts.some(p => p.loose) &&
			now - stall.lastHit > REBUILD_DELAY_MS
		)
			return startRebuild(stall, now)
		for (const p of stall.parts) if (p.loose) copyBodyToMesh(p.body, p.mesh)
		shake(stall, now, dt)
	}
}
