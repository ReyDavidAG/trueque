import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { STALL_LOOKS, stallCenterX } from '@/constants/scene/market_scene'

import type { MarketKit } from './market_kit'
import { plankTexture, priceSignTexture } from './market_textures'
import type { Part, Stall, Triple } from './market_types'
import { copyMeshToBody, shuffle, spread } from './market_math'

type StallLook = (typeof STALL_LOOKS)[number]
type PartOptions = { edged?: boolean; tilt?: number }

const POST_SPOTS = [
	[-0.9, 0.3],
	[0.9, 0.3],
	[-0.9, -0.3],
	[0.9, -0.3],
] as const

const COUNTER_LIPS: [number, number, number, number, boolean][] = [
	[0, 0.385, 0.81, 0.015, true],
	[0, -0.385, 0.81, 0.015, true],
	[0.795, 0, 0.015, 0.4, false],
	[-0.795, 0, 0.015, 0.4, false],
]

function createPartFactory(kit: MarketKit, stall: Stall, x: number, registry: Part[]) {
	return (
		shape: THREE.BufferGeometry,
		material: THREE.Material | THREE.Material[],
		collider: CANNON.Shape,
		mass: number,
		[px, py, pz]: Triple,
		hp: number,
		{ edged = true, tilt = 0 }: PartOptions = {}
	) => {
		const mesh = new THREE.Mesh(shape, material)
		mesh.position.set(x + px, py, pz)
		mesh.rotation.z = tilt
		mesh.castShadow = true
		if (edged) mesh.add(new THREE.LineSegments(kit.outline(shape), kit.lineMaterial))
		kit.scene.add(mesh)
		const body = new CANNON.Body({ type: CANNON.Body.STATIC, shape: collider })
		copyMeshToBody(mesh, body)
		body.linearDamping = 0.08
		body.angularDamping = 0.15
		body.sleepSpeedLimit = 0.2
		kit.world.addBody(body)
		const part: Part = {
			mesh,
			body,
			stall,
			home: mesh.position.clone(),
			homeQuaternion: mesh.quaternion.clone(),
			from: new THREE.Vector3(),
			fromQuaternion: new THREE.Quaternion(),
			mass,
			hp,
			maxHp: hp,
			loose: false,
			needs: [],
			minSupports: 0,
		}
		mesh.userData = { part }
		stall.parts.push(part)
		registry.push(part)
		return part
	}
}

function buildStall(kit: MarketKit, look: StallLook, index: number, registry: Part[]) {
	const { geometry: geo, toon, decorate, keep } = kit
	const cacao = toon('--color-cacao')
	const estraza = toon('--color-estraza')
	const tint = toon(look.color)
	const face = keep(
		new THREE.MeshToonMaterial({
			map: keep(priceSignTexture(kit.cssVar, look.color, look.ink, look.price)),
		})
	)
	const stall: Stall = { parts: [], shake: 0, lastHit: 0, rebuildStart: 0 }
	const addPart = createPartFactory(kit, stall, stallCenterX(index), registry)

	const posts = POST_SPOTS.map(([px, pz]) =>
		addPart(geo.post, cacao, new CANNON.Cylinder(0.07, 0.07, 2.08, 10), 0.6, [px, 1.04, pz], 2, {
			edged: false,
		})
	)
	for (const post of posts) {
		decorate(post.mesh, geo.cap, cacao, [0, 1.04, 0])
		decorate(post.mesh, geo.foot, cacao, [0, -1.0, 0])
	}
	const counter = addPart(
		geo.counter,
		keep(new THREE.MeshToonMaterial({ map: keep(plankTexture(kit.cssVar, look.color)) })),
		new CANNON.Box(new CANNON.Vec3(0.8, 0.4, 0.35)),
		3,
		[0, 0.4, 0],
		4
	)
	const top = addPart(geo.top, cacao, new CANNON.Box(new CANNON.Vec3(0.81, 0.03, 0.4)), 0.8, [0, 0.83, 0], 2)
	for (const [lx, lz, hx, hz, alongLength] of COUNTER_LIPS) {
		top.body.addShape(new CANNON.Box(new CANNON.Vec3(hx, 0.035, hz)), new CANNON.Vec3(lx, 0.065, lz))
		decorate(top.mesh, alongLength ? geo.lipLong : geo.lipShort, toon('--color-cacao-3'), [lx, 0.065, lz], true)
	}
	const awning = addPart(geo.awning, tint, new CANNON.Box(new CANNON.Vec3(1.1, 0.06, 0.55)), 1.4, [0, 2.2, 0], 3)
	decorate(awning.mesh, geo.stripe, estraza, [-0.45, 0, 0], true)
	decorate(awning.mesh, geo.stripe, estraza, [0.45, 0, 0], true)
	for (let k = 0; k < 6; k++)
		decorate(awning.mesh, geo.scallop, k % 2 ? estraza : tint, [-0.92 + k * 0.37, -0.08, 0.55])
	const sign = addPart(
		geo.sign,
		[tint, tint, tint, tint, face, tint],
		new CANNON.Box(new CANNON.Vec3(0.45, 0.25, 0.03)),
		0.4,
		[spread(0.3), 1.55, 0.5],
		2,
		{ tilt: spread(0.24) }
	)
	decorate(sign.mesh, geo.string, toon('--color-ink'), [-0.25, 0.4, 0])
	decorate(sign.mesh, geo.string, toon('--color-ink'), [0.25, 0.4, 0])
	Object.assign(awning, { needs: posts, minSupports: 3 })
	Object.assign(sign, { needs: [awning], minSupports: 1 })
	Object.assign(top, { needs: [counter], minSupports: 1 })
	return stall
}

export function buildStalls(kit: MarketKit) {
	const parts: Part[] = []
	const stalls = shuffle(STALL_LOOKS).map((look, i) => buildStall(kit, look, i, parts))
	return { stalls, parts }
}
