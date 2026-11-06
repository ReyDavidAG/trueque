import { TOUR_ORBIT } from '@/constants/scene/tourScene'

export function createTourOrbit(canvas: HTMLCanvasElement) {
	const drag = { on: false, x: 0, y: 0, pitch: 0, yaw: 0 }

	const pointerdown = (e: PointerEvent) => {
		Object.assign(drag, { on: true, x: e.clientX, y: e.clientY })
		canvas.setPointerCapture(e.pointerId)
	}
	const pointermove = (e: PointerEvent) => {
		if (!drag.on) return
		drag.yaw += (e.clientX - drag.x) * TOUR_ORBIT.yawGain
		drag.pitch += (e.clientY - drag.y) * TOUR_ORBIT.pitchGain
		drag.pitch = Math.max(
			-TOUR_ORBIT.maxPitch,
			Math.min(TOUR_ORBIT.maxPitch, drag.pitch)
		)
		drag.x = e.clientX
		drag.y = e.clientY
	}
	const release = () => {
		drag.on = false
	}

	const settle = (dt: number) => {
		if (drag.on) return
		const pull = Math.min(1, dt * TOUR_ORBIT.settleRate)
		drag.pitch -= drag.pitch * pull
		drag.yaw -= drag.yaw * pull
	}

	return {
		handlers: {
			pointerdown,
			pointermove,
			pointerup: release,
			pointercancel: release,
		},
		settle,
		rotation: () => [drag.pitch, drag.yaw] as const,
	}
}
