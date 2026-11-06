import * as THREE from 'three'

import { easeInOut } from '@/utils/three/easing'

import type { TourKit, TourModel } from './tour_kit'

export function hourglassModel({ outlined, toon, glass }: TourKit): TourModel {
	const group = new THREE.Group()
	const frame = toon('--color-cacao')
	const cap = () => outlined(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 24), frame)
	const top = cap()
	top.position.y = 0.95
	const bottom = cap()
	bottom.position.y = -0.95
	const posts = [0, 1, 2].map(i => {
		const post = outlined(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), frame)
		const angle = (i / 3) * Math.PI * 2
		post.position.set(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5)
		return post
	})
	const bulb = (upper: boolean) => {
		const shell = outlined(new THREE.ConeGeometry(0.45, 0.85, 24, 1, true), glass, 0)
		shell.position.y = upper ? 0.45 : -0.45
		shell.rotation.z = upper ? Math.PI : 0
		return shell
	}
	const sand = toon('--color-maiz')
	const sandTop = outlined(new THREE.ConeGeometry(0.36, 0.6, 20), sand, 0)
	sandTop.rotation.z = Math.PI
	const sandBottom = outlined(new THREE.ConeGeometry(0.4, 0.55, 20), sand, 0)
	const hourglass = new THREE.Group()
	hourglass.add(top, bottom, ...posts, bulb(true), bulb(false), sandTop, sandBottom)
	group.add(hourglass)
	return {
		group,
		update: t => {
			const cycle = (t % 4) / 4
			const flow = Math.min(1, cycle / 0.8)
			const flip = cycle > 0.8 ? easeInOut((cycle - 0.8) / 0.2) : 0
			sandTop.scale.setScalar(Math.max(0.01, 1 - flow))
			sandTop.position.y = 0.2 + (1 - flow) * 0.12
			sandBottom.scale.setScalar(Math.max(0.01, flow))
			sandBottom.position.y = -0.9 + flow * 0.27
			hourglass.rotation.z = flip * Math.PI
			hourglass.rotation.y = t * 0.5
		},
	}
}
