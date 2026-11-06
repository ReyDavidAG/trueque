import { type RefObject, useEffect } from 'react'
import * as THREE from 'three'

import { scatterFruits } from '@/components/scenes/market/fruit_layout'
import { createMarketKit } from '@/components/scenes/market/market_kit'
import { createMarketPointer } from '@/components/scenes/market/market_pointer'
import { createLitScene, createPhysicsWorld } from '@/components/scenes/market/market_world'
import { copyBodyToMesh } from '@/components/scenes/market/market_math'
import { buildStalls } from '@/components/scenes/market/stall_builder'
import { createStallDamage } from '@/components/scenes/market/stall_damage'
import { createStallRebuild } from '@/components/scenes/market/stall_rebuild'
import {
	CAMERA_TARGET,
	CAMERA_VIEW,
	GRAB_FOLLOW,
	MAX_FRUIT_SPEED,
	PHYSICS_STEP,
} from '@/constants/scene/market_scene'
import { createStage } from '@/utils/three/stage'

const CANVAS_LABEL =
	'Tres puestos de mercado con fruta: arrastra la fruta o los pedazos para lanzarlos, o da clics a un puesto para irlo desarmando'

export function useMarketScene(host: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const el = host.current
		if (!el) return
		const stage = createStage(el, 'scene3d')
		const { renderer, canvas } = stage
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap
		canvas.setAttribute('role', 'img')
		canvas.setAttribute('aria-label', CANVAS_LABEL)

		const scene = createLitScene(stage)
		const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
		const world = createPhysicsWorld()
		const kit = createMarketKit(stage, scene, world)
		const { stalls, parts } = buildStalls(kit)
		const fruits = scatterFruits(kit, stalls.length)

		stage.observeSize(el, () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
			const distance = Math.max(4.3 / (halfFov * camera.aspect), 1.75 / halfFov)
			camera.position.copy(CAMERA_VIEW).multiplyScalar(distance).add(CAMERA_TARGET)
			camera.lookAt(CAMERA_TARGET)
			camera.updateProjectionMatrix()
		})

		const damage = createStallDamage(fruits, parts)
		const pointer = createMarketPointer({
			canvas,
			camera,
			pickable: [...fruits.map(f => f.mesh), ...parts.map(p => p.mesh)],
			damage,
			reducedMotion: stage.reducedMotion,
		})
		stage.listen(pointer.handlers)
		const settle = createStallRebuild(fruits, damage.wakeAll)

		const followGrab = () => {
			const grab = pointer.current()
			if (!grab) return
			const { body } = grab
			const { target } = pointer
			body.wakeUp()
			body.velocity.set(
				(target.x - body.position.x) * GRAB_FOLLOW,
				(target.y - body.position.y) * GRAB_FOLLOW,
				(target.z - body.position.z) * GRAB_FOLLOW
			)
			body.angularVelocity.scale(0.9, body.angularVelocity)
		}

		const clock = new THREE.Clock()
		renderer.setAnimationLoop(() => {
			const dt = Math.min(clock.getDelta(), 1 / 20)
			const now = performance.now()
			followGrab()
			for (const f of fruits) {
				const velocity = f.body.velocity
				const speed = velocity.length()
				if (speed > MAX_FRUIT_SPEED) velocity.scale(MAX_FRUIT_SPEED / speed, velocity)
			}
			world.step(PHYSICS_STEP, dt, 8)
			const heldStall = pointer.current()?.part?.stall
			for (const s of stalls) settle(s, now, heldStall === s)
			for (const f of fruits) copyBodyToMesh(f.body, f.mesh)
			renderer.render(scene, camera)
		})

		return stage.dispose
	}, [host])
}
