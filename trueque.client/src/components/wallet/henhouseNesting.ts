import * as THREE from 'three'

import type { Hen, HenKit } from '@/components/scenes/hen/henKit'
import { HENHOUSE } from '@/constants/henhouse'
import type { HenFlock } from '@/types/henhouseType'
import type { RandomSource } from '@/utils/seededRandom'

export type Growth = { obj: THREE.Object3D; delay: number; size: number }

type Nesting = {
	kit: HenKit
	random: RandomSource
	growths: Growth[]
	eggs: THREE.Mesh[]
}

function layEggs(
	nesting: Nesting,
	nest: THREE.Group,
	flock: HenFlock,
	henIndex: number
) {
	const { kit, random, growths, eggs } = nesting
	let slot = 0
	for (const move of flock.moves) {
		const count = Math.ceil(move.amount / HENHOUSE.cacaosPerEgg)
		for (let p = 0; p < count && slot < HENHOUSE.maxEggsPerNest; p++) {
			const part = Math.min(
				HENHOUSE.cacaosPerEgg,
				move.amount - p * HENHOUSE.cacaosPerEgg
			)
			const egg = kit.makeEgg(slot)
			const spot = kit.eggSpot(slot)
			egg.position.copy(spot)
			egg.rotation.set(
				(random() - 0.5) * 0.5,
				random() * 3,
				spot.y < 0.3 ? Math.PI / 2.4 : (random() - 0.5) * 0.4
			)
			egg.userData = { move, part, index: p + 1, count, base: egg.material }
			nest.add(egg)
			eggs.push(egg)
			growths.push({
				obj: egg,
				delay:
					henIndex * HENHOUSE.henDelayMs + 600 + slot * HENHOUSE.eggDelayMs,
				size: 0.8 + 0.35 * (part / HENHOUSE.cacaosPerEgg),
			})
			slot++
		}
	}
}

export function settleHens(
	scene: THREE.Scene,
	kit: HenKit,
	random: RandomSource,
	flocks: HenFlock[],
	spots: THREE.Vector3[]
) {
	const nesting: Nesting = { kit, random, growths: [], eggs: [] }
	const anchors: THREE.Vector3[] = []
	const hens: Hen[] = []
	const top = flocks[0].total

	flocks.forEach((flock, i) => {
		const spot = spots[i] ?? new THREE.Vector3(i * 2.4 - 4, 0, 0)
		const scale = 0.85 + 0.45 * (flock.total / top)
		const nest = kit.makeNest()
		nest.position.copy(spot)
		const hen = kit.makeHen(1)
		hen.group.position.y = -0.14
		for (const leg of hen.legs) leg.visible = false
		nest.add(hen.group)
		nest.userData.scale = scale
		scene.add(nest)
		hens.push(hen)
		nesting.growths.push({
			obj: nest,
			delay: i * HENHOUSE.henDelayMs,
			size: scale,
		})
		anchors.push(new THREE.Vector3(spot.x, 1.6 * scale, spot.z))
		layEggs(nesting, nest, flock, i)
	})

	spots
		.slice(flocks.length, flocks.length + HENHOUSE.fillerHens)
		.forEach((spot, k) => {
			const scale = 0.55 + random() * 0.2
			const hen = kit.makeHen(1)
			hen.group.position.copy(spot)
			scene.add(hen.group)
			hens.push(hen)
			nesting.growths.push({
				obj: hen.group,
				delay: 200 + k * 60,
				size: scale,
			})
		})

	return {
		growths: nesting.growths,
		eggs: nesting.eggs,
		anchors,
		hens,
	}
}
