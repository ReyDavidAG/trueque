import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { spread, toCannonVec } from './marketMath'
import type { Fruit, Part } from './marketTypes'

export function createStallDamage(fruits: Fruit[], parts: Part[]) {
	const wakeAll = () => {
		for (const f of fruits) f.body.wakeUp()
		for (const p of parts) if (p.loose) p.body.wakeUp()
	}

	const lostSupport = (part: Part) =>
		!part.loose &&
		part.needs.length > 0 &&
		part.needs.filter(n => !n.loose).length < part.minSupports

	const loosen = (part: Part, now: number) => {
		if (part.loose) return
		part.loose = true
		part.mesh.position.copy(part.home)
		const body = part.body
		body.position.copy(toCannonVec(part.home))
		body.type = CANNON.Body.DYNAMIC
		body.mass = part.mass
		body.updateMassProperties()
		body.wakeUp()
		part.stall.lastHit = now
		for (const other of part.stall.parts)
			if (lostSupport(other)) {
				loosen(other, now)
				other.body.angularVelocity.set(spread(2), spread(2), spread(2))
			}
		wakeAll()
	}

	const strike = (
		part: Part,
		point: THREE.Vector3,
		direction: THREE.Vector3,
		now: number
	) => {
		const body = part.body
		const push = direction
			.clone()
			.multiplyScalar(5.5)
			.add(new THREE.Vector3(0, 3, 0))
			.multiplyScalar(body.mass)
		body.wakeUp()
		body.applyImpulse(
			toCannonVec(push),
			new CANNON.Vec3(
				point.x - body.position.x,
				point.y - body.position.y,
				point.z - body.position.z
			)
		)
		part.stall.lastHit = now
		wakeAll()
	}

	const jostleNear = (point: THREE.Vector3) => {
		for (const f of fruits)
			if (f.mesh.position.distanceTo(point) < 1) {
				f.body.wakeUp()
				f.body.velocity.vadd(
					new CANNON.Vec3(spread(0.3), 0.6 + Math.random() * 0.5, spread(0.3)),
					f.body.velocity
				)
			}
	}

	return { wakeAll, loosen, strike, jostleNear }
}

export type StallDamage = ReturnType<typeof createStallDamage>
