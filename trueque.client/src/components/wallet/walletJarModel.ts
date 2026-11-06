import * as THREE from 'three'

import { WALLET_JAR } from '@/constants/walletJar'
import { outlineMaterial, type ThreeStage } from '@/utils/threeStage'

const { radius: R, depth: DEPTH } = WALLET_JAR

export function jarToon(stage: ThreeStage) {
	return (token: string, side: THREE.Side = THREE.FrontSide) =>
		stage.keep(new THREE.MeshToonMaterial({ color: stage.color(token), side }))
}

export function addJarLights({ scene, color }: ThreeStage) {
	scene.add(
		new THREE.HemisphereLight(
			color('--color-estraza'),
			color('--color-cacao-3'),
			1.5
		)
	)
	const sun = new THREE.DirectionalLight(color('--color-amate'), 2.2)
	sun.position.set(2, 4, 3)
	scene.add(sun)
}

export function buildJar(stage: ThreeStage) {
	const { keep } = stage
	const toon = jarToon(stage)
	const jar = new THREE.Group()
	const shell = keep(
		new THREE.SphereGeometry(
			R,
			48,
			20,
			0,
			Math.PI * 2,
			Math.PI / 2,
			Math.PI / 2
		)
	)
	const outside = new THREE.Mesh(shell, toon('--color-cacao-2'))
	outside.scale.y = DEPTH
	const inside = new THREE.Mesh(shell, toon('--color-cacao-3', THREE.BackSide))
	inside.scale.set(0.96, DEPTH * 0.96, 0.96)
	const line = new THREE.Mesh(shell, outlineMaterial(stage))
	line.scale.set(1.035, DEPTH * 1.04, 1.035)
	const rim = new THREE.Mesh(
		keep(new THREE.TorusGeometry(R * 0.98, 0.05, 10, 64)),
		toon('--color-maiz-2')
	)
	rim.rotation.x = Math.PI / 2
	const band = new THREE.Mesh(
		keep(new THREE.TorusGeometry(R * 0.86, 0.035, 8, 64)),
		toon('--color-maiz')
	)
	band.rotation.x = Math.PI / 2
	band.position.y = -0.36
	const foot = new THREE.Mesh(
		keep(new THREE.CylinderGeometry(0.42, 0.5, 0.12, 32)),
		toon('--color-cacao')
	)
	foot.position.y = -DEPTH * R - 0.02
	jar.add(line, outside, inside, rim, band, foot)
	stage.scene.add(jar)
	return jar
}

export function buildHand(stage: ThreeStage) {
	const toon = jarToon(stage)
	const outline = outlineMaterial(stage)
	const skin = toon('--color-achiote-soft')
	const hand = new THREE.Group()
	const part = (
		geometry: THREE.BufferGeometry,
		material: THREE.Material,
		[x, y, z]: [number, number, number],
		rotationX = 0,
		rotationZ = 0
	) => {
		const mesh = new THREE.Mesh(stage.keep(geometry), material)
		mesh.position.set(x, y, z)
		mesh.rotation.set(rotationX, 0, rotationZ)
		const line = new THREE.Mesh(mesh.geometry, outline)
		line.scale.setScalar(1.1)
		mesh.add(line)
		hand.add(mesh)
	}
	part(new THREE.BoxGeometry(0.52, 0.16, 0.44), skin, [0, 0, 0])
	for (let finger = 0; finger < 4; finger++)
		part(
			new THREE.CapsuleGeometry(0.055, 0.22, 4, 8),
			skin,
			[-0.19 + finger * 0.126, -0.15, 0.17],
			0.6
		)
	part(
		new THREE.CapsuleGeometry(0.06, 0.18, 4, 8),
		skin,
		[0.32, -0.05, 0.02],
		0,
		0.9
	)
	part(
		new THREE.CylinderGeometry(0.21, 0.23, 0.34, 18),
		toon('--color-grana'),
		[0, 0.24, -0.04]
	)
	hand.visible = false
	stage.scene.add(hand)
	return hand
}
