import * as THREE from 'three'

import { centeredSpread, type RandomSource } from '@/utils/seededRandom'
import type { ThreeStage } from '@/utils/threeStage'

import type { OrchardPalette } from './orchardPalette'

const POD_PROFILE = [
	[0, -0.32],
	[0.06, -0.28],
	[0.11, -0.17],
	[0.135, -0.03],
	[0.125, 0.1],
	[0.085, 0.2],
	[0.03, 0.26],
	[0, 0.27],
] as const

const BRANCH_COUNT = 3
const BRANCH_LENGTH = 1.15

export type TreeKit = ReturnType<typeof createTreeKit>

export function createTreeKit(
	{ keep }: ThreeStage,
	palette: OrchardPalette,
	random: RandomSource
) {
	const trunkGeometry = keep(new THREE.CylinderGeometry(0.12, 0.22, 1.5, 8))
	trunkGeometry.translate(0, 0.75, 0)
	const branchGeometry = keep(
		new THREE.CylinderGeometry(0.05, 0.1, BRANCH_LENGTH, 6)
	)
	branchGeometry.translate(0, BRANCH_LENGTH / 2, 0)
	const leafGeometry = keep(new THREE.IcosahedronGeometry(1, 1))
	const podGeometry = keep(
		new THREE.LatheGeometry(
			POD_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)),
			10
		)
	)
	const stemGeometry = keep(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 5))
	const bark = palette.toon('--color-cacao')
	const leaves = [
		palette.flat('--color-nopal'),
		palette.flat('--color-nopal', 0.18),
		palette.flat('--color-nopal', 0.32),
	]
	const ripe = [
		palette.flat('--color-maiz'),
		palette.flat('--color-achiote'),
		palette.flat('--color-maiz-2'),
	]
	const podHighlight = palette.flat('--color-grana')

	const addBranches = (tree: THREE.Group) => {
		const branches: THREE.Mesh[] = []
		for (let b = 0; b < BRANCH_COUNT; b++) {
			const branch = palette.outlined(branchGeometry, bark, 1.12)
			branch.position.y = 1.15 + b * 0.12
			branch.rotation.set(
				0,
				(b / BRANCH_COUNT) * Math.PI * 2 + centeredSpread(random, 0.4),
				0.75 + centeredSpread(random, 0.2),
				'YXZ'
			)
			tree.add(branch)
			branches.push(branch)
		}
		return branches
	}

	const addCanopy = (tree: THREE.Group, branches: THREE.Mesh[]) => {
		const tips = branches.map(branch =>
			new THREE.Vector3(0, BRANCH_LENGTH, 0)
				.applyEuler(branch.rotation)
				.add(branch.position)
		)
		const clusters = [
			...tips.map(tip => [tip.x, tip.y + 0.25, tip.z, 0.62] as const),
			[0, 2.45, 0, 0.82] as const,
			[
				centeredSpread(random, 0.4),
				2.95,
				centeredSpread(random, 0.4),
				0.58,
			] as const,
		]
		clusters.forEach(([x, y, z, radius], k) => {
			const cluster = palette.outlined(
				leafGeometry,
				leaves[k % leaves.length],
				1.06
			)
			cluster.position.set(x, y, z)
			cluster.scale.set(radius * 1.15, radius * 0.9, radius * 1.15)
			cluster.rotation.set(random() * 3, random() * 3, 0)
			tree.add(cluster)
		})
	}

	const makeTree = (scale: number) => {
		const tree = new THREE.Group()
		tree.rotation.y = random() * Math.PI * 2
		tree.add(palette.outlined(trunkGeometry, bark, 1.1))
		const branches = addBranches(tree)
		addCanopy(tree, branches)
		tree.userData.scale = scale
		return { tree, branches }
	}

	const hangAt = (
		parent: THREE.Object3D,
		at: THREE.Vector3,
		counterRotation?: THREE.Quaternion
	) => {
		const holder = new THREE.Group()
		holder.position.copy(at)
		if (counterRotation) holder.quaternion.copy(counterRotation)
		parent.add(holder)
		return holder
	}

	return {
		makeTree,
		hangAt,
		podGeometry,
		stemGeometry,
		bark,
		ripe,
		podHighlight,
		branchLength: BRANCH_LENGTH,
	}
}
