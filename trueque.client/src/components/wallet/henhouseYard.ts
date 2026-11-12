import * as THREE from 'three'

import type { HenPalette } from '@/components/scenes/hen/henPalette'
import { HENHOUSE } from '@/constants/henhouse'
import { centeredSpread, type RandomSource } from '@/utils/seededRandom'
import type { ThreeStage } from '@/utils/threeStage'

const YARD = HENHOUSE.yardRadius
const COOP_Z = -YARD + 2.2
const POSTS = 34

function addLights({ scene, color }: ThreeStage) {
	scene.add(
		new THREE.HemisphereLight(
			color('--color-estraza'),
			color('--color-carton-sombra'),
			1.4
		)
	)
	const sun = new THREE.DirectionalLight(color('--color-estraza'), 2.2)
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

function addGround({ keep, scene }: ThreeStage, palette: HenPalette) {
	const base = new THREE.Mesh(
		keep(new THREE.CylinderGeometry(YARD + 0.3, YARD + 0.6, 0.5, 72)),
		palette.toon('--color-carton-sombra')
	)
	base.position.y = -0.26
	const straw = new THREE.Mesh(
		keep(new THREE.CylinderGeometry(YARD, YARD, 0.04, 72)),
		palette.toon('--color-carton')
	)
	straw.receiveShadow = true
	scene.add(base, straw)
}

function addFence(stage: ThreeStage, palette: HenPalette) {
	const wood = palette.flat('--color-cacao-2')
	const posts = new THREE.InstancedMesh(
		stage.keep(new THREE.BoxGeometry(0.14, 0.9, 0.14)),
		wood,
		POSTS
	)
	const place = new THREE.Object3D()
	for (let k = 0; k < POSTS; k++) {
		const angle = (k / POSTS) * Math.PI * 2
		place.position.set(Math.cos(angle) * YARD, 0.45, Math.sin(angle) * YARD)
		place.rotation.set(0, -angle, 0)
		place.updateMatrix()
		posts.setMatrixAt(k, place.matrix)
	}
	posts.castShadow = true
	const railGeometry = stage.keep(new THREE.TorusGeometry(YARD, 0.04, 6, 96))
	for (const y of [0.35, 0.72]) {
		const rail = new THREE.Mesh(railGeometry, wood)
		rail.rotation.x = Math.PI / 2
		rail.position.y = y
		stage.scene.add(rail)
	}
	stage.scene.add(posts)
}

function addCoop(stage: ThreeStage, palette: HenPalette) {
	const coop = new THREE.Group()
	const walls = palette.outlined(
		stage.keep(new THREE.BoxGeometry(2.6, 1.5, 1.6)),
		palette.toon('--color-estraza'),
		1.02
	)
	walls.position.y = 0.75
	const roofGeometry = stage.keep(new THREE.CylinderGeometry(1.2, 1.2, 3, 3))
	const roof = palette.outlined(
		roofGeometry,
		palette.toon('--color-tinta'),
		1.03
	)
	roof.rotation.set(0, 0, Math.PI / 2)
	roof.scale.set(1, 1, 0.8)
	roof.position.y = 1.85
	const door = new THREE.Mesh(
		stage.keep(new THREE.BoxGeometry(0.62, 0.82, 0.04)),
		palette.flat('--color-ink', 0.1)
	)
	door.position.set(0, 0.41, 0.81)
	const ramp = new THREE.Mesh(
		stage.keep(new THREE.BoxGeometry(0.5, 0.05, 1.1)),
		palette.flat('--color-cacao-2')
	)
	ramp.position.set(0, 0.2, 1.3)
	ramp.rotation.x = 0.35
	coop.add(walls, roof, door, ramp)
	coop.position.set(0, 0, COOP_Z)
	coop.traverse(child => {
		child.castShadow = true
	})
	stage.scene.add(coop)
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
		const radius = Math.sqrt(random()) * (YARD - 0.4)
		place.position.set(Math.cos(angle) * radius, lift, Math.sin(angle) * radius)
		place.rotation.set(
			centeredSpread(random, 0.3),
			random() * 6.3,
			centeredSpread(random, 0.3)
		)
		place.scale.setScalar(0.6 + random() * 0.8)
		place.updateMatrix()
		mesh.setMatrixAt(k, place.matrix)
	}
	mesh.receiveShadow = true
	scene.add(mesh)
}

export function buildHenhouseYard(
	stage: ThreeStage,
	palette: HenPalette,
	random: RandomSource
) {
	addLights(stage)
	addGround(stage, palette)
	addFence(stage, palette)
	addCoop(stage, palette)
	const straws = new THREE.InstancedMesh(
		stage.keep(new THREE.BoxGeometry(0.34, 0.025, 0.04)),
		palette.flat('--color-carton-sombra', 0.12),
		180
	)
	const grain = new THREE.InstancedMesh(
		stage.keep(new THREE.SphereGeometry(0.035, 6, 4)),
		palette.flat('--color-maiz'),
		120
	)
	scatter(stage.scene, straws, 0.04, random)
	scatter(stage.scene, grain, 0.05, random)
}

export function nestSpots(random: RandomSource) {
	const spots: THREE.Vector3[] = []
	for (const z of HENHOUSE.rows)
		for (let x = -YARD + 1.8; x <= YARD - 1.8; x += 2.6) {
			const spot = new THREE.Vector3(
				x + centeredSpread(random, 0.8),
				0,
				z + centeredSpread(random, 0.4)
			)
			if (spot.length() < YARD - 1.4) spots.push(spot)
		}
	const focus = new THREE.Vector3(0, 0, 1.2)
	return spots.sort((a, b) => a.distanceTo(focus) - b.distanceTo(focus))
}
