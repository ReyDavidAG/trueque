import * as THREE from 'three'

import type { RandomSource } from '@/utils/seededRandom'
import type { SceneTools } from '@/utils/threeStage'

import type { HenPalette } from './henPalette'

const EGG_PROFILE = [
	[0, -0.17],
	[0.07, -0.155],
	[0.115, -0.1],
	[0.13, -0.02],
	[0.12, 0.07],
	[0.09, 0.15],
	[0.045, 0.2],
	[0, 0.215],
] as const

const NEST_RADIUS = 0.62

export type HenKit = ReturnType<typeof createHenKit>

export type Hen = {
	group: THREE.Group
	head: THREE.Group
	body: THREE.Group
	legs: [THREE.Group, THREE.Group]
	phase: number
}

type Vec = [number, number, number]

const BREEDS = [
	{ feathers: '--color-cascara', tail: '--color-cascara-sombra', dark: 0 },
	{ feathers: '--color-cascara-roja', tail: '--color-ink', dark: 0.35 },
	{ feathers: '--color-achiote', tail: '--color-ink', dark: 0.45 },
] as const

const TAIL_FEATHERS: Vec[] = [
	[-0.16, 0.95, 0.62],
	[-0.06, 1.0, 0.45],
	[0.05, 1.02, 0.3],
	[0.15, 0.96, 0.18],
]

export function createHenKit(
	{ keep }: Pick<SceneTools, 'keep'>,
	palette: HenPalette,
	random: RandomSource
) {
	const sphere = keep(new THREE.SphereGeometry(1, 18, 14))
	const cone = keep(new THREE.ConeGeometry(1, 1, 10))
	const eggGeometry = keep(
		new THREE.LatheGeometry(
			EGG_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)),
			14
		)
	)
	const nestGeometry = keep(new THREE.TorusGeometry(NEST_RADIUS, 0.2, 8, 22))
	const nestBedGeometry = keep(
		new THREE.CylinderGeometry(NEST_RADIUS, NEST_RADIUS * 0.8, 0.12, 22)
	)
	const plumage = BREEDS.map(breed => ({
		feathers: palette.flat(breed.feathers, breed.dark * 0.4),
		tail: palette.flat(breed.tail, breed.dark ? 0.15 : 0.05),
		wing: palette.flat(breed.feathers, 0.12 + breed.dark * 0.4),
	}))
	const comb = palette.flat('--color-cresta')
	const beak = palette.flat('--color-pico')
	const legColor = palette.flat('--color-pico', 0.08)
	const eyeWhite = palette.flat('--color-on-dark')
	const eye = palette.flat('--color-ink')
	const cylinder = keep(new THREE.CylinderGeometry(1, 1, 1, 8))
	const straw = palette.toon('--color-carton')
	const strawDark = palette.toon('--color-carton-sombra')
	const shells = [
		palette.flat('--color-cascara'),
		palette.flat('--color-cascara-roja'),
		palette.flat('--color-cascara-sombra'),
	]
	const eggHighlight = palette.flat('--color-maiz')

	const part = (
		geometry: THREE.BufferGeometry,
		material: THREE.Material,
		scale: [number, number, number],
		position: [number, number, number],
		outline = true
	) => {
		const mesh = outline
			? palette.outlined(geometry, material, 1.08)
			: new THREE.Mesh(geometry, material)
		mesh.scale.set(...scale)
		mesh.position.set(...position)
		return mesh
	}

	const blob = (
		material: THREE.Material,
		scale: Vec,
		position: Vec,
		rotation: Vec = [0, 0, 0],
		outline = true
	) => {
		const mesh = part(sphere, material, scale, position, outline)
		mesh.rotation.set(...rotation)
		return mesh
	}

	const makeHead = (feathers: THREE.Material) => {
		const head = new THREE.Group()
		head.position.set(0.34, 0.86, 0)
		const neck = blob(
			feathers,
			[0.2, 0.3, 0.19],
			[0.06, 0.12, 0],
			[0, 0, -0.35]
		)
		const skull = blob(feathers, [0.22, 0.21, 0.2], [0.16, 0.36, 0])
		const upperBeak = part(cone, beak, [0.06, 0.17, 0.055], [0.43, 0.34, 0])
		upperBeak.rotation.z = -Math.PI / 2
		const lowerBeak = part(
			cone,
			beak,
			[0.04, 0.1, 0.04],
			[0.39, 0.29, 0],
			false
		)
		lowerBeak.rotation.z = -Math.PI / 2 - 0.35
		const crest = [
			[0.24, 0.6, 0.06, 0.1],
			[0.14, 0.64, 0.075, 0.12],
			[0.03, 0.61, 0.07, 0.11],
			[-0.06, 0.53, 0.055, 0.08],
		].map(([x, y, w, h]) => blob(comb, [w, h, 0.035], [x, y, 0]))
		const wattles = [-1, 1].map(side =>
			blob(comb, [0.045, 0.075, 0.03], [0.34, 0.17, side * 0.035])
		)
		const eyes = [-1, 1].flatMap(side => [
			blob(
				eyeWhite,
				[0.05, 0.05, 0.03],
				[0.27, 0.41, side * 0.17],
				[0, 0, 0],
				false
			),
			blob(
				eye,
				[0.03, 0.032, 0.02],
				[0.29, 0.41, side * 0.19],
				[0, 0, 0],
				false
			),
		])
		head.add(neck, skull, upperBeak, lowerBeak, ...crest, ...wattles, ...eyes)
		return head
	}

	const makeWing = (material: THREE.Material, side: number) => {
		const wing = new THREE.Group()
		wing.position.set(-0.06, 0.62, side * 0.4)
		wing.rotation.set(side * -0.12, 0, -0.22)
		wing.add(blob(material, [0.4, 0.24, 0.07], [0, 0, 0]))
		for (let k = 0; k < 3; k++)
			wing.add(
				blob(
					material,
					[0.16, 0.06, 0.05],
					[-0.3 - k * 0.04, -0.06 - k * 0.07, 0],
					[0, 0, -0.35 - k * 0.15]
				)
			)
		return wing
	}

	const makeTail = (material: THREE.Material) => {
		const tail = new THREE.Group()
		tail.position.set(-0.5, 0.82, 0)
		for (const [z, height, tilt] of TAIL_FEATHERS)
			tail.add(
				blob(
					material,
					[0.08, 0.32 * height, 0.06],
					[0, 0.18, z],
					[z * 1.2, 0, tilt]
				)
			)
		return tail
	}

	const makeLeg = (side: number) => {
		const leg = new THREE.Group()
		leg.position.set(0.04, 0.32, side * 0.14)
		leg.add(part(cylinder, legColor, [0.03, 0.3, 0.03], [0, -0.15, 0], false))
		for (const turn of [-0.55, 0, 0.55]) {
			const toe = part(
				cylinder,
				legColor,
				[0.018, 0.16, 0.018],
				[0, 0, 0],
				false
			)
			toe.rotation.set(turn, 0, Math.PI / 2)
			toe.position.set(0.05 * Math.cos(turn), -0.3, 0.05 * Math.sin(turn))
			leg.add(toe)
		}
		return leg
	}

	const makeHen = (scale: number): Hen => {
		const group = new THREE.Group()
		const colors = plumage[Math.floor(random() * plumage.length)]
		const body = new THREE.Group()
		const head = makeHead(colors.feathers)
		body.add(
			blob(colors.feathers, [0.56, 0.42, 0.42], [-0.06, 0.62, 0], [0, 0, 0.18]),
			blob(colors.feathers, [0.34, 0.36, 0.36], [0.24, 0.66, 0]),
			blob(colors.feathers, [0.3, 0.2, 0.3], [-0.04, 0.42, 0]),
			makeWing(colors.wing, 1),
			makeWing(colors.wing, -1),
			makeTail(colors.tail),
			head
		)
		const legs: [THREE.Group, THREE.Group] = [makeLeg(1), makeLeg(-1)]
		group.add(body, ...legs)
		group.scale.setScalar(scale)
		group.rotation.y = random() * Math.PI * 2
		return { group, head, body, legs, phase: random() * Math.PI * 2 }
	}

	const makeNest = () => {
		const nest = new THREE.Group()
		const bed = new THREE.Mesh(nestBedGeometry, strawDark)
		bed.position.y = 0.06
		bed.receiveShadow = true
		const ring = palette.outlined(nestGeometry, straw, 1.05)
		ring.rotation.x = Math.PI / 2
		ring.position.y = 0.16
		nest.add(bed, ring)
		return nest
	}

	const eggSpot = (index: number) => {
		const inNest = index < 6
		const angle = inNest ? 0.6 + index * 0.55 : index * 2.399
		const radius = inNest
			? NEST_RADIUS * 0.95
			: NEST_RADIUS + 0.45 + (index - 6) * 0.05
		return new THREE.Vector3(
			Math.cos(angle) * radius,
			inNest ? 0.32 : 0.17,
			Math.sin(angle) * radius
		)
	}

	const makeEgg = (index: number) =>
		palette.outlined(eggGeometry, shells[index % shells.length], 1.08)

	return { makeHen, makeNest, makeEgg, eggSpot, eggHighlight }
}

export function peck(hens: Hen[], seconds: number) {
	for (const hen of hens) {
		const t = seconds * 1.6 + hen.phase
		const dip = Math.max(0, Math.sin(t * 2.2)) ** 6
		hen.head.rotation.z = -dip * 1.1
		hen.body.rotation.z = Math.sin(t) * 0.04 - dip * 0.12
	}
}
