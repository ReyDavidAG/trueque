import * as THREE from 'three'

import { easeInOut } from '@/utils/three/easing'

import type { TourKit, TourModel } from './tourKit'

const EGG_STEPS = 48
const EGG_SEGMENTS = 64
const EGG_HALF_HEIGHT = 0.87
const EGG_CENTER = 0.07
const EGG_RADIUS = 0.6
const EGG_TAPER = 0.12

const eggProfile = () =>
	Array.from({ length: EGG_STEPS + 1 }, (_, i) => {
		const a = (i / EGG_STEPS) * Math.PI
		const radius = Math.sin(a) * EGG_RADIUS * (1 + EGG_TAPER * Math.cos(a))
		return new THREE.Vector2(
			Math.max(0, radius),
			EGG_CENTER - Math.cos(a) * EGG_HALF_HEIGHT
		)
	})

export function earnModel({ outlined, toon, coin }: TourKit): TourModel {
	const group = new THREE.Group()
	const egg = outlined(
		new THREE.LatheGeometry(eggProfile(), EGG_SEGMENTS),
		toon('--color-cascara')
	)
	group.add(egg)
	const coins = [0, 1, 2].map(() => coin(0.26))
	group.add(...coins)
	return {
		group,
		update: t => {
			egg.rotation.z = Math.sin(t * 2.4) * 0.12
			egg.position.y = Math.abs(Math.sin(t * 2.4)) * 0.08
			egg.scale.setScalar(1 + Math.sin(t * 3) * 0.03)
			coins.forEach((c, i) => {
				const angle = t * 1.4 + (i * Math.PI * 2) / 3
				c.position.set(
					Math.cos(angle) * 1.35,
					Math.sin(angle * 2) * 0.25,
					Math.sin(angle) * 0.6
				)
				c.rotation.y = t * 3 + i
			})
		},
	}
}

export function chooseModel({
	outlined,
	toon,
	coin,
	glass,
}: TourKit): TourModel {
	const group = new THREE.Group()
	const target = coin(0.55)
	target.rotation.x = -0.5
	target.position.y = -0.35
	const lens = new THREE.Group()
	const rim = outlined(
		new THREE.TorusGeometry(0.55, 0.1, 14, 40),
		toon('--color-anil'),
		1.08
	)
	const disc = outlined(new THREE.CircleGeometry(0.52, 32), glass, 0)
	const handle = outlined(
		new THREE.CylinderGeometry(0.09, 0.11, 0.9, 12),
		toon('--color-cacao')
	)
	handle.position.set(0.62, -0.62, 0)
	handle.rotation.z = Math.PI / 4
	lens.add(rim, disc, handle)
	group.add(target, lens)
	return {
		group,
		update: t => {
			lens.position.set(
				Math.cos(t * 1.3) * 0.45,
				0.15 + Math.sin(t * 2.6) * 0.2,
				0.6
			)
			lens.rotation.y = Math.sin(t * 1.3) * 0.3
			target.rotation.z = Math.sin(t) * 0.15
		},
	}
}

export function tradeModel({ coin, ticket }: TourKit): TourModel {
	const group = new THREE.Group()
	const cacao = coin(0.48)
	const coupon = ticket(0.62)
	group.add(cacao, coupon)
	return {
		group,
		update: t => {
			const cycle = (t % 2.4) / 2.4
			const progress = easeInOut(Math.min(1, cycle / 0.55))
			const turn = Math.floor(t / 2.4) % 2
			const angle = (progress + turn) * Math.PI
			cacao.position.set(
				Math.cos(angle) * 0.85,
				Math.sin(angle) * 0.45,
				Math.sin(angle) * 0.4
			)
			coupon.position.set(
				-Math.cos(angle) * 0.85,
				-Math.sin(angle) * 0.45,
				-Math.sin(angle) * 0.4
			)
			cacao.rotation.y = angle * 2
			coupon.rotation.z = Math.sin(angle) * 0.4
			coupon.rotation.y = Math.sin(t * 1.5) * 0.3
		},
	}
}

export function showModel({
	outlined,
	ticket,
	keep,
	color,
}: TourKit): TourModel {
	const group = new THREE.Group()
	const coupon = ticket(1.05)
	const beam = outlined(
		new THREE.BoxGeometry(2.1, 0.05, 0.05),
		keep(
			new THREE.MeshBasicMaterial({
				color: color('--color-grana'),
				transparent: true,
				opacity: 0.85,
			})
		),
		0
	)
	beam.position.z = 0.12
	group.add(coupon, beam)
	return {
		group,
		update: t => {
			coupon.rotation.y = Math.sin(t * 1.1) * 0.45
			coupon.rotation.x = Math.sin(t * 0.8) * 0.15
			beam.position.y = Math.sin(t * 2.4) * 0.5
			beam.rotation.y = coupon.rotation.y
		},
	}
}
