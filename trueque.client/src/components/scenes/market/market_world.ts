import * as CANNON from 'cannon-es'
import * as THREE from 'three'

import { MARKET_BOUNDS } from '@/constants/scene/market_scene'
import type { Stage } from '@/utils/three/stage'

export function createPhysicsWorld() {
	const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.8, 0), allowSleep: true })
	world.broadphase = new CANNON.SAPBroadphase(world)
	;(world.solver as CANNON.GSSolver).iterations = 16
	Object.assign(world.defaultContactMaterial, {
		friction: 0.45,
		restitution: 0.22,
		contactEquationStiffness: 5e7,
		contactEquationRelaxation: 3,
	})
	const wall = (x: number, y: number, z: number, rx: number, ry: number) => {
		const body = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane() })
		body.position.set(x, y, z)
		body.quaternion.setFromEuler(rx, ry, 0)
		world.addBody(body)
	}
	wall(0, 0, 0, -Math.PI / 2, 0)
	wall(-MARKET_BOUNDS.x, 0, 0, 0, Math.PI / 2)
	wall(MARKET_BOUNDS.x, 0, 0, 0, -Math.PI / 2)
	wall(0, 0, MARKET_BOUNDS.zMin, 0, 0)
	wall(0, 0, MARKET_BOUNDS.zMax, 0, Math.PI)
	return world
}

export function createLitScene({ color, keep }: Stage) {
	const scene = new THREE.Scene()
	scene.add(new THREE.HemisphereLight(color('--color-estraza'), color('--color-cacao'), 1.4))
	const sun = new THREE.DirectionalLight(color('--color-amate'), 2)
	sun.position.set(3, 7, 5)
	sun.castShadow = true
	sun.shadow.mapSize.set(1024, 1024)
	Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 })
	scene.add(sun)

	const ground = new THREE.Mesh(
		keep(new THREE.PlaneGeometry(30, 30)),
		keep(new THREE.ShadowMaterial({ color: color('--color-ink'), opacity: 0.18 }))
	)
	ground.rotation.x = -Math.PI / 2
	ground.receiveShadow = true
	scene.add(ground)
	return scene
}
