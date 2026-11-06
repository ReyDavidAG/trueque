import * as THREE from 'three'

import { ORCHARD } from '@/constants/orchard'
import type { OrchardTree } from '@/types/orchardType'
import type { Movement } from '@/types/walletType'
import type { RandomSource } from '@/utils/seededRandom'

import type { OrchardPalette } from './orchardPalette'
import type { TreeKit } from './orchardTreeKit'

export type Growth = { obj: THREE.Object3D; delay: number; size: number }

type Planting = {
	scene: THREE.Scene
	palette: OrchardPalette
	kit: TreeKit
	random: RandomSource
	growths: Growth[]
	pods: THREE.Mesh[]
}

function podSlots(kit: TreeKit, tree: THREE.Group, branches: THREE.Mesh[]) {
	const slots: (() => THREE.Group)[] = []
	for (let k = 0; k < 8; k++) {
		const angle = k * 2.4
		const height = 0.42 + (k % 4) * 0.22
		slots.push(() =>
			kit.hangAt(
				tree,
				new THREE.Vector3(
					Math.cos(angle) * 0.22,
					height,
					Math.sin(angle) * 0.22
				)
			)
		)
	}
	for (const branch of branches)
		for (const along of [0.32, 0.55, 0.78])
			slots.push(() =>
				kit.hangAt(
					branch,
					new THREE.Vector3(0.07, kit.branchLength * along, 0),
					branch.quaternion.clone().invert()
				)
			)
	return slots
}

function hangPods(
	planting: Planting,
	slots: (() => THREE.Group)[],
	moves: Movement[],
	treeIndex: number
) {
	const { kit, palette, random, growths, pods } = planting
	let slot = 0
	let order = 0
	for (const move of moves) {
		const count = Math.ceil(move.amount / ORCHARD.cacaosPerPod)
		for (let p = 0; p < count && slot < slots.length; p++) {
			const part = Math.min(
				ORCHARD.cacaosPerPod,
				move.amount - p * ORCHARD.cacaosPerPod
			)
			const holder = slots[slot++]()
			const size = 0.75 + 0.35 * (part / ORCHARD.cacaosPerPod)
			const body = palette.outlined(
				kit.podGeometry,
				kit.ripe[(slot + treeIndex) % kit.ripe.length],
				1.1
			)
			body.scale.setScalar(size)
			body.position.y = -0.3 * size
			body.rotation.y = random() * 3
			body.userData = { move, part, index: p + 1, count, base: body.material }
			const stem = new THREE.Mesh(kit.stemGeometry, kit.bark)
			stem.position.y = -0.02
			holder.add(body, stem)
			pods.push(body)
			growths.push({
				obj: holder,
				delay: treeIndex * ORCHARD.treeDelayMs + 500 + order++ * 70,
				size: 1,
			})
		}
	}
}

export function plantOrchard(
	scene: THREE.Scene,
	palette: OrchardPalette,
	kit: TreeKit,
	random: RandomSource,
	trees: OrchardTree[],
	spots: THREE.Vector3[]
) {
	const planting: Planting = {
		scene,
		palette,
		kit,
		random,
		growths: [],
		pods: [],
	}
	const anchors: THREE.Vector3[] = []
	const top = trees[0].total

	trees.forEach((source, i) => {
		const spot = spots[i] ?? new THREE.Vector3(i * 2.4 - 4, 0, 0)
		const scale = 0.75 + 0.45 * (source.total / top)
		const { tree, branches } = kit.makeTree(scale)
		tree.position.copy(spot)
		scene.add(tree)
		planting.growths.push({
			obj: tree,
			delay: i * ORCHARD.treeDelayMs,
			size: scale,
		})
		anchors.push(new THREE.Vector3(spot.x, 3.45 * scale, spot.z))
		hangPods(planting, podSlots(kit, tree, branches), source.moves, i)
	})

	spots
		.slice(trees.length, trees.length + ORCHARD.fillerTrees)
		.forEach((spot, k) => {
			const scale = 0.42 + random() * 0.22
			const { tree } = kit.makeTree(scale)
			tree.position.copy(spot)
			scene.add(tree)
			planting.growths.push({ obj: tree, delay: 200 + k * 60, size: scale })
		})

	return { growths: planting.growths, pods: planting.pods, anchors }
}
