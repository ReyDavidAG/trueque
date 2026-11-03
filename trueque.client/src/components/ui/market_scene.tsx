import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { tokenColors } from '@/utils/token_color'

const STALLS = [
	{ color: '--color-grana', ink: '--color-on-dark', price: 25 },
	{ color: '--color-anil', ink: '--color-on-dark', price: 60 },
	{ color: '--color-achiote', ink: '--color-ink', price: 180 },
] as const
const FRUITS = [
	'--color-grana',
	'--color-maiz',
	'--color-achiote',
	'--color-nopal',
] as const
const GRAVITY = 9.8
const REBUILD_MS = 5000
const REBUILD_TIME = 800
const SPACING = 2.5
const FRUIT_R = 0.14
const COUNTER_TOP = 0.86
const BOUNDS = { x: 4.6, zMin: -1.2, zMax: 1.6 }
const TARGET = new THREE.Vector3(0, 1.05, 0)
const VIEW = new THREE.Vector3(0, 0.35, 1).normalize()
const UP = new THREE.Vector3(0, 1, 0)

type Part = {
	mesh: THREE.Mesh
	stall: Stall
	home: THREE.Vector3
	homeQ: THREE.Quaternion
	homeBox: THREE.Box3
	box: THREE.Box3
	from: THREE.Vector3
	fromQ: THREE.Quaternion
	v: THREE.Vector3
	w: THREE.Vector3
	hp: number
	maxHp: number
	solid: boolean
	loose: boolean
	needs: Part[]
	min: number
}
type Stall = { parts: Part[]; shake: number; lastBreak: number; rebuild: number }
type Fruit = { mesh: THREE.Mesh; v: THREE.Vector3; held: boolean }
type PartOptions = { hp?: number; solid?: boolean; edged?: boolean; rz?: number }

const spread = (n: number) => (Math.random() - 0.5) * n

export function MarketScene() {
	const host = useRef<HTMLDivElement>(null)

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
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap
		const canvas = renderer.domElement
		canvas.className = 'scene3d'
		canvas.setAttribute('role', 'img')
		canvas.setAttribute(
			'aria-label',
			'Tres puestos de mercado con fruta: arrastra la fruta para lanzarla o da clics a un puesto para irlo desarmando',
		)
		el.appendChild(canvas)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
		scene.add(
			new THREE.HemisphereLight(
				color('--color-estraza'),
				color('--color-cacao'),
				1.4,
			),
		)
		const sun = new THREE.DirectionalLight(color('--color-amate'), 2)
		sun.position.set(3, 7, 5)
		sun.castShadow = true
		sun.shadow.mapSize.set(1024, 1024)
		Object.assign(sun.shadow.camera, {
			left: -7,
			right: 7,
			top: 7,
			bottom: -7,
		})
		scene.add(sun)

		const ground = new THREE.Mesh(
			keep(new THREE.PlaneGeometry(30, 30)),
			keep(
				new THREE.ShadowMaterial({
					color: color('--color-ink'),
					opacity: 0.18,
				}),
			),
		)
		ground.rotation.x = -Math.PI / 2
		ground.receiveShadow = true
		scene.add(ground)

		const toon = (name: string) =>
			keep(new THREE.MeshToonMaterial({ color: color(name) }))
		const line = keep(
			new THREE.LineBasicMaterial({ color: color('--color-ink') }),
		)
		const cacao = toon('--color-cacao')
		const estraza = toon('--color-estraza')
		const ink = toon('--color-ink')
		const geo = {
			post: keep(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 10)),
			counter: keep(new THREE.BoxGeometry(1.9, 0.8, 0.7)),
			top: keep(new THREE.BoxGeometry(2, 0.06, 0.8)),
			awning: keep(new THREE.BoxGeometry(2.2, 0.12, 1.1)),
			stripe: keep(new THREE.BoxGeometry(0.3, 0.13, 1.11)),
			scallop: keep(new THREE.SphereGeometry(0.11, 12, 8)),
			sign: keep(new THREE.BoxGeometry(0.9, 0.5, 0.06)),
			string: keep(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 4)),
			fruit: keep(new THREE.SphereGeometry(FRUIT_R, 18, 14)),
			stem: keep(new THREE.CylinderGeometry(0.015, 0.02, 0.08, 5)),
		}
		const edges = new Map<THREE.BufferGeometry, THREE.EdgesGeometry>()
		const outline = (g: THREE.BufferGeometry) => {
			const found = edges.get(g)
			if (found) return found
			const made = keep(new THREE.EdgesGeometry(g))
			edges.set(g, made)
			return made
		}

		const font = cssVar('--font-display')
		const signTexture = (fill: string, text: string, price: number) => {
			const c = document.createElement('canvas')
			c.width = 256
			c.height = 144
			const tex = keep(new THREE.CanvasTexture(c))
			tex.colorSpace = THREE.SRGBColorSpace
			const draw = () => {
				const g = c.getContext('2d')
				if (!g) return
				g.fillStyle = cssVar(fill)
				g.fillRect(0, 0, 256, 144)
				g.lineWidth = 12
				g.strokeStyle = cssVar('--color-ink')
				g.strokeRect(6, 6, 244, 132)
				g.fillStyle = cssVar(text)
				g.font = `88px ${font}`
				g.textAlign = 'center'
				g.textBaseline = 'middle'
				g.fillText(String(price), 128, 80)
				tex.needsUpdate = true
			}
			draw()
			void document.fonts.load(`88px ${font}`).then(draw)
			return tex
		}

		const parts: Part[] = []
		const stalls: Stall[] = STALLS.map((s, i) => {
			const x = (i - 1) * SPACING
			const tint = toon(s.color)
			const face = keep(
				new THREE.MeshToonMaterial({
					map: signTexture(s.color, s.ink, s.price),
				}),
			)
			const stall: Stall = { parts: [], shake: 0, lastBreak: 0, rebuild: 0 }
			const add = (
				g: THREE.BufferGeometry,
				m: THREE.Material | THREE.Material[],
				[px, py, pz]: [number, number, number],
				{ hp = 1, solid = true, edged = true, rz = 0 }: PartOptions = {},
			) => {
				const mesh = new THREE.Mesh(g, m)
				mesh.position.set(x + px, py, pz)
				mesh.rotation.z = rz
				mesh.castShadow = true
				if (edged) mesh.add(new THREE.LineSegments(outline(g), line))
				scene.add(mesh)
				const homeBox = new THREE.Box3().setFromObject(mesh)
				const part: Part = {
					mesh,
					stall,
					home: mesh.position.clone(),
					homeQ: mesh.quaternion.clone(),
					homeBox,
					box: homeBox.clone(),
					from: new THREE.Vector3(),
					fromQ: new THREE.Quaternion(),
					v: new THREE.Vector3(),
					w: new THREE.Vector3(),
					hp,
					maxHp: hp,
					solid,
					loose: false,
					needs: [],
					min: 0,
				}
				mesh.userData = { part }
				stall.parts.push(part)
				parts.push(part)
				return part
			}
			const posts = [
				[-0.9, 0.3],
				[0.9, 0.3],
				[-0.9, -0.3],
				[0.9, -0.3],
			].map(([px, pz]) =>
				add(geo.post, cacao, [px, 1.1, pz], { hp: 2, edged: false }),
			)
			const counter = add(geo.counter, estraza, [0, 0.4, 0], { hp: 4 })
			const top = add(geo.top, cacao, [0, 0.83, 0], { hp: 2 })
			const awning = add(geo.awning, tint, [0, 2.2, 0], { hp: 3 })
			const roof = [
				add(geo.stripe, estraza, [-0.45, 2.2, 0], { solid: false }),
				add(geo.stripe, estraza, [0.45, 2.2, 0], { solid: false }),
				...Array.from({ length: 6 }, (_, k) =>
					add(geo.scallop, k % 2 ? estraza : tint, [-0.92 + k * 0.37, 2.12, 0.55], {
						solid: false,
						edged: false,
					}),
				),
			]
			const rz = i === 1 ? 0.08 : -0.08
			const strings = [-0.25, 0.25].map(px =>
				add(geo.string, ink, [px, 1.95, 0.5], { solid: false, edged: false, rz }),
			)
			const sign = add(geo.sign, [tint, tint, tint, tint, face, tint], [0, 1.55, 0.5], {
				hp: 2,
				rz,
			})
			Object.assign(awning, { needs: posts, min: 3 })
			for (const p of roof) Object.assign(p, { needs: [awning], min: 1 })
			for (const p of strings) Object.assign(p, { needs: [awning], min: 1 })
			Object.assign(sign, { needs: strings, min: 1 })
			Object.assign(top, { needs: [counter], min: 1 })
			return stall
		})

		const fruits: Fruit[] = stalls.flatMap((_, i) =>
			Array.from({ length: 6 }, (__, k) => {
				const x = (i - 1) * SPACING
				const mesh = new THREE.Mesh(
					geo.fruit,
					toon(FRUITS[(i + k) % FRUITS.length]),
				)
				const stem = new THREE.Mesh(geo.stem, cacao)
				stem.position.y = FRUIT_R
				mesh.add(stem)
				mesh.position.set(
					x - 0.6 + (k % 3) * 0.6 + (k > 2 ? 0.3 : 0),
					COUNTER_TOP + FRUIT_R + (k > 2 ? 0.3 : 0.01),
					k > 2 ? 0.05 : 0.15,
				)
				mesh.castShadow = true
				scene.add(mesh)
				const fruit: Fruit = { mesh, v: new THREE.Vector3(), held: false }
				mesh.userData = { fruit }
				return fruit
			}),
		)
		const pickable = [...fruits.map(f => f.mesh), ...parts.map(p => p.mesh)]

		const fit = () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
			const dist = Math.max(5.2 / (t * camera.aspect), 2.2 / t)
			camera.position.copy(VIEW).multiplyScalar(dist).add(TARGET)
			camera.lookAt(TARGET)
			camera.updateProjectionMatrix()
		}
		const resize = new ResizeObserver(fit)
		resize.observe(el)
		fit()

		const loosen = (p: Part, push: THREE.Vector3, now: number) => {
			p.loose = true
			p.stall.lastBreak = now
			p.v.copy(push).add(new THREE.Vector3(spread(1), 0, spread(1)))
			p.w.set(spread(10), spread(10), spread(10))
			for (const q of p.stall.parts)
				if (
					!q.loose &&
					q.needs.length &&
					q.needs.filter(n => !n.loose).length < q.min
				)
					loosen(q, new THREE.Vector3(spread(2), 0.5, spread(2)), now)
		}

		const ray = new THREE.Raycaster()
		const ndc = new THREE.Vector2()
		const plane = new THREE.Plane()
		const aim = new THREE.Vector3()
		const pull = new THREE.Vector3()
		let held: Fruit | null = null
		let lastT = 0

		const cast = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect()
			ndc.set(
				((e.clientX - r.left) / r.width) * 2 - 1,
				-((e.clientY - r.top) / r.height) * 2 + 1,
			)
			ray.setFromCamera(ndc, camera)
		}
		const pick = (e: PointerEvent) => {
			cast(e)
			return ray.intersectObjects(pickable, false)[0]
		}
		const data = (o: THREE.Object3D) =>
			o.userData as { fruit?: Fruit; part?: Part }

		const down = (e: PointerEvent) => {
			const hit = pick(e)
			if (!hit) return
			const { fruit, part } = data(hit.object)
			if (fruit) {
				held = fruit
				fruit.held = true
				fruit.v.set(0, 0, 0)
				plane.setFromNormalAndCoplanarPoint(
					camera.getWorldDirection(aim).negate(),
					fruit.mesh.position,
				)
				lastT = e.timeStamp
				canvas.setPointerCapture(e.pointerId)
				canvas.style.cursor = 'grabbing'
				return
			}
			if (!part || part.stall.rebuild) return
			const push = ray.ray.direction.clone().multiplyScalar(4)
			if (part.loose) {
				part.v.add(push.add(UP.clone().multiplyScalar(2)))
				part.w.add(new THREE.Vector3(spread(8), spread(8), spread(8)))
				part.stall.lastBreak = performance.now()
				return
			}
			part.stall.shake = reduced ? 0 : 1
			for (const f of fruits)
				if (!f.held && f.mesh.position.distanceTo(hit.point) < 0.9)
					f.v.add(new THREE.Vector3(spread(1.5), 1 + Math.random(), 0.3))
			if (--part.hp > 0) return
			loosen(part, push.add(UP.clone().multiplyScalar(2.5)), performance.now())
		}

		const move = (e: PointerEvent) => {
			if (!held) {
				const hit = pick(e)
				canvas.style.cursor = !hit
					? ''
					: data(hit.object).fruit
						? 'grab'
						: 'pointer'
				return
			}
			cast(e)
			if (!ray.ray.intersectPlane(plane, aim)) return
			aim.y = Math.max(aim.y, FRUIT_R)
			aim.x = THREE.MathUtils.clamp(aim.x, -BOUNDS.x, BOUNDS.x)
			const dt = Math.max((e.timeStamp - lastT) / 1000, 1 / 240)
			lastT = e.timeStamp
			pull.copy(aim).sub(held.mesh.position).divideScalar(dt)
			held.v.lerp(pull, 0.5)
			held.mesh.position.copy(aim)
		}

		const up = (e: PointerEvent) => {
			if (!held) return
			held.held = false
			if (e.timeStamp - lastT > 80) held.v.set(0, 0, 0)
			held.v.clampLength(0, 14)
			held = null
			canvas.style.cursor = 'grab'
		}

		canvas.addEventListener('pointerdown', down)
		canvas.addEventListener('pointermove', move)
		canvas.addEventListener('pointerup', up)
		canvas.addEventListener('pointercancel', up)

		const closest = new THREE.Vector3()
		const normal = new THREE.Vector3()
		const clock = new THREE.Clock()

		const stepPart = (p: Part, dt: number) => {
			p.v.y -= GRAVITY * dt
			p.mesh.position.addScaledVector(p.v, dt)
			p.mesh.rotation.x += p.w.x * dt
			p.mesh.rotation.y += p.w.y * dt
			p.mesh.rotation.z += p.w.z * dt
			if (Math.abs(p.mesh.position.x) > BOUNDS.x + 0.6) {
				p.mesh.position.x = Math.sign(p.mesh.position.x) * (BOUNDS.x + 0.6)
				p.v.x *= -0.4
			}
			if (p.mesh.position.z > BOUNDS.zMax + 0.4 || p.mesh.position.z < BOUNDS.zMin - 0.6) {
				p.mesh.position.z = THREE.MathUtils.clamp(
					p.mesh.position.z,
					BOUNDS.zMin - 0.6,
					BOUNDS.zMax + 0.4,
				)
				p.v.z *= -0.4
			}
			p.box.setFromObject(p.mesh)
			if (p.box.min.y >= 0) return
			p.mesh.position.y -= p.box.min.y
			p.box.translate(new THREE.Vector3(0, -p.box.min.y, 0))
			p.v.set(p.v.x * 0.6, Math.abs(p.v.y) < 0.5 ? 0 : -p.v.y * 0.3, p.v.z * 0.6)
			p.w.multiplyScalar(0.6)
		}

		const stepStall = (s: Stall, dt: number, now: number) => {
			if (s.rebuild) {
				const t = Math.min(1, (now - s.rebuild) / REBUILD_TIME)
				const e = 1 - (1 - t) ** 3
				for (const p of s.parts) {
					if (!p.loose) continue
					p.mesh.position.lerpVectors(p.from, p.home, e)
					p.mesh.quaternion.slerpQuaternions(p.fromQ, p.homeQ, e)
				}
				if (t < 1) return
				s.rebuild = 0
				for (const p of s.parts)
					Object.assign(p, { loose: false, hp: p.maxHp }).box.copy(p.homeBox)
				return
			}
			let loose = false
			for (const p of s.parts)
				if (p.loose) {
					loose = true
					stepPart(p, dt)
				}
			if (loose && now - s.lastBreak > REBUILD_MS) {
				s.rebuild = now
				for (const p of s.parts) {
					p.from.copy(p.mesh.position)
					p.fromQ.copy(p.mesh.quaternion)
				}
			}
			if (!s.shake) return
			s.shake = Math.max(0, s.shake - dt * 4)
			const offset = Math.sin(now * 0.06) * 0.04 * s.shake
			for (const p of s.parts)
				if (!p.loose) p.mesh.position.x = p.home.x + offset
		}

		const stepFruit = (f: Fruit, dt: number) => {
			if (f.held) return
			const p = f.mesh.position
			f.v.y -= GRAVITY * dt
			p.addScaledVector(f.v, dt)
			if (p.y < FRUIT_R) {
				p.y = FRUIT_R
				f.v.y = Math.abs(f.v.y) < 0.4 ? 0 : -f.v.y * 0.45
				f.v.x *= 0.97
				f.v.z *= 0.97
			}
			if (Math.abs(p.x) > BOUNDS.x) {
				p.x = Math.sign(p.x) * BOUNDS.x
				f.v.x *= -0.5
			}
			if (p.z < BOUNDS.zMin || p.z > BOUNDS.zMax) {
				p.z = THREE.MathUtils.clamp(p.z, BOUNDS.zMin, BOUNDS.zMax)
				f.v.z *= -0.5
			}
			for (const part of parts) {
				if (!part.solid || part.stall.rebuild) continue
				const box = part.box
				box.clampPoint(p, closest)
				const d = p.distanceTo(closest)
				if (d >= FRUIT_R) continue
				if (d === 0) {
					normal.set(0, 1, 0)
					p.y = box.max.y + FRUIT_R
				} else {
					normal.copy(p).sub(closest).divideScalar(d)
					p.copy(closest).addScaledVector(normal, FRUIT_R)
				}
				const vn = f.v.dot(normal)
				if (vn < 0) f.v.addScaledVector(normal, -1.4 * vn)
				if (part.loose) f.v.addScaledVector(part.v, 0.5 * dt * 10)
				if (normal.y > 0.5) {
					f.v.x *= 0.96
					f.v.z *= 0.96
				}
			}
			f.mesh.rotation.x += (f.v.z * dt) / FRUIT_R
			f.mesh.rotation.z -= (f.v.x * dt) / FRUIT_R
		}

		const rel = new THREE.Vector3()
		const collide = () => {
			for (let a = 0; a < fruits.length; a++)
				for (let b = a + 1; b < fruits.length; b++) {
					const fa = fruits[a]
					const fb = fruits[b]
					normal.copy(fb.mesh.position).sub(fa.mesh.position)
					const d = normal.length()
					if (d >= FRUIT_R * 2 || d === 0) continue
					normal.divideScalar(d)
					const push = FRUIT_R * 2 - d
					const wa = fa.held ? 0 : fb.held ? 1 : 0.5
					fa.mesh.position.addScaledVector(normal, -push * wa)
					fb.mesh.position.addScaledVector(normal, push * (1 - wa))
					const vn = rel.copy(fb.v).sub(fa.v).dot(normal)
					if (vn >= 0) continue
					if (!fa.held) fa.v.addScaledVector(normal, vn * 0.75 * (fb.held ? 2 : 1))
					if (!fb.held) fb.v.addScaledVector(normal, -vn * 0.75 * (fa.held ? 2 : 1))
				}
		}

		renderer.setAnimationLoop(() => {
			const dt = Math.min(clock.getDelta(), 1 / 30)
			const now = performance.now()
			for (const s of stalls) stepStall(s, dt, now)
			for (const f of fruits) stepFruit(f, dt)
			collide()
			renderer.render(scene, camera)
		})

		return () => {
			renderer.setAnimationLoop(null)
			resize.disconnect()
			canvas.removeEventListener('pointerdown', down)
			canvas.removeEventListener('pointermove', move)
			canvas.removeEventListener('pointerup', up)
			canvas.removeEventListener('pointercancel', up)
			for (const item of trash) item.dispose()
			renderer.dispose()
			canvas.remove()
		}
	}, [])

	return <div ref={host} className='scene3d-host' />
}
