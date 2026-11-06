import * as THREE from 'three'

import { VAULT } from '@/constants/vaultCoins'
import { outlineMaterial, type ThreeStage } from '@/utils/threeStage'

const { halfX: HALF_X, halfZ: HALF_Z, roof: ROOF } = VAULT

function addVaultLights({ scene, color }: ThreeStage) {
	scene.add(
		new THREE.HemisphereLight(
			color('--color-estraza'),
			color('--color-ink'),
			1.3
		)
	)
	const sun = new THREE.DirectionalLight(color('--color-amate'), 1.6)
	sun.position.set(1.5, 4, 5)
	scene.add(sun)
	const lamp = new THREE.PointLight(color('--color-estraza'), 6, 6, 1.4)
	lamp.position.set(0, ROOF - 0.15, 0.2)
	scene.add(lamp)
}

function addRivets(
	scene: THREE.Scene,
	width: number,
	back: number,
	material: THREE.Material,
	geometry: THREE.BufferGeometry
) {
	for (const x of [-1, 1])
		for (const y of [-1, 1]) {
			const rivet = new THREE.Mesh(geometry, material)
			rivet.position.set(
				(x * (width - 0.7)) / 2,
				ROOF / 2 + 0.05 + (y * (ROOF - 0.7)) / 2,
				back + 0.02
			)
			scene.add(rivet)
		}
}

export function buildVaultRoom(stage: ThreeStage) {
	const { keep, color, scene } = stage
	addVaultLights(stage)
	const gray = (shade: number, side: THREE.Side = THREE.FrontSide) =>
		keep(
			new THREE.MeshToonMaterial({
				color: color('--color-ink')
					.clone()
					.lerp(color('--color-estraza'), shade),
				side,
			})
		)
	const width = HALF_X * 2 + 0.24
	const back = -HALF_Z - 0.12
	const front = HALF_Z + 2.6
	const room = new THREE.Mesh(
		keep(new THREE.BoxGeometry(width, ROOF, front - back)),
		[0.42, 0.42, 0.3, 0.55, 0.42, 0.5].map(shade => gray(shade, THREE.BackSide))
	)
	room.position.set(0, ROOF / 2, (front + back) / 2)
	scene.add(room)
	const panel = new THREE.Mesh(
		keep(new THREE.PlaneGeometry(width - 0.5, ROOF - 0.5)),
		gray(0.44)
	)
	panel.position.set(0, ROOF / 2 + 0.05, back + 0.01)
	scene.add(panel)
	addRivets(
		scene,
		width,
		back,
		gray(0.7),
		keep(new THREE.SphereGeometry(0.035, 10, 8))
	)
	const lip = new THREE.Mesh(
		keep(new THREE.BoxGeometry(width, 0.09, 0.1)),
		gray(0.72)
	)
	lip.position.set(0, 0.045, HALF_Z + 0.2)
	const lipLine = new THREE.Mesh(lip.geometry, outlineMaterial(stage))
	lipLine.scale.set(1, 1.25, 1.25)
	lip.add(lipLine)
	scene.add(lip)
	const shelf = new THREE.Mesh(
		keep(new THREE.BoxGeometry(width, 0.05, 0.6)),
		gray(0.62)
	)
	shelf.position.set(0, ROOF - 0.55, back + 0.3)
	scene.add(shelf)
}
