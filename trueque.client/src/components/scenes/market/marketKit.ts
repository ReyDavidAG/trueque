import type * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacaoRain'
import type { Stage } from '@/utils/three/stage'

import type { Triple } from './marketTypes'

function createGeometries(keep: Stage['keep']) {
	return {
		post: keep(new THREE.CylinderGeometry(0.07, 0.07, 2.08, 10)),
		counter: keep(new THREE.BoxGeometry(1.6, 0.8, 0.7)),
		top: keep(new THREE.BoxGeometry(1.62, 0.06, 0.8)),
		awning: keep(new THREE.BoxGeometry(2.2, 0.12, 1.1)),
		stripe: keep(new THREE.BoxGeometry(0.3, 0.13, 1.11)),
		scallop: keep(new THREE.SphereGeometry(0.11, 12, 8)),
		sign: keep(new THREE.BoxGeometry(0.9, 0.5, 0.06)),
		string: keep(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 4)),
		ball: keep(new THREE.SphereGeometry(1, 18, 14)),
		stem: keep(new THREE.CylinderGeometry(0.015, 0.02, 0.08, 5)),
		coin: keep(new THREE.CylinderGeometry(0.13, 0.13, 0.045, 24)),
		crate: keep(new THREE.BoxGeometry(0.36, 0.26, 0.28)),
		slat: keep(new THREE.BoxGeometry(0.37, 0.03, 0.29)),
		tie: keep(new THREE.CylinderGeometry(0.05, 0.07, 0.08, 8)),
		cap: keep(new THREE.SphereGeometry(0.095, 12, 8)),
		foot: keep(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 10)),
		lipLong: keep(new THREE.BoxGeometry(1.62, 0.07, 0.03)),
		lipShort: keep(new THREE.BoxGeometry(0.03, 0.07, 0.8)),
	}
}

export function createMarketKit(
	stage: Stage,
	scene: THREE.Scene,
	world: CANNON.World
) {
	const { keep, color, css, cssVar } = stage

	const toonCache = new Map<string, THREE.MeshToonMaterial>()
	const toon = (name: string) => {
		const found = toonCache.get(name)
		if (found) return found
		const made = keep(new THREE.MeshToonMaterial({ color: color(name) }))
		toonCache.set(name, made)
		return made
	}

	const edgeCache = new Map<THREE.BufferGeometry, THREE.EdgesGeometry>()
	const outline = (geometry: THREE.BufferGeometry) => {
		const found = edgeCache.get(geometry)
		if (found) return found
		const made = keep(new THREE.EdgesGeometry(geometry))
		edgeCache.set(geometry, made)
		return made
	}

	const lineMaterial = keep(
		new THREE.LineBasicMaterial({ color: color('--color-ink') })
	)
	const coinTexture = keep(new THREE.CanvasTexture(coinSprite(128, css)))
	coinTexture.colorSpace = THREE.SRGBColorSpace
	const coinFace = keep(new THREE.MeshToonMaterial({ map: coinTexture }))
	const geometry = createGeometries(keep)

	const decorate = (
		parent: THREE.Object3D,
		shape: THREE.BufferGeometry,
		material: THREE.Material,
		[x, y, z]: Triple,
		edged = false
	) => {
		const detail = new THREE.Mesh(shape, material)
		detail.position.set(x, y, z)
		detail.castShadow = true
		if (edged) detail.add(new THREE.LineSegments(outline(shape), lineMaterial))
		parent.add(detail)
		return detail
	}

	return {
		scene,
		world,
		keep,
		cssVar,
		toon,
		outline,
		lineMaterial,
		coinFace,
		geometry,
		decorate,
	}
}

export type MarketKit = ReturnType<typeof createMarketKit>
