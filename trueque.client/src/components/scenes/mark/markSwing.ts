import * as THREE from 'three'

import {
	MARK_NAIL_Y,
	MARK_RELEASE_STALE_MS,
	MARK_SPIN,
	MARK_SWING,
	MARK_TAP_ANGLE,
} from '@/constants/scene/markScene'
import { castPointer } from '@/utils/three/stage'

type SwingOptions = {
	canvas: HTMLCanvasElement
	camera: THREE.Camera
	swing: THREE.Group
	reducedMotion: boolean
}

export function createMarkSwing({
	canvas,
	camera,
	swing,
	reducedMotion,
}: SwingOptions) {
	const ray = new THREE.Raycaster()
	const ndc = new THREE.Vector2()
	const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
	const aim = new THREE.Vector3()
	const state = {
		angle: 0,
		speed: 0,
		spin: 0,
		twist: 0,
		held: false,
		lastT: 0,
		moved: 0,
	}

	const cast = (e: PointerEvent) => castPointer(e, canvas, camera, ray, ndc)
	const isOverMark = () => ray.intersectObject(swing, true).length > 0

	const pointerdown = (e: PointerEvent) => {
		cast(e)
		if (!isOverMark()) return
		state.held = true
		state.moved = 0
		state.lastT = e.timeStamp
		canvas.setPointerCapture(e.pointerId)
		canvas.style.cursor = 'var(--cur-grabbing)'
	}

	const pointermove = (e: PointerEvent) => {
		cast(e)
		if (!state.held) {
			canvas.style.cursor = isOverMark() ? 'var(--cur-grab)' : ''
			return
		}
		if (!ray.ray.intersectPlane(dragPlane, aim)) return
		const next = THREE.MathUtils.clamp(
			Math.atan2(aim.x, MARK_NAIL_Y - aim.y),
			-MARK_SWING.maxAngle,
			MARK_SWING.maxAngle
		)
		const dt = Math.max((e.timeStamp - state.lastT) / 1000, 1 / 240)
		state.lastT = e.timeStamp
		state.speed = THREE.MathUtils.lerp(
			state.speed,
			(next - state.angle) / dt,
			0.5
		)
		state.moved += Math.abs(next - state.angle)
		state.angle = next
	}

	const release = (e: PointerEvent) => {
		if (!state.held) return
		state.held = false
		canvas.style.cursor = 'var(--cur-grab)'
		if (e.timeStamp - state.lastT > MARK_RELEASE_STALE_MS) state.speed = 0
		state.twist +=
			state.moved < MARK_TAP_ANGLE
				? MARK_SPIN.tapKick
				: state.speed * MARK_SPIN.throwGain
	}

	const click = (e: MouseEvent) => {
		if (state.moved < MARK_TAP_ANGLE) return
		e.preventDefault()
		state.moved = 0
	}

	const step = (dt: number, elapsed: number) => {
		if (!state.held) {
			const breeze = reducedMotion
				? 0
				: Math.sin(elapsed * 1.3) * MARK_SWING.breeze
			state.speed +=
				(-MARK_SWING.stiffness * Math.sin(state.angle) -
					MARK_SWING.damping * state.speed +
					breeze) *
				dt
			state.angle += state.speed * dt
		}
		const rest = Math.round(state.spin / (Math.PI * 2)) * Math.PI * 2
		state.twist +=
			(-MARK_SPIN.stiffness * (state.spin - rest) -
				MARK_SPIN.damping * state.twist) *
			dt
		state.spin += state.twist * dt
		swing.rotation.z = state.angle
		swing.rotation.y = state.spin
	}

	return {
		handlers: {
			pointerdown,
			pointermove,
			pointerup: release,
			pointercancel: release,
			click,
		},
		step,
	}
}
