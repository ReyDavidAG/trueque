import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { VAULT } from '@/constants/vault_coins'
import { createThreeStage, type ThreeStage } from '@/utils/three_stage'

import {
	addVaultCoins,
	containCoin,
	createVaultWorld,
	type VaultCoin,
	vaultCoinCount,
} from './vault_physics'
import { buildVaultRoom } from './vault_room'

function trackPointer(stage: ThreeStage, pusher: CANNON.Body, coins: VaultCoin[]) {
	const ray = new THREE.Raycaster()
	const ndc = new THREE.Vector2()
	const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -VAULT.pushY)
	const hit = new THREE.Vector3()
	const pointer = { target: null as THREE.Vector3 | null }
	const point = (event: PointerEvent) => {
		stage.toNdc(event, ndc)
		ray.setFromCamera(ndc, stage.camera)
		if (!ray.ray.intersectPlane(plane, hit)) return
		hit.x = Math.max(-VAULT.halfX, Math.min(VAULT.halfX, hit.x))
		hit.z = Math.max(-VAULT.halfZ, Math.min(VAULT.halfZ, hit.z))
		if (!pointer.target) {
			pointer.target = hit.clone()
			pusher.position.set(hit.x, VAULT.pushY, hit.z)
		} else pointer.target.copy(hit)
	}
	const bump = () => {
		for (const coin of coins) {
			const distance = coin.body.position.distanceTo(pusher.position)
			if (distance > 0.9) continue
			coin.body.wakeUp()
			coin.body.applyImpulse(
				new CANNON.Vec3(
					(Math.random() - 0.5) * 0.3,
					0.55 - distance * 0.4,
					(Math.random() - 0.5) * 0.3
				)
			)
		}
	}
	stage.listen('pointermove', point)
	stage.listen('pointerdown', point)
	stage.listen('pointerdown', bump)
	stage.listen('pointerleave', () => {
		pointer.target = null
	})
	return pointer
}

function stir(pusher: CANNON.Body, target: THREE.Vector3, coins: VaultCoin[], deltaSeconds: number) {
	const velocity = new CANNON.Vec3(
		target.x - pusher.position.x,
		0,
		target.z - pusher.position.z
	).scale(1 / Math.max(deltaSeconds, VAULT.step))
	const speed = velocity.length()
	if (speed > VAULT.maxPush) velocity.scale(VAULT.maxPush / speed, velocity)
	pusher.velocity.copy(velocity)
	pusher.position.y = VAULT.pushY
	const force = Math.min(speed, VAULT.maxPush)
	for (const coin of coins) {
		const dx = coin.body.position.x - pusher.position.x
		const dz = coin.body.position.z - pusher.position.z
		const distance = Math.hypot(dx, dz)
		if (distance > VAULT.stirRadius) continue
		coin.body.wakeUp()
		if (force < 0.5) continue
		const k = (1 - distance / VAULT.stirRadius) * force * VAULT.stirStrength
		coin.body.applyImpulse(
			new CANNON.Vec3(
				(dx / (distance || 1)) * k + velocity.x * k * 0.04,
				k * 0.9,
				(dz / (distance || 1)) * k + velocity.z * k * 0.04
			)
		)
	}
}

export function mountVaultCoinsScene(
	host: HTMLDivElement,
	free: number,
	total: number,
	isActive: () => boolean
) {
	const stage = createThreeStage(host, {
		className: 'vault-coins__canvas',
		fov: 50,
		near: 0.05,
		far: 60,
		onFit: camera => {
			camera.fov = Math.min(72, Math.max(46, 50 * (1.5 / camera.aspect) ** 0.6))
			camera.lookAt(0, 0.25, -0.35)
		},
	})
	stage.camera.position.set(0, 1.35, VAULT.halfZ + 2.3)
	buildVaultRoom(stage)
	const { world, pusher } = createVaultWorld()
	const coins = addVaultCoins(stage, world, vaultCoinCount(free, total))
	const pointer = trackPointer(stage, pusher, coins)

	let previous = performance.now()
	stage.start(now => {
		const deltaSeconds = Math.min((now - previous) / 1000, 1 / 30)
		previous = now
		if (!isActive()) return
		if (pointer.target) stir(pusher, pointer.target, coins, deltaSeconds)
		else {
			pusher.velocity.set(0, 0, 0)
			pusher.position.set(0, -5, 0)
		}
		world.step(VAULT.step, deltaSeconds, 6)
		for (const coin of coins) containCoin(coin)
		stage.renderer.render(stage.scene, stage.camera)
	})

	return stage.dispose
}
