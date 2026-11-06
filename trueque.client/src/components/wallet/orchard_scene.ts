import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { ORCHARD } from '@/constants/orchard'
import type { OrchardTip, OrchardTree, PodInfo } from '@/types/orchard_type'
import { easeOutBack } from '@/utils/easing'
import { seededRandom } from '@/utils/seeded_random'
import { createThreeStage, type ThreeStage } from '@/utils/three_stage'

import { buildOrchardField, treeSpots } from './orchard_field'
import { createOrchardPalette } from './orchard_palette'
import { type Growth, plantOrchard } from './orchard_planting'
import { createTreeKit } from './orchard_tree_kit'

type MountOptions = {
	host: HTMLDivElement
	trees: OrchardTree[]
	labels: (HTMLLIElement | null)[]
	onTip: (tip: OrchardTip | null) => void
}

function createControls({ camera, canvas, reducedMotion, onCleanup }: ThreeStage) {
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
	controls.target.set(0, 1.1, 0)
	controls.addEventListener('start', () => {
		controls.autoRotate = false
	})
	onCleanup(() => controls.dispose())
	return controls
}

function placeCamera(host: HTMLElement, camera: THREE.PerspectiveCamera) {
	const width = ORCHARD.fieldRadius * 2 - 4
	const aspect = Math.max(1, host.clientWidth / Math.max(1, host.clientHeight))
	const distance = Math.min(
		19,
		Math.max(9, (width / 2 + 3) / Math.tan(THREE.MathUtils.degToRad(17)) / aspect)
	)
	camera.position.set(0, distance * 0.55, distance)
}

function bindPodHover(
	stage: ThreeStage,
	pods: THREE.Mesh[],
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
		const hit = ray.intersectObjects(pods, false)[0]?.object as THREE.Mesh | undefined
		if (hovered && hovered !== hit) restore(hovered)
		hovered = hit ?? null
		stage.canvas.style.cursor = hit ? 'var(--cur-pointer)' : ''
		if (!hit) {
			onTip(null)
			return
		}
		hit.material = highlight
		const info = hit.userData as PodInfo
		onTip({ ...info, x: event.clientX - rect.left, y: event.clientY - rect.top })
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
		const k = reducedMotion ? 1 : easeOutBack((elapsed - growth.delay) / ORCHARD.growMs)
		growth.obj.visible = k > 0.001
		growth.obj.scale.setScalar(Math.max(0.001, k) * growth.size)
	}
}

export function mountOrchardScene({ host, trees, labels, onTip }: MountOptions) {
	const stage = createThreeStage(host, {
		className: 'orchard__canvas',
		fov: 34,
		near: 0.1,
		far: 100,
		shadows: true,
		prepend: true,
	})
	const palette = createOrchardPalette(stage)
	const random = seededRandom(trees.length * 97 + trees[0].total)
	buildOrchardField(stage, palette, random)
	const spots = treeSpots(random)
	const kit = createTreeKit(stage, palette, random)
	const { growths, pods, anchors } = plantOrchard(
		stage.scene,
		palette,
		kit,
		random,
		trees,
		spots
	)

	const controls = createControls(stage)
	placeCamera(host, stage.camera)
	bindPodHover(stage, pods, kit.podHighlight, onTip)

	const projected = new THREE.Vector3()
	const startedAt = performance.now()
	stage.start(now => {
		grow(growths, now - startedAt, stage.reducedMotion)
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
