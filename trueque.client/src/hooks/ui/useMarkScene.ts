import { type RefObject, useEffect } from 'react'
import * as THREE from 'three'

import { buildMarkModel } from '@/components/scenes/mark/markModel'
import { createMarkSwing } from '@/components/scenes/mark/markSwing'
import { MARK_CAMERA_FOV } from '@/constants/scene/markScene'
import { createStage } from '@/utils/three/stage'

export function useMarkScene(host: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const el = host.current
		if (!el) return
		const stage = createStage(el, 'mark3d__canvas')
		const { renderer, canvas } = stage

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(MARK_CAMERA_FOV, 1, 0.1, 50)
		camera.position.set(
			0,
			0,
			2 / Math.tan(THREE.MathUtils.degToRad(MARK_CAMERA_FOV / 2))
		)

		const swing = buildMarkModel(stage, scene)
		let needsRender = true

		stage.observeSize(canvas, () => {
			const w = canvas.clientWidth
			const h = canvas.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
			needsRender = true
		})

		const controls = createMarkSwing({
			canvas,
			camera,
			swing,
			reducedMotion: stage.reducedMotion,
		})
		stage.listen(controls.handlers)

		const clock = new THREE.Clock()
		const frame = () => {
			const dt = Math.min(clock.getDelta(), 1 / 30)
			const moving = controls.step(dt, clock.elapsedTime)
			if (!moving && !needsRender) return
			renderer.render(scene, camera)
			needsRender = false
		}

		const visibility = new IntersectionObserver(([entry]) => {
			clock.getDelta()
			renderer.setAnimationLoop(entry.isIntersecting ? frame : null)
		})
		visibility.observe(canvas)

		return () => {
			visibility.disconnect()
			stage.dispose()
		}
	}, [host])
}
