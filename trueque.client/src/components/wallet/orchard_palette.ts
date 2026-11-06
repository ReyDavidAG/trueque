import * as THREE from 'three'

import { outlineMaterial, type ThreeStage } from '@/utils/three_stage'

export type OrchardPalette = ReturnType<typeof createOrchardPalette>

export function createOrchardPalette(stage: ThreeStage) {
	const { keep, color } = stage
	const outline = outlineMaterial(stage)

	const toon = (token: string) =>
		keep(new THREE.MeshToonMaterial({ color: color(token) }))

	const flat = (token: string, inkMix = 0) =>
		keep(
			new THREE.MeshToonMaterial({
				color: color(token).lerp(color('--color-ink'), inkMix),
				flatShading: true,
			})
		)

	const outlined = (
		geometry: THREE.BufferGeometry,
		material: THREE.Material,
		lineScale = 1.06
	) => {
		const mesh = new THREE.Mesh(geometry, material)
		mesh.castShadow = true
		const line = new THREE.Mesh(geometry, outline)
		line.scale.setScalar(lineScale)
		mesh.add(line)
		return mesh
	}

	return { toon, flat, outlined }
}
