import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacao_rain'
import { WALLET_JAR } from '@/constants/wallet_jar'
import type { ThreeStage } from '@/utils/three_stage'

import { jarToon } from './wallet_jar_model'

const { radius: R, depth: DEPTH } = WALLET_JAR

export type JarCoin = {
	mesh: THREE.Mesh
	from: number
	to: THREE.Vector3
	delay: number
	taken: boolean
	grab: THREE.Vector3
	hold: THREE.Vector3
}

const spread = (range: number) => (Math.random() - 0.5) * range

export const coinCount = (balance: number) =>
	Math.max(0, Math.min(WALLET_JAR.maxCoins, Math.round(Math.sqrt(balance) * 2.5)))

export function fillJar(stage: ThreeStage, jar: THREE.Group, total: number) {
	const face = stage.keep(new THREE.CanvasTexture(coinSprite(128, stage.css)))
	face.colorSpace = THREE.SRGBColorSpace
	const faceMaterial = stage.keep(new THREE.MeshToonMaterial({ map: face, transparent: true }))
	const coinGeometry = stage.keep(new THREE.CylinderGeometry(0.17, 0.17, 0.045, 28))
	const rimMaterial = jarToon(stage)('--color-ink')

	const coins: JarCoin[] = []
	let layer = 0
	let placed = 0
	while (placed < total) {
		const y = -DEPTH * R + 0.1 + layer * 0.075
		const radius = R * Math.sqrt(Math.max(0, 1 - (y / (DEPTH * R)) ** 2)) * 0.78
		const ring = Math.max(1, Math.floor((radius * radius) / 0.045))
		for (let k = 0; k < ring && placed < total; k++, placed++) {
			const angle = Math.random() * Math.PI * 2
			const distance = Math.sqrt(Math.random()) * radius
			const mesh = new THREE.Mesh(coinGeometry, [rimMaterial, faceMaterial, faceMaterial])
			mesh.rotation.set(spread(0.5), Math.random() * Math.PI, spread(0.5))
			jar.add(mesh)
			const to = new THREE.Vector3(Math.cos(angle) * distance, y, Math.sin(angle) * distance)
			mesh.position.copy(to)
			coins.push({
				mesh,
				from: 2.6 + Math.random() * 0.6,
				to,
				delay: placed * WALLET_JAR.gapMs,
				taken: false,
				grab: new THREE.Vector3(),
				hold: new THREE.Vector3(
					spread(0.3),
					-0.2 - Math.random() * 0.12,
					0.12 + spread(0.2)
				),
			})
		}
		layer++
	}
	return coins
}
