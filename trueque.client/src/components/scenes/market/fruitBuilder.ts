import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { FRUIT_PALETTES, type FruitKind } from '@/constants/scene/marketScene'

import type { MarketKit } from './marketKit'
import { pickOne } from './marketMath'
import type { Fruit } from './marketTypes'

type Shaper = (
	kit: MarketKit,
	root: THREE.Group,
	body: CANNON.Body,
	tint: THREE.Material
) => number

const shapeCoin: Shaper = ({ geometry, coinFace }, root, body, tint) => {
	const mesh = new THREE.Mesh(geometry.coin, [tint, coinFace, coinFace])
	mesh.castShadow = true
	root.add(mesh)
	body.addShape(new CANNON.Cylinder(0.13, 0.13, 0.045, 12))
	body.mass = 0.12
	return 0.0225
}

const CARTON_CUPS: [number, number][] = [
	[-0.12, -0.07],
	[0, -0.07],
	[0.12, -0.07],
	[-0.12, 0.07],
	[0, 0.07],
	[0.12, 0.07],
]

const shapeCarton: Shaper = (
	{ geometry, decorate, toon },
	root,
	body,
	tint
) => {
	decorate(root, geometry.tray, tint, [0, 0, 0], true)
	const shells = [toon('--color-cascara'), toon('--color-cascara-roja')]
	const contents: THREE.Object3D[] = []
	for (const [cx, cz] of CARTON_CUPS)
		if (Math.random() > 0.25) {
			const egg = decorate(root, geometry.ball, pickOne(shells), [cx, 0.07, cz])
			egg.scale.set(0.055, 0.07, 0.055)
			contents.push(egg)
		}
	root.userData.contents = contents
	body.addShape(new CANNON.Box(new CANNON.Vec3(0.21, 0.05, 0.15)))
	body.mass = 0.5
	return 0.05
}

const shapeEgg: Shaper = ({ geometry, decorate }, root, body, tint) => {
	const size = 0.1 + Math.random() * 0.02
	decorate(root, geometry.ball, tint, [0, 0, 0]).scale.set(
		size,
		size * 1.3,
		size
	)
	body.addShape(new CANNON.Sphere(size), new CANNON.Vec3(0, -size * 0.25, 0))
	body.addShape(
		new CANNON.Sphere(size * 0.8),
		new CANNON.Vec3(0, size * 0.4, 0)
	)
	body.mass = 0.08
	return size * 1.25
}

const SHAPERS: Record<FruitKind, Shaper> = {
	egg: shapeEgg,
	coin: shapeCoin,
	carton: shapeCarton,
}

export function makeFruit(
	kit: MarketKit,
	kind: FruitKind,
	x: number,
	z: number,
	floor: number,
	tone?: string
): Fruit {
	const root = new THREE.Group()
	const body = new CANNON.Body({
		mass: 0.25,
		linearDamping: 0.12,
		angularDamping: 0.75,
	})
	const tint = kit.toon(tone ?? pickOne(FRUIT_PALETTES[kind]))
	const lift = SHAPERS[kind](kit, root, body, tint)
	body.updateMassProperties()
	body.sleepSpeedLimit = 0.15
	body.position.set(x, floor + lift + 0.002, z)
	body.quaternion.setFromEuler(0, Math.random() * Math.PI * 2, 0)
	kit.world.addBody(body)
	body.sleep()
	kit.scene.add(root)
	const fruit: Fruit = {
		mesh: root,
		body,
		kind,
		contents: root.userData.contents as THREE.Object3D[] | undefined,
	}
	root.userData = { fruit }
	return fruit
}
