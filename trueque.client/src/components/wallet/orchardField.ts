import * as THREE from 'three'

import { ORCHARD } from '@/constants/orchard'
import { centeredSpread, type RandomSource } from '@/utils/seededRandom'
import type { ThreeStage } from '@/utils/threeStage'

import type { OrchardPalette } from './orchardPalette'

const FIELD = ORCHARD.fieldRadius

function addLights({ scene, color }: ThreeStage) {
	scene.add(
		new THREE.HemisphereLight(
			color('--color-estraza'),
			color('--color-cacao'),
			1.4
		)
	)
	const sun = new THREE.DirectionalLight(color('--color-amate'), 2.2)
	sun.position.set(4, 9, 6)
	sun.castShadow = true
	sun.shadow.mapSize.set(1024, 1024)
	Object.assign(sun.shadow.camera, {
		left: -10,
		right: 10,
		top: 10,
		bottom: -10,
	})
	scene.add(sun)
}

function addGround(stage: ThreeStage, palette: OrchardPalette) {
	const { keep, scene, color } = stage
	const ground = new THREE.Mesh(
		keep(new THREE.CylinderGeometry(FIELD + 0.3, FIELD + 0.6, 0.5, 72)),
		palette.toon('--color-cacao-2')
	)
	ground.position.y = -0.26
	scene.add(ground)
	const grass = new THREE.Mesh(
		keep(new THREE.CylinderGeometry(FIELD, FIELD, 0.04, 72)),
		keep(
			new THREE.MeshToonMaterial({
				color: color('--color-nopal-soft').lerp(color('--color-nopal'), 0.35),
			})
		)
	)
	grass.receiveShadow = true
	scene.add(grass)
}

function addFurrows(stage: ThreeStage, palette: OrchardPalette) {
	const furrowGeometry = stage.keep(new THREE.BoxGeometry(1, 0.07, 0.34))
	const soil = palette.toon('--color-cacao-2')
	for (const z of ORCHARD.rows) {
		const length = 2 * Math.sqrt(Math.max(0, FIELD ** 2 - z ** 2)) - 1.6
		if (length <= 0) continue
		const furrow = new THREE.Mesh(furrowGeometry, soil)
		furrow.scale.x = length
		furrow.position.set(0, 0.04, z)
		furrow.receiveShadow = true
		stage.scene.add(furrow)
	}
}

function scatter(
	scene: THREE.Scene,
	mesh: THREE.InstancedMesh,
	lift: number,
	random: RandomSource
) {
	const place = new THREE.Object3D()
	for (let k = 0; k < mesh.count; k++) {
		const angle = random() * Math.PI * 2
		const radius = Math.sqrt(random()) * (FIELD - 0.4)
		place.position.set(Math.cos(angle) * radius, lift, Math.sin(angle) * radius)
		place.rotation.set(
			centeredSpread(random, 0.4),
			random() * 6.3,
			centeredSpread(random, 0.4)
		)
		place.scale.setScalar(0.6 + random() * 0.8)
		place.updateMatrix()
		mesh.setMatrixAt(k, place.matrix)
	}
	mesh.receiveShadow = true
	scene.add(mesh)
}

export function buildOrchardField(
	stage: ThreeStage,
	palette: OrchardPalette,
	random: RandomSource
) {
	addLights(stage)
	addGround(stage, palette)
	addFurrows(stage, palette)
	const tufts = new THREE.InstancedMesh(
		stage.keep(new THREE.ConeGeometry(0.07, 0.28, 4)),
		palette.flat('--color-nopal', 0.15),
		140
	)
	const stones = new THREE.InstancedMesh(
		stage.keep(new THREE.DodecahedronGeometry(0.12)),
		palette.flat('--color-amate-3', 0.1),
		24
	)
	scatter(stage.scene, tufts, 0.12, random)
	scatter(stage.scene, stones, 0.05, random)
}

export function treeSpots(random: RandomSource) {
	const spots: THREE.Vector3[] = []
	for (const z of ORCHARD.rows)
		for (let x = -FIELD + 1.6; x <= FIELD - 1.6; x += 2.5) {
			const spot = new THREE.Vector3(
				x + centeredSpread(random, 0.9),
				0,
				z + centeredSpread(random, 0.5)
			)
			if (spot.length() < FIELD - 1.3) spots.push(spot)
		}
	const focus = new THREE.Vector3(0, 0, 0.8)
	return spots.sort((a, b) => a.distanceTo(focus) - b.distanceTo(focus))
}
