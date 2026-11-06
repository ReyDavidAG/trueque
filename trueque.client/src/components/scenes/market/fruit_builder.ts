import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { FRUIT_PALETTES, type FruitKind } from '@/constants/scene/market_scene'

import type { MarketKit } from './market_kit'
import type { Fruit, Triple } from './market_types'
import { pickOne } from './market_math'

type Shaper = (kit: MarketKit, root: THREE.Group, body: CANNON.Body, tint: THREE.Material) => number

const GRAPE_SPOTS: Triple[] = [
	[-0.055, 0, 0],
	[0.055, 0, 0],
	[0, 0, 0.06],
	[0, 0.07, 0.02],
]

const shapeCoin: Shaper = ({ geometry, coinFace }, root, body, tint) => {
	const mesh = new THREE.Mesh(geometry.coin, [tint, coinFace, coinFace])
	mesh.castShadow = true
	root.add(mesh)
	body.addShape(new CANNON.Cylinder(0.13, 0.13, 0.045, 12))
	body.mass = 0.12
	return 0.0225
}

const shapeCrate: Shaper = ({ geometry, decorate, toon }, root, body, tint) => {
	decorate(root, geometry.crate, tint, [0, 0, 0], true)
	decorate(root, geometry.slat, toon('--color-cacao'), [0, 0.06, 0])
	decorate(root, geometry.slat, toon('--color-cacao'), [0, -0.06, 0])
	body.addShape(new CANNON.Box(new CANNON.Vec3(0.18, 0.13, 0.14)))
	body.mass = 0.7
	return 0.13
}

const shapeSack: Shaper = ({ geometry, decorate, toon }, root, body, tint) => {
	decorate(root, geometry.ball, tint, [0, 0, 0]).scale.set(0.2, 0.17, 0.2)
	decorate(root, geometry.tie, toon('--color-cacao'), [0, 0.18, 0])
	body.addShape(new CANNON.Sphere(0.17))
	body.mass = 0.6
	body.angularDamping = 0.8
	return 0.17
}

const shapeGrapes: Shaper = ({ geometry, decorate, toon }, root, body, tint) => {
	for (const [gx, gy, gz] of GRAPE_SPOTS) {
		decorate(root, geometry.ball, tint, [gx, gy, gz]).scale.setScalar(0.065)
		body.addShape(new CANNON.Sphere(0.065), new CANNON.Vec3(gx, gy, gz))
	}
	decorate(root, geometry.stem, toon('--color-cacao'), [0, 0.13, 0.02])
	body.mass = 0.15
	return 0.065
}

const shapePumpkin: Shaper = ({ geometry, decorate, toon }, root, body, tint) => {
	decorate(root, geometry.ball, tint, [0, 0, 0]).scale.set(0.21, 0.15, 0.21)
	decorate(root, geometry.stem, toon('--color-cacao'), [0, 0.15, 0]).scale.setScalar(1.6)
	body.addShape(new CANNON.Sphere(0.16))
	body.mass = 0.5
	return 0.15
}

const shapeRound =
	(kind: 'round' | 'lemon' | 'pod'): Shaper =>
	({ geometry, decorate, toon }, root, body, tint) => {
		const cacao = toon('--color-cacao')
		const radius = kind === 'round' ? 0.12 + Math.random() * 0.04 : 0.11
		const stretch = kind === 'pod' ? 2.1 : kind === 'lemon' ? 1.45 : 1
		decorate(root, geometry.ball, tint, [0, 0, 0]).scale.set(radius * stretch, radius, radius)
		if (kind === 'round') decorate(root, geometry.stem, cacao, [0, radius, 0])
		else decorate(root, geometry.stem, cacao, [radius * stretch, 0, 0]).rotation.z = Math.PI / 2
		const lobes = kind === 'pod' ? [-0.12, 0, 0.12] : kind === 'lemon' ? [-0.05, 0.05] : [0]
		for (const bx of lobes) body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(bx, 0, 0))
		return radius
	}

const SHAPERS: Record<FruitKind, Shaper> = {
	coin: shapeCoin,
	crate: shapeCrate,
	sack: shapeSack,
	grapes: shapeGrapes,
	pumpkin: shapePumpkin,
	round: shapeRound('round'),
	lemon: shapeRound('lemon'),
	pod: shapeRound('pod'),
}

export function makeFruit(kit: MarketKit, kind: FruitKind, x: number, z: number, floor: number): Fruit {
	const root = new THREE.Group()
	const body = new CANNON.Body({ mass: 0.25, linearDamping: 0.12, angularDamping: 0.75 })
	const tint = kit.toon(pickOne(FRUIT_PALETTES[kind]))
	const lift = SHAPERS[kind](kit, root, body, tint)
	body.updateMassProperties()
	body.sleepSpeedLimit = 0.15
	body.position.set(x, floor + lift + 0.002, z)
	body.quaternion.setFromEuler(0, Math.random() * Math.PI * 2, 0)
	kit.world.addBody(body)
	body.sleep()
	kit.scene.add(root)
	const fruit: Fruit = { mesh: root, body }
	root.userData = { fruit }
	return fruit
}
