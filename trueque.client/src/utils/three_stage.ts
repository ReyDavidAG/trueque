import * as THREE from 'three'

import { prefersReducedMotion } from '@/utils/reduced_motion'
import { tokenColors } from '@/utils/token_color'

type Disposable = { dispose: () => void }

type StageOptions = {
	className: string
	fov: number
	near: number
	far: number
	shadows?: boolean
	prepend?: boolean
	onFit?: (camera: THREE.PerspectiveCamera) => void
}

export type ThreeStage = ReturnType<typeof createThreeStage>

export function createThreeStage(host: HTMLElement, options: StageOptions) {
	const css = getComputedStyle(host)
	const color = tokenColors(css)
	const reducedMotion = prefersReducedMotion()
	const disposables: Disposable[] = []
	const cleanups: (() => void)[] = []
	const keep = <T extends Disposable>(item: T) => {
		disposables.push(item)
		return item
	}

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
	if (options.shadows) {
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap
	}
	const canvas = renderer.domElement
	canvas.className = options.className
	if (options.prepend) host.prepend(canvas)
	else host.appendChild(canvas)

	const scene = new THREE.Scene()
	const camera = new THREE.PerspectiveCamera(options.fov, 1, options.near, options.far)

	const fit = () => {
		const width = host.clientWidth
		const height = host.clientHeight
		if (!width || !height) return
		renderer.setSize(width, height, false)
		camera.aspect = width / height
		options.onFit?.(camera)
		camera.updateProjectionMatrix()
	}

	const listen = <K extends keyof HTMLElementEventMap>(
		type: K,
		handler: (event: HTMLElementEventMap[K]) => void
	) => {
		canvas.addEventListener(type, handler)
		cleanups.push(() => canvas.removeEventListener(type, handler))
	}

	const toNdc = (event: PointerEvent, out: THREE.Vector2) => {
		const rect = canvas.getBoundingClientRect()
		out.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		)
		return rect
	}

	const start = (frame: (now: number) => void) => {
		const resize = new ResizeObserver(fit)
		resize.observe(host)
		fit()
		cleanups.unshift(() => resize.disconnect())
		renderer.setAnimationLoop(frame)
	}

	const dispose = () => {
		renderer.setAnimationLoop(null)
		for (const cleanup of cleanups) cleanup()
		for (const item of disposables) item.dispose()
		renderer.dispose()
		canvas.remove()
	}

	return {
		css,
		color,
		reducedMotion,
		keep,
		renderer,
		canvas,
		scene,
		camera,
		listen,
		toNdc,
		onCleanup: (cleanup: () => void) => cleanups.push(cleanup),
		start,
		dispose,
	}
}

export function outlineMaterial(stage: ThreeStage) {
	return stage.keep(
		new THREE.MeshBasicMaterial({
			color: stage.color('--color-ink'),
			side: THREE.BackSide,
		})
	)
}
