import * as CANNON from 'cannon-es'
import type * as THREE from 'three'

import { createHenKit, type Hen, peck } from '@/components/scenes/hen/henKit'
import { createHenPalette } from '@/components/scenes/hen/henPalette'
import {
	HENS,
	MARKET_BOUNDS,
	stallCenterX,
} from '@/constants/scene/marketScene'
import type { Stage } from '@/utils/three/stage'

type Walker = {
	hen: Hen
	body: CANNON.Body
	heading: number
	pauseUntil: number
}

const randomBetween = (min: number, max: number) =>
	min + Math.random() * (max - min)

export function createMarketHens(
	stage: Stage,
	scene: THREE.Scene,
	world: CANNON.World,
	stallCount: number
) {
	const kit = createHenKit(stage, createHenPalette(stage), Math.random)

	const blocked = (x: number, z: number) =>
		Array.from({ length: stallCount }).some(
			(_, i) => Math.abs(x - stallCenterX(i)) < 1.2 && Math.abs(z) < 0.62
		)
	const inside = (x: number, z: number) =>
		Math.abs(x) < MARKET_BOUNDS.x - 0.4 &&
		z > MARKET_BOUNDS.zMin + 0.35 &&
		z < MARKET_BOUNDS.zMax - 0.3

	const freeSpot = () => {
		for (let tries = 0; tries < 60; tries++) {
			const x = randomBetween(-MARKET_BOUNDS.x + 0.6, MARKET_BOUNDS.x - 0.6)
			const z = randomBetween(0.75, MARKET_BOUNDS.zMax - 0.45)
			if (!blocked(x, z)) return { x, z }
		}
		return { x: 0, z: MARKET_BOUNDS.zMax - 0.5 }
	}

	const walkers: Walker[] = Array.from({ length: HENS.count }, () => {
		const hen = kit.makeHen(HENS.scale)
		const { x, z } = freeSpot()
		const body = new CANNON.Body({
			type: CANNON.Body.KINEMATIC,
			shape: new CANNON.Sphere(HENS.radius),
		})
		body.position.set(x, HENS.radius, z)
		world.addBody(body)
		hen.group.position.set(x, 0, z)
		scene.add(hen.group)
		return { hen, body, heading: Math.random() * Math.PI * 2, pauseUntil: 0 }
	})

	const step = (dt: number, seconds: number, still: boolean) => {
		for (const walker of walkers) {
			const { hen, body } = walker
			const pecking = still || seconds < walker.pauseUntil
			if (pecking) body.velocity.setZero()
			else {
				walker.heading += (Math.random() - 0.5) * HENS.turnRate * dt * 2
				const vx = Math.cos(walker.heading) * HENS.speed
				const vz = Math.sin(walker.heading) * HENS.speed
				const ahead = 0.35
				const nx = body.position.x + Math.cos(walker.heading) * ahead
				const nz = body.position.z + Math.sin(walker.heading) * ahead
				if (!inside(nx, nz) || blocked(nx, nz)) {
					walker.heading += Math.PI * randomBetween(0.5, 1)
					body.velocity.setZero()
				} else body.velocity.set(vx, 0, vz)
				if (Math.random() < HENS.pauseChance * dt)
					walker.pauseUntil = seconds + randomBetween(0.8, 2)
			}
			const walking = !pecking
			const gait = seconds * 11 + hen.phase
			hen.group.position.set(
				body.position.x,
				walking ? Math.abs(Math.sin(gait)) * 0.025 : 0,
				body.position.z
			)
			hen.group.rotation.y = -walker.heading
			const stride = walking ? Math.sin(gait) * 0.55 : 0
			hen.legs[0].rotation.z = stride
			hen.legs[1].rotation.z = -stride
			if (walking) {
				hen.body.rotation.z = Math.sin(gait * 2) * 0.04
				hen.head.rotation.z = Math.sin(gait) * 0.22
			}
		}
		if (!still)
			peck(
				walkers.filter(w => seconds < w.pauseUntil).map(w => w.hen),
				seconds
			)
	}

	const nestingSpot = () => {
		const { body } = walkers[Math.floor(Math.random() * walkers.length)]
		return { x: body.position.x, z: body.position.z }
	}

	return { step, nestingSpot }
}
