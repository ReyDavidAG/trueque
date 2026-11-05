import * as CANNON from 'cannon-es'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacao_rain'
import { tokenColors } from '@/utils/token_color'

const HALF_X = 1.7
const HALF_Z = 1.05
const COIN_R = 0.19
const COIN_H = 0.06
const MAX_COINS = 42
const ROOF = 2
const WALL = 1
const MAX_COIN_SPEED = 7
const STEP = 1 / 120
const PUSH_R = 0.42
const PUSH_Y = 0.16
const MAX_PUSH = 18
const STIR_R = 0.85
const STIR = 0.0028

export function VaultCoins({ active, free, total }: { active: boolean; free: number; total: number }) {
	const host = useRef<HTMLDivElement>(null)
	const on = useRef(active)

	useEffect(() => {
		on.current = active
	}, [active])

	useEffect(() => {
		const el = host.current
		if (!el) return
		const css = getComputedStyle(el)
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
		canvas.className = 'vault-coins__canvas'
		el.appendChild(canvas)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60)
		camera.position.set(0, 1.35, HALF_Z + 2.3)
		scene.add(new THREE.HemisphereLight(color('--color-estraza'), color('--color-ink'), 1.3))
		const sun = new THREE.DirectionalLight(color('--color-amate'), 1.6)
		sun.position.set(1.5, 4, 5)
		scene.add(sun)
		const lamp = new THREE.PointLight(color('--color-estraza'), 6, 6, 1.4)
		lamp.position.set(0, ROOF - 0.15, 0.2)
		scene.add(lamp)

		const toon = (n: string) => keep(new THREE.MeshToonMaterial({ color: color(n) }))
		const gray = (t: number, side: THREE.Side = THREE.FrontSide) =>
			keep(
				new THREE.MeshToonMaterial({
					color: color('--color-ink').clone().lerp(color('--color-estraza'), t),
					side,
				})
			)
		const hull = keep(new THREE.MeshBasicMaterial({ color: color('--color-ink'), side: THREE.BackSide }))
		const W = HALF_X * 2 + 0.24
		const back = -HALF_Z - 0.12
		const front = HALF_Z + 2.6
		const room = new THREE.Mesh(keep(new THREE.BoxGeometry(W, ROOF, front - back)), [
			gray(0.42, THREE.BackSide),
			gray(0.42, THREE.BackSide),
			gray(0.3, THREE.BackSide),
			gray(0.55, THREE.BackSide),
			gray(0.42, THREE.BackSide),
			gray(0.5, THREE.BackSide),
		])
		room.position.set(0, ROOF / 2, (front + back) / 2)
		scene.add(room)
		const panel = new THREE.Mesh(keep(new THREE.PlaneGeometry(W - 0.5, ROOF - 0.5)), gray(0.44))
		panel.position.set(0, ROOF / 2 + 0.05, back + 0.01)
		scene.add(panel)
		const rivet = keep(new THREE.SphereGeometry(0.035, 10, 8))
		const rivetMat = gray(0.7)
		for (const x of [-1, 1])
			for (const y of [-1, 1]) {
				const r = new THREE.Mesh(rivet, rivetMat)
				r.position.set((x * (W - 0.7)) / 2, ROOF / 2 + 0.05 + (y * (ROOF - 0.7)) / 2, back + 0.02)
				scene.add(r)
			}
		const lip = new THREE.Mesh(keep(new THREE.BoxGeometry(W, 0.09, 0.1)), gray(0.72))
		lip.position.set(0, 0.045, HALF_Z + 0.2)
		const lipLine = new THREE.Mesh(lip.geometry, hull)
		lipLine.scale.set(1, 1.25, 1.25)
		lip.add(lipLine)
		scene.add(lip)
		const shelf = new THREE.Mesh(keep(new THREE.BoxGeometry(W, 0.05, 0.6)), gray(0.62))
		shelf.position.set(0, ROOF - 0.55, back + 0.3)
		scene.add(shelf)

		const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.8, 0), allowSleep: true })
		world.broadphase = new CANNON.SAPBroadphase(world)
		;(world.solver as CANNON.GSSolver).iterations = 12
		Object.assign(world.defaultContactMaterial, { friction: 0.35, restitution: 0.25 })
		const floor = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane() })
		floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
		world.addBody(floor)
		const T = WALL
		for (const [x, y, z, hx, hy, hz] of [
			[0, ROOF / 2, HALF_Z + T, HALF_X + T * 2, ROOF, T],
			[0, ROOF / 2, -HALF_Z - T, HALF_X + T * 2, ROOF, T],
			[HALF_X + T, ROOF / 2, 0, T, ROOF, HALF_Z + T * 2],
			[-HALF_X - T, ROOF / 2, 0, T, ROOF, HALF_Z + T * 2],
			[0, ROOF + T, 0, HALF_X + T * 2, T, HALF_Z + T * 2],
		]) {
			const b = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Box(new CANNON.Vec3(hx, hy, hz)) })
			b.position.set(x, y, z)
			world.addBody(b)
		}
		const push = new CANNON.Body({ type: CANNON.Body.KINEMATIC, shape: new CANNON.Sphere(PUSH_R) })
		push.position.set(0, -5, 0)
		world.addBody(push)

		const face = keep(new THREE.CanvasTexture(coinSprite(128, css)))
		face.colorSpace = THREE.SRGBColorSpace
		const faceMat = keep(new THREE.MeshToonMaterial({ map: face, transparent: true }))
		const coinGeo = keep(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_H, 28))
		const rimMat = toon('--color-maiz-2')
		const n = free > 0 && total > 0 ? Math.max(3, Math.round((MAX_COINS * free) / total)) : 0
		const coins: { mesh: THREE.Mesh; body: CANNON.Body }[] = []
		for (let i = 0; i < n; i++) {
			const body = new CANNON.Body({
				mass: 0.2,
				shape: new CANNON.Cylinder(COIN_R, COIN_R, COIN_H, 12),
				linearDamping: 0.25,
				angularDamping: 0.35,
				sleepSpeedLimit: 0.15,
			})
			body.position.set(
				(Math.random() - 0.5) * HALF_X * 1.6,
				reduced ? COIN_H / 2 + (i % 3) * COIN_H : 0.4 + (i % 12) * 0.11,
				(Math.random() - 0.5) * HALF_Z * 1.6
			)
			body.quaternion.setFromEuler((Math.random() - 0.5) * 0.8, Math.random() * Math.PI, (Math.random() - 0.5) * 0.8)
			world.addBody(body)
			const mesh = new THREE.Mesh(coinGeo, [rimMat, faceMat, faceMat])
			scene.add(mesh)
			coins.push({ mesh, body })
		}

		const fit = () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.fov = Math.min(72, Math.max(46, 50 * (1.5 / camera.aspect) ** 0.6))
			camera.lookAt(0, 0.25, -0.35)
			camera.updateProjectionMatrix()
		}
		const resize = new ResizeObserver(fit)
		resize.observe(el)
		fit()

		const ray = new THREE.Raycaster()
		const ndc = new THREE.Vector2()
		const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PUSH_Y)
		const hit = new THREE.Vector3()
		let target: THREE.Vector3 | null = null
		const point = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect()
			ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
			ray.setFromCamera(ndc, camera)
			if (!ray.ray.intersectPlane(plane, hit)) return
			hit.x = Math.max(-HALF_X, Math.min(HALF_X, hit.x))
			hit.z = Math.max(-HALF_Z, Math.min(HALF_Z, hit.z))
			if (!target) {
				target = hit.clone()
				push.position.set(hit.x, PUSH_Y, hit.z)
			} else target.copy(hit)
		}
		const leave = () => {
			target = null
		}
		const bump = () => {
			for (const c of coins) {
				const d = c.body.position.distanceTo(push.position)
				if (d > 0.9) continue
				c.body.wakeUp()
				c.body.applyImpulse(new CANNON.Vec3((Math.random() - 0.5) * 0.3, 0.55 - d * 0.4, (Math.random() - 0.5) * 0.3))
			}
		}
		canvas.addEventListener('pointermove', point)
		canvas.addEventListener('pointerdown', point)
		canvas.addEventListener('pointerdown', bump)
		canvas.addEventListener('pointerleave', leave)

		let prev = performance.now()
		renderer.setAnimationLoop(now => {
			const dt = Math.min((now - prev) / 1000, 1 / 30)
			prev = now
			if (!on.current) return
			if (target) {
				const v = new CANNON.Vec3(target.x - push.position.x, 0, target.z - push.position.z).scale(1 / Math.max(dt, STEP))
				const speed = v.length()
				if (speed > MAX_PUSH) v.scale(MAX_PUSH / speed, v)
				push.velocity.copy(v)
				push.position.y = PUSH_Y
				const force = Math.min(speed, MAX_PUSH)
				for (const c of coins) {
					const dx = c.body.position.x - push.position.x
					const dz = c.body.position.z - push.position.z
					const d = Math.hypot(dx, dz)
					if (d > STIR_R) continue
					c.body.wakeUp()
					if (force < 0.5) continue
					const k = (1 - d / STIR_R) * force * STIR
					c.body.applyImpulse(
						new CANNON.Vec3(
							(dx / (d || 1)) * k + v.x * k * 0.04,
							k * 0.9,
							(dz / (d || 1)) * k + v.z * k * 0.04
						)
					)
				}
			} else {
				push.velocity.set(0, 0, 0)
				push.position.set(0, -5, 0)
			}
			world.step(STEP, dt, 6)
			for (const c of coins) {
				const p = c.body.position
				const v = c.body.velocity
				if (p.y < -1) {
					p.set(0, 1, 0)
					v.setZero()
				}
				const speed = v.length()
				if (speed > MAX_COIN_SPEED) v.scale(MAX_COIN_SPEED / speed, v)
				const lx = HALF_X - COIN_R
				const lz = HALF_Z - COIN_R
				if (Math.abs(p.x) > lx) {
					p.x = Math.sign(p.x) * lx
					v.x = -v.x * 0.4
				}
				if (Math.abs(p.z) > lz) {
					p.z = Math.sign(p.z) * lz
					v.z = -v.z * 0.4
				}
				if (p.y > ROOF - COIN_R) {
					p.y = ROOF - COIN_R
					v.y = -Math.abs(v.y) * 0.4
				}
				c.mesh.position.set(p.x, p.y, p.z)
				c.mesh.quaternion.set(c.body.quaternion.x, c.body.quaternion.y, c.body.quaternion.z, c.body.quaternion.w)
			}
			renderer.render(scene, camera)
		})

		return () => {
			renderer.setAnimationLoop(null)
			resize.disconnect()
			canvas.removeEventListener('pointermove', point)
			canvas.removeEventListener('pointerdown', point)
			canvas.removeEventListener('pointerdown', bump)
			canvas.removeEventListener('pointerleave', leave)
			for (const item of trash) item.dispose()
			renderer.dispose()
			canvas.remove()
		}
	}, [free, total])

	return <div ref={host} className='vault-coins' aria-hidden='true' />
}
