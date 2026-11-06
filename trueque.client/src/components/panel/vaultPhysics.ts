import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacaoRain'
import { VAULT } from '@/constants/vaultCoins'
import type { ThreeStage } from '@/utils/threeStage'

const {
	halfX: HALF_X,
	halfZ: HALF_Z,
	roof: ROOF,
	wall: T,
	coinRadius: COIN_R,
	coinHeight: COIN_H,
} = VAULT

export type VaultCoin = { mesh: THREE.Mesh; body: CANNON.Body }

export function createVaultWorld() {
	const world = new CANNON.World({
		gravity: new CANNON.Vec3(0, -9.8, 0),
		allowSleep: true,
	})
	world.broadphase = new CANNON.SAPBroadphase(world)
	;(world.solver as CANNON.GSSolver).iterations = 12
	Object.assign(world.defaultContactMaterial, {
		friction: 0.35,
		restitution: 0.25,
	})
	const floor = new CANNON.Body({
		type: CANNON.Body.STATIC,
		shape: new CANNON.Plane(),
	})
	floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
	world.addBody(floor)
	for (const [x, y, z, hx, hy, hz] of [
		[0, ROOF / 2, HALF_Z + T, HALF_X + T * 2, ROOF, T],
		[0, ROOF / 2, -HALF_Z - T, HALF_X + T * 2, ROOF, T],
		[HALF_X + T, ROOF / 2, 0, T, ROOF, HALF_Z + T * 2],
		[-HALF_X - T, ROOF / 2, 0, T, ROOF, HALF_Z + T * 2],
		[0, ROOF + T, 0, HALF_X + T * 2, T, HALF_Z + T * 2],
	]) {
		const wall = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Box(new CANNON.Vec3(hx, hy, hz)),
		})
		wall.position.set(x, y, z)
		world.addBody(wall)
	}
	const pusher = new CANNON.Body({
		type: CANNON.Body.KINEMATIC,
		shape: new CANNON.Sphere(VAULT.pushRadius),
	})
	pusher.position.set(0, -5, 0)
	world.addBody(pusher)
	return { world, pusher }
}

export const vaultCoinCount = (free: number, total: number) =>
	free > 0 && total > 0
		? Math.max(3, Math.round((VAULT.maxCoins * free) / total))
		: 0

export function addVaultCoins(
	stage: ThreeStage,
	world: CANNON.World,
	count: number
) {
	const face = stage.keep(new THREE.CanvasTexture(coinSprite(128, stage.css)))
	face.colorSpace = THREE.SRGBColorSpace
	const faceMaterial = stage.keep(
		new THREE.MeshToonMaterial({ map: face, transparent: true })
	)
	const coinGeometry = stage.keep(
		new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_H, 28)
	)
	const rimMaterial = stage.keep(
		new THREE.MeshToonMaterial({ color: stage.color('--color-maiz-2') })
	)
	const coins: VaultCoin[] = []
	for (let i = 0; i < count; i++) {
		const body = new CANNON.Body({
			mass: 0.2,
			shape: new CANNON.Cylinder(COIN_R, COIN_R, COIN_H, 12),
			linearDamping: 0.25,
			angularDamping: 0.35,
			sleepSpeedLimit: 0.15,
		})
		body.position.set(
			(Math.random() - 0.5) * HALF_X * 1.6,
			stage.reducedMotion
				? COIN_H / 2 + (i % 3) * COIN_H
				: 0.4 + (i % 12) * 0.11,
			(Math.random() - 0.5) * HALF_Z * 1.6
		)
		body.quaternion.setFromEuler(
			(Math.random() - 0.5) * 0.8,
			Math.random() * Math.PI,
			(Math.random() - 0.5) * 0.8
		)
		world.addBody(body)
		const mesh = new THREE.Mesh(coinGeometry, [
			rimMaterial,
			faceMaterial,
			faceMaterial,
		])
		stage.scene.add(mesh)
		coins.push({ mesh, body })
	}
	return coins
}

export function containCoin({ mesh, body }: VaultCoin) {
	const position = body.position
	const velocity = body.velocity
	if (position.y < -1) {
		position.set(0, 1, 0)
		velocity.setZero()
	}
	const speed = velocity.length()
	if (speed > VAULT.maxCoinSpeed)
		velocity.scale(VAULT.maxCoinSpeed / speed, velocity)
	const limitX = HALF_X - COIN_R
	const limitZ = HALF_Z - COIN_R
	if (Math.abs(position.x) > limitX) {
		position.x = Math.sign(position.x) * limitX
		velocity.x = -velocity.x * 0.4
	}
	if (Math.abs(position.z) > limitZ) {
		position.z = Math.sign(position.z) * limitZ
		velocity.z = -velocity.z * 0.4
	}
	if (position.y > ROOF - COIN_R) {
		position.y = ROOF - COIN_R
		velocity.y = -Math.abs(velocity.y) * 0.4
	}
	mesh.position.set(position.x, position.y, position.z)
	const q = body.quaternion
	mesh.quaternion.set(q.x, q.y, q.z, q.w)
}
