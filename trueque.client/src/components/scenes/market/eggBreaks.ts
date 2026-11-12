import type * as CANNON from 'cannon-es'
import * as THREE from 'three'

import {
	CARTON_BREAK_SPEED,
	COINS_PER_EGG,
	EGG_BREAK_SPEED,
	HENS,
	MAX_LOOSE_COINS,
	MAX_SPLATS,
} from '@/constants/scene/marketScene'
import { easeOutBack } from '@/utils/easing'

import { makeFruit } from './fruitBuilder'
import type { MarketKit } from './marketKit'
import { spread } from './marketMath'
import type { Fruit } from './marketTypes'

const SHELL_GROW_MS = 260
const SHELL_LIFT = 0.006
const EGG_RADIUS = 0.1

type Shell = { group: THREE.Group; born: number }

type EggBreakOptions = {
	kit: MarketKit
	fruits: Fruit[]
	pickable: THREE.Object3D[]
	held: () => CANNON.Body | undefined
	layingSpot: () => { x: number; z: number }
}

type CollideEvent = { contact: CANNON.ContactEquation }

const impact = (event: CollideEvent) =>
	Math.abs(event.contact.getImpactVelocityAlongNormal())

export function createEggBreaks({
	kit,
	fruits,
	pickable,
	held,
	layingSpot,
}: EggBreakOptions) {
	const cracked = new Set<Fruit>()
	const shells: Shell[] = []
	const looseCoins: Fruit[] = []
	const layAt: number[] = []
	const shellMaterial = kit.toon('--color-cascara')

	const add = (fruit: Fruit) => {
		fruits.push(fruit)
		pickable.push(fruit.mesh)
		watch(fruit)
	}

	const remove = (fruit: Fruit) => {
		kit.world.removeBody(fruit.body)
		fruit.mesh.removeFromParent()
		fruits.splice(fruits.indexOf(fruit), 1)
		const at = pickable.indexOf(fruit.mesh)
		if (at >= 0) pickable.splice(at, 1)
	}

	function watch(fruit: Fruit) {
		const limit =
			fruit.kind === 'egg'
				? EGG_BREAK_SPEED
				: fruit.kind === 'carton'
					? CARTON_BREAK_SPEED
					: null
		if (limit === null) return
		fruit.body.addEventListener('collide', (event: CollideEvent) => {
			if (impact(event) > limit) cracked.add(fruit)
		})
	}
	fruits.forEach(watch)

	const burst = (fruit: Fruit, power: number) => {
		fruit.body.wakeUp()
		fruit.body.velocity.set(spread(power), power * 0.8, spread(power))
		fruit.body.angularVelocity.set(spread(8), spread(8), spread(8))
	}

	const dropShells = (at: CANNON.Vec3, now: number) => {
		const group = new THREE.Group()
		for (const side of [-1, 1]) {
			const half = new THREE.Mesh(kit.geometry.yolk, shellMaterial)
			half.scale.set(0.07, 0.06, 0.07)
			half.position.set(side * 0.07, 0.01, spread(0.05))
			half.rotation.set(Math.PI + spread(0.6), Math.random() * 3, spread(0.6))
			half.castShadow = true
			group.add(half)
		}
		group.position.set(at.x, Math.max(SHELL_LIFT, at.y - EGG_RADIUS), at.z)
		group.scale.setScalar(0.001)
		kit.scene.add(group)
		shells.push({ group, born: now })
		if (shells.length > MAX_SPLATS) shells.shift()?.group.removeFromParent()
	}

	const spillCoins = (at: CANNON.Vec3) => {
		for (let k = 0; k < COINS_PER_EGG; k++) {
			const coin = makeFruit(kit, 'coin', at.x, at.z, at.y)
			burst(coin, 2.6)
			add(coin)
			looseCoins.push(coin)
			if (looseCoins.length > MAX_LOOSE_COINS) {
				const oldest = looseCoins.shift()
				if (oldest && oldest.body !== held() && fruits.includes(oldest))
					remove(oldest)
			}
		}
	}

	const breakEgg = (fruit: Fruit, now: number) => {
		const at = fruit.body.position.clone()
		remove(fruit)
		dropShells(at, now)
		spillCoins(at)
		layAt.push(now + HENS.layDelayMs)
	}

	const emptyCarton = (fruit: Fruit) => {
		const contents = fruit.contents ?? []
		fruit.contents = []
		const spot = new THREE.Vector3()
		for (const inside of contents) {
			inside.getWorldPosition(spot)
			inside.removeFromParent()
			const egg = makeFruit(kit, 'egg', spot.x, spot.z, spot.y)
			burst(egg, 1.4)
			add(egg)
		}
	}

	const layEgg = () => {
		const { x, z } = layingSpot()
		const egg = makeFruit(kit, 'egg', x, z, 0)
		egg.body.wakeUp()
		egg.body.velocity.set(0, 1.2, 0)
		add(egg)
	}

	const step = (now: number) => {
		const grabbed = held()
		for (const fruit of cracked) {
			if (fruit.body === grabbed || !fruits.includes(fruit)) continue
			cracked.delete(fruit)
			if (fruit.kind === 'egg') breakEgg(fruit, now)
			else emptyCarton(fruit)
		}
		for (const shell of shells) {
			const k = Math.min(1, (now - shell.born) / SHELL_GROW_MS)
			shell.group.scale.setScalar(Math.max(0.001, easeOutBack(k)))
		}
		while (layAt.length && layAt[0] <= now) {
			layAt.shift()
			layEgg()
		}
	}

	return { step }
}
