import { type RefObject, useEffect } from 'react'
import * as THREE from 'three'

import { buildMarkModel } from '@/components/scenes/mark/mark_model'
import { createMarkSwing } from '@/components/scenes/mark/mark_swing'
import { MARK_CAMERA_FOV } from '@/constants/scene/mark_scene'
import { createStage } from '@/utils/three/stage'

export function useMarkScene(host: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const el = host.current
		if (!el) return
		const stage = createStage(el, 'mark3d__canvas')
		const { renderer, canvas } = stage

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(MARK_CAMERA_FOV, 1, 0.1, 50)
		camera.position.set(0, 0, 2 / Math.tan(THREE.MathUtils.degToRad(MARK_CAMERA_FOV / 2)))

		const swing = buildMarkModel(stage, scene)

		stage.observeSize(canvas, () => {
			const w = canvas.clientWidth
			const h = canvas.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
		})

		const controls = createMarkSwing({ canvas, camera, swing, reducedMotion: stage.reducedMotion })
		stage.listen(controls.handlers)

		const clock = new THREE.Clock()
		renderer.setAnimationLoop(() => {
			const dt = Math.min(clock.getDelta(), 1 / 30)
			controls.step(dt, clock.elapsedTime)
			renderer.render(scene, camera)
		})

		return stage.dispose
	}, [host])
}
