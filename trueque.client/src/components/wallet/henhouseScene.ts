import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { createHenKit, peck } from '@/components/scenes/hen/henKit'
import { createHenPalette } from '@/components/scenes/hen/henPalette'
import { HENHOUSE } from '@/constants/henhouse'
import type { EggInfo, HenFlock, HenhouseTip } from '@/types/henhouseType'
import { easeOutBack } from '@/utils/easing'
import { seededRandom } from '@/utils/seededRandom'
import { createThreeStage, type ThreeStage } from '@/utils/threeStage'

import { type Growth, settleHens } from './henhouseNesting'
import { buildHenhouseYard, nestSpots } from './henhouseYard'

type MountOptions = {
	host: HTMLDivElement
	flocks: HenFlock[]
	labels: (HTMLLIElement | null)[]
	onTip: (tip: HenhouseTip | null) => void
}

function createControls({
	camera,
	canvas,
	reducedMotion,
	onCleanup,
}: ThreeStage) {
	const controls = new OrbitControls(camera, canvas)
	Object.assign(controls, {
		enableDamping: true,
		enablePan: false,
		minDistance: 5,
		maxDistance: 22,
		minPolarAngle: 0.35,
		maxPolarAngle: 1.38,
		autoRotate: !reducedMotion,
		autoRotateSpeed: 0.6,
	})
	controls.target.set(0, 0.6, 0)
	controls.addEventListener('start', () => {
		controls.autoRotate = false
	})
	onCleanup(() => controls.dispose())
	return controls
}

function placeCamera(host: HTMLElement, camera: THREE.PerspectiveCamera) {
	const width = HENHOUSE.yardRadius * 2 - 4
	const aspect = Math.max(1, host.clientWidth / Math.max(1, host.clientHeight))
	const distance = Math.min(
		19,
		Math.max(
			9,
			(width / 2 + 3) / Math.tan(THREE.MathUtils.degToRad(17)) / aspect
		)
	)
	camera.position.set(0, distance * 0.6, distance)
}

function bindEggHover(
	stage: ThreeStage,
	eggs: THREE.Mesh[],
	highlight: THREE.Material,
	onTip: MountOptions['onTip']
) {
	const ray = new THREE.Raycaster()
	const ndc = new THREE.Vector2()
	let hovered: THREE.Mesh | null = null
	const restore = (mesh: THREE.Mesh) => {
		mesh.material = (mesh.userData as { base: THREE.Material }).base
	}
	const point = (event: PointerEvent) => {
		const rect = stage.toNdc(event, ndc)
		ray.setFromCamera(ndc, stage.camera)
		const hit = ray.intersectObjects(eggs, false)[0]?.object as
			| THREE.Mesh
			| undefined
		if (hovered && hovered !== hit) restore(hovered)
		hovered = hit ?? null
		stage.canvas.style.cursor = hit ? 'var(--cur-pointer)' : ''
		if (!hit) {
			onTip(null)
			return
		}
		hit.material = highlight
		onTip({
			...(hit.userData as EggInfo),
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		})
	}
	const leave = () => {
		if (hovered) restore(hovered)
		hovered = null
		onTip(null)
	}
	stage.listen('pointermove', point)
	stage.listen('pointerdown', point)
	stage.listen('pointerleave', leave)
}

function grow(growths: Growth[], elapsed: number, reducedMotion: boolean) {
	for (const growth of growths) {
		const k = reducedMotion
			? 1
			: easeOutBack((elapsed - growth.delay) / HENHOUSE.growMs)
		growth.obj.visible = k > 0.001
		growth.obj.scale.setScalar(Math.max(0.001, k) * growth.size)
	}
}

export function mountHenhouseScene({
	host,
	flocks,
	labels,
	onTip,
}: MountOptions) {
	const stage = createThreeStage(host, {
		className: 'henhouse__canvas',
		fov: 34,
		near: 0.1,
		far: 100,
		shadows: true,
		prepend: true,
	})
	const palette = createHenPalette(stage)
	const random = seededRandom(flocks.length * 97 + flocks[0].total)
	buildHenhouseYard(stage, palette, random)
	const kit = createHenKit(stage, palette, random)
	const { growths, eggs, anchors, hens } = settleHens(
		stage.scene,
		kit,
		random,
		flocks,
		nestSpots(random)
	)

	const controls = createControls(stage)
	placeCamera(host, stage.camera)
	bindEggHover(stage, eggs, kit.eggHighlight, onTip)

	const projected = new THREE.Vector3()
	const startedAt = performance.now()
	stage.start(now => {
		const elapsed = now - startedAt
		grow(growths, elapsed, stage.reducedMotion)
		if (!stage.reducedMotion) peck(hens, elapsed / 1000)
		controls.update()
		anchors.forEach((anchor, i) => {
			const label = labels[i]
			if (!label) return
			projected.copy(anchor).project(stage.camera)
			const x = ((projected.x + 1) / 2) * host.clientWidth
			const y = ((1 - projected.y) / 2) * host.clientHeight
			label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
			label.style.opacity = projected.z < 1 ? '1' : '0'
		})
		stage.renderer.render(stage.scene, stage.camera)
	})

	return stage.dispose
}
