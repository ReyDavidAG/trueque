import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { POD_PATHS } from '@/components/ui/art'
import { tokenColors } from '@/utils/token_color'

const U = 1 / 256
const BOARD = { w: 446, h: 312, r: 57, depth: 34, y: 331 - 60, tilt: (6 * Math.PI) / 180 }
const NAIL_Y = (256 - 60) * U
const STRING = [
	[-110, -130],
	[0, -6],
	[110, -130],
] as const
const SWING_K = 18
const SWING_DAMP = 1.4
const SPIN_K = 9
const SPIN_DAMP = 1.6
const UP = new THREE.Vector3(0, 1, 0)

function roundedRect(w: number, h: number, r: number) {
	const x = -w / 2
	const y = -h / 2
	const s = new THREE.Shape()
	s.moveTo(x + r, y)
	s.lineTo(x + w - r, y)
	s.quadraticCurveTo(x + w, y, x + w, y + r)
	s.lineTo(x + w, y + h - r)
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
	s.lineTo(x + r, y + h)
	s.quadraticCurveTo(x, y + h, x, y + h - r)
	s.lineTo(x, y + r)
	s.quadraticCurveTo(x, y, x + r, y)
	return s
}

export function MarkScene() {
	const host = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		const el = host.current
		if (!el) return
		const css = getComputedStyle(el)
		const cssVar = (name: string) => css.getPropertyValue(name).trim()
		const color = tokenColors(css)
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
		const trash: { dispose: () => void }[] = []
		const keep = <T extends { dispose: () => void }>(item: T) => {
			trash.push(item)
			return item
		}

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
		const canvas = renderer.domElement
		canvas.className = 'mark3d__canvas'
		el.appendChild(canvas)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
		camera.position.set(0, 0, 2 / Math.tan(THREE.MathUtils.degToRad(15)))

		const face = document.createElement('canvas')
		face.width = BOARD.w * 2
		face.height = BOARD.h * 2
		const g = face.getContext('2d')
		if (g) {
			g.scale(2, 2)
			g.translate(BOARD.w / 2, BOARD.h / 2)
			g.beginPath()
			g.roundRect(-212, -145, 424, 290, 46)
			g.fillStyle = cssVar('--color-grana')
			g.fill()
			g.lineWidth = 22
			g.strokeStyle = cssVar('--color-ink')
			g.stroke()
			g.rotate((-58 * Math.PI) / 180)
			g.scale(0.58, 0.58)
			g.translate(-256, -256)
			const body = new Path2D(POD_PATHS.body)
			g.fillStyle = cssVar('--color-maiz')
			g.fill(body)
			g.fillStyle = cssVar('--color-maiz-2')
			g.fill(new Path2D(POD_PATHS.rib))
			g.lineWidth = 18
			g.lineJoin = 'round'
			g.lineCap = 'round'
			g.stroke(body)
			g.stroke(new Path2D(POD_PATHS.stem))
		}
		const map = keep(new THREE.CanvasTexture(face))
		map.colorSpace = THREE.SRGBColorSpace
		map.anisotropy = 4

		const ink = keep(new THREE.MeshBasicMaterial({ color: color('--color-ink') }))
		const faceMat = keep(
			new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5 }),
		)
		const plane = keep(new THREE.PlaneGeometry(BOARD.w * U, BOARD.h * U))
		const slab = keep(
			new THREE.ExtrudeGeometry(roundedRect(BOARD.w * U, BOARD.h * U, BOARD.r * U), {
				depth: BOARD.depth * U,
				bevelEnabled: false,
				curveSegments: 8,
			}),
		)
		slab.center()
		const rod = keep(new THREE.CylinderGeometry(10 * U, 10 * U, 1, 8))
		const knot = keep(new THREE.SphereGeometry(10 * U, 10, 8))
		const nailGeo = keep(new THREE.SphereGeometry(26 * U, 16, 12))

		const root = new THREE.Group()
		root.position.y = NAIL_Y
		scene.add(root)
		root.add(new THREE.Mesh(nailGeo, ink))

		const swing = new THREE.Group()
		swing.rotation.order = 'ZYX'
		root.add(swing)

		const board = new THREE.Group()
		board.position.y = -BOARD.y * U
		board.rotation.z = BOARD.tilt
		swing.add(board)
		board.add(new THREE.Mesh(slab, ink))
		const front = new THREE.Mesh(plane, faceMat)
		front.position.z = (BOARD.depth / 2 + 0.5) * U
		const back = new THREE.Mesh(plane, faceMat)
		back.position.z = -front.position.z
		back.rotation.y = Math.PI
		board.add(front, back)

		const points = STRING.map(([x, y]) => new THREE.Vector3(x * U, y * U, 0))
		for (let i = 0; i < points.length - 1; i++) {
			const a = points[i]
			const b = points[i + 1]
			const m = new THREE.Mesh(rod, ink)
			m.position.copy(a).add(b).multiplyScalar(0.5)
			m.scale.y = a.distanceTo(b)
			m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize())
			swing.add(m)
		}
		for (const p of points) {
			const k = new THREE.Mesh(knot, ink)
			k.position.copy(p)
			swing.add(k)
		}

		const fit = () => {
			const w = canvas.clientWidth
			const h = canvas.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
		}
		const resize = new ResizeObserver(fit)
		resize.observe(canvas)
		fit()

		const ray = new THREE.Raycaster()
		const ndc = new THREE.Vector2()
		const drag = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
		const aim = new THREE.Vector3()
		const state = { angle: 0, speed: 0, spin: 0, twist: 0, held: false, lastT: 0, moved: 0 }

		const cast = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect()
			ndc.set(
				((e.clientX - r.left) / r.width) * 2 - 1,
				-((e.clientY - r.top) / r.height) * 2 + 1,
			)
			ray.setFromCamera(ndc, camera)
		}

		const down = (e: PointerEvent) => {
			cast(e)
			if (!ray.intersectObject(swing, true).length) return
			state.held = true
			state.moved = 0
			state.lastT = e.timeStamp
			canvas.setPointerCapture(e.pointerId)
			canvas.style.cursor = 'grabbing'
		}

		const move = (e: PointerEvent) => {
			cast(e)
			if (!state.held) {
				canvas.style.cursor = ray.intersectObject(swing, true).length ? 'grab' : ''
				return
			}
			if (!ray.ray.intersectPlane(drag, aim)) return
			const next = THREE.MathUtils.clamp(
				Math.atan2(aim.x, NAIL_Y - aim.y),
				-1.4,
				1.4,
			)
			const dt = Math.max((e.timeStamp - state.lastT) / 1000, 1 / 240)
			state.lastT = e.timeStamp
			state.speed = THREE.MathUtils.lerp(state.speed, (next - state.angle) / dt, 0.5)
			state.moved += Math.abs(next - state.angle)
			state.angle = next
		}

		const up = (e: PointerEvent) => {
			if (!state.held) return
			state.held = false
			canvas.style.cursor = 'grab'
			if (e.timeStamp - state.lastT > 80) state.speed = 0
			state.twist += state.moved < 0.05 ? 14 : state.speed * 1.5
		}

		const click = (e: MouseEvent) => {
			if (state.moved < 0.05) return
			e.preventDefault()
			state.moved = 0
		}

		canvas.addEventListener('pointerdown', down)
		canvas.addEventListener('pointermove', move)
		canvas.addEventListener('pointerup', up)
		canvas.addEventListener('pointercancel', up)
		canvas.addEventListener('click', click)

		const clock = new THREE.Clock()
		renderer.setAnimationLoop(() => {
			const dt = Math.min(clock.getDelta(), 1 / 30)
			const t = clock.elapsedTime
			if (!state.held) {
				const breeze = reduced ? 0 : Math.sin(t * 1.3) * 0.25
				state.speed +=
					(-SWING_K * Math.sin(state.angle) - SWING_DAMP * state.speed + breeze) * dt
				state.angle += state.speed * dt
			}
			const rest = Math.round(state.spin / (Math.PI * 2)) * Math.PI * 2
			state.twist += (-SPIN_K * (state.spin - rest) - SPIN_DAMP * state.twist) * dt
			state.spin += state.twist * dt
			swing.rotation.z = state.angle
			swing.rotation.y = state.spin
			renderer.render(scene, camera)
		})

		return () => {
			renderer.setAnimationLoop(null)
			resize.disconnect()
			canvas.removeEventListener('pointerdown', down)
			canvas.removeEventListener('pointermove', move)
			canvas.removeEventListener('pointerup', up)
			canvas.removeEventListener('pointercancel', up)
			canvas.removeEventListener('click', click)
			for (const item of trash) item.dispose()
			renderer.dispose()
			canvas.remove()
		}
	}, [])

	return <span ref={host} className='mark mark3d' aria-hidden='true' />
}
