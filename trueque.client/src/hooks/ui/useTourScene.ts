import { type RefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { hourglassModel } from '@/components/scenes/tour/hourglassModel'
import { createTourKit, type TourModel } from '@/components/scenes/tour/tourKit'
import {
	chooseModel,
	earnModel,
	showModel,
	tradeModel,
} from '@/components/scenes/tour/tourModels'
import { createTourOrbit } from '@/components/scenes/tour/tourOrbit'
import {
	TOUR_CAMERA,
	TOUR_SPIN_TURN,
	TOUR_SWAP_MS,
} from '@/constants/scene/tourScene'
import { easeOutBack } from '@/utils/three/easing'
import { createStage } from '@/utils/three/stage'

function createSwapper(models: TourModel[], reducedMotion: boolean) {
	let shown = -1
	let leaving = -1
	let swapAt = 0
	return (wanted: number, now: number, t: number) => {
		if (wanted !== shown) {
			if (shown >= 0) leaving = shown
			shown = wanted
			swapAt = now
			models[shown].group.visible = true
		}
		const k = reducedMotion ? 1 : Math.min(1, (now - swapAt) / TOUR_SWAP_MS)
		models.forEach((m, i) => {
			if (i === shown) {
				m.group.scale.setScalar(Math.max(0.001, easeOutBack(k)))
				m.group.rotation.y = (1 - k) * -TOUR_SPIN_TURN
			} else if (i === leaving && k < 1) {
				const out = 1 - k
				m.group.scale.setScalar(Math.max(0.001, out * out))
				m.group.rotation.y = k * TOUR_SPIN_TURN
			} else m.group.visible = false
			if (m.group.visible) m.update(t)
		})
	}
}

export function useTourScene(
	host: RefObject<HTMLElement | null>,
	step: number
) {
	const stepRef = useRef(step)

	useEffect(() => {
		stepRef.current = step
	}, [step])

	useEffect(() => {
		const el = host.current
		if (!el) return
		const stage = createStage(el, 'tour__canvas')
		const { renderer, canvas, color, reducedMotion } = stage

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(TOUR_CAMERA.fov, 1, 0.1, 50)
		camera.position.set(0, TOUR_CAMERA.y, TOUR_CAMERA.z)
		camera.lookAt(0, 0, 0)
		scene.add(
			new THREE.HemisphereLight(
				color('--color-estraza'),
				color('--color-cacao'),
				1.6
			)
		)
		const sun = new THREE.DirectionalLight(color('--color-amate'), 2.2)
		sun.position.set(3, 4, 5)
		scene.add(sun)

		const kit = createTourKit(stage)
		const models = [
			earnModel,
			chooseModel,
			tradeModel,
			showModel,
			hourglassModel,
		].map(make => make(kit))
		const holder = new THREE.Group()
		scene.add(holder)
		for (const m of models) {
			m.group.visible = false
			holder.add(m.group)
		}

		const orbit = createTourOrbit(canvas)
		stage.listen(orbit.handlers)
		const swap = createSwapper(models, reducedMotion)
		const clock = new THREE.Clock()
		let previous = performance.now()

		const draw = (now: number) => {
			const dt = Math.min((now - previous) / 1000, 1 / 30)
			previous = now
			swap(stepRef.current, now, reducedMotion ? 1 : clock.getElapsedTime())
			orbit.settle(dt)
			const [pitch, yaw] = orbit.rotation()
			holder.rotation.set(pitch, yaw, 0)
			renderer.render(scene, camera)
		}

		stage.observeSize(el, () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
			if (reducedMotion) draw(performance.now())
		})
		renderer.setAnimationLoop(now => draw(now))

		return stage.dispose
	}, [host])
}
