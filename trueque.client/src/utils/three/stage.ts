import * as THREE from 'three'

import { tokenColors } from '@/utils/tokenColor'

import { createDisposables } from './disposables'

export type PointerHandlers = Partial<
	Record<
		'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
		(e: PointerEvent) => void
	>
> & { click?: (e: MouseEvent) => void }

export function createStage(host: HTMLElement, canvasClass: string) {
	const css = getComputedStyle(host)
	const cssVar = (name: string) => css.getPropertyValue(name).trim()
	const color = tokenColors(css)
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
	const { keep, disposeAll } = createDisposables()

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
	const canvas = renderer.domElement
	canvas.className = canvasClass
	host.appendChild(canvas)

	const detachers: (() => void)[] = []

	const listen = (handlers: PointerHandlers) => {
		for (const [type, handler] of Object.entries(handlers)) {
			const listener = handler as EventListener
			canvas.addEventListener(type, listener)
			detachers.push(() => canvas.removeEventListener(type, listener))
		}
	}

	const observeSize = (target: Element, fit: () => void) => {
		const observer = new ResizeObserver(fit)
		observer.observe(target)
		detachers.push(() => observer.disconnect())
		fit()
	}

	const dispose = () => {
		renderer.setAnimationLoop(null)
		for (const detach of detachers) detach()
		disposeAll()
		renderer.dispose()
		renderer.forceContextLoss()
		canvas.remove()
	}

	return {
		css,
		cssVar,
		color,
		reducedMotion,
		keep,
		renderer,
		canvas,
		listen,
		observeSize,
		dispose,
	}
}

export type Stage = ReturnType<typeof createStage>

export function castPointer(
	e: PointerEvent,
	canvas: HTMLCanvasElement,
	camera: THREE.Camera,
	ray: THREE.Raycaster,
	ndc: THREE.Vector2
) {
	const rect = canvas.getBoundingClientRect()
	ndc.set(
		((e.clientX - rect.left) / rect.width) * 2 - 1,
		-((e.clientY - rect.top) / rect.height) * 2 + 1
	)
	ray.setFromCamera(ndc, camera)
}
