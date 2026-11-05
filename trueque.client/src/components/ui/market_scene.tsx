import * as CANNON from 'cannon-es'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacao_rain'
import { tokenColors } from '@/utils/token_color'

const STALLS = [
	{ color: '--color-grana', ink: '--color-on-dark', price: 25 },
	{ color: '--color-anil', ink: '--color-on-dark', price: 60 },
	{ color: '--color-achiote', ink: '--color-ink', price: 180 },
] as const
const KINDS = {
	round: ['--color-grana', '--color-achiote', '--color-nopal', '--color-maiz'],
	lemon: ['--color-maiz', '--color-nopal'],
	pod: ['--color-achiote', '--color-maiz-2', '--color-cacao-2'],
	grapes: ['--color-anil', '--color-grana', '--color-nopal'],
	pumpkin: ['--color-achiote', '--color-maiz-2'],
	coin: ['--color-cacao-3'],
	crate: ['--color-cacao-2'],
	sack: ['--color-amate-3', '--color-estraza'],
} as const
type Kind = keyof typeof KINDS
const COUNTER_ODDS: Kind[] = [
	'round',
	'round',
	'round',
	'lemon',
	'lemon',
	'pod',
	'grapes',
	'grapes',
	'coin',
	'coin',
]
const GROUND_ODDS: Kind[] = [
	'round',
	'round',
	'lemon',
	'pod',
	'grapes',
	'coin',
	'pumpkin',
	'pumpkin',
	'crate',
	'crate',
	'sack',
	'sack',
]
const MAX_SPEED = 12
const STEP = 1 / 120
const REBUILD_MS = 6000
const REBUILD_TIME = 900
const SPACING = 2.5
const COUNTER_TOP = 0.86
const TOP_AREA = { x: 0.68, z: 0.28 }
const BOUNDS = { x: 4.1, zMin: -1.2, zMax: 1.5 }
const TARGET = new THREE.Vector3(0, 1.05, 0)
const VIEW = new THREE.Vector3(0, 0.35, 1).normalize()
const TAP_PX = 6

type Part = {
	mesh: THREE.Mesh
	body: CANNON.Body
	stall: Stall
	home: THREE.Vector3
	homeQ: THREE.Quaternion
	from: THREE.Vector3
	fromQ: THREE.Quaternion
	mass: number
	hp: number
	maxHp: number
	loose: boolean
	needs: Part[]
	min: number
}
type Stall = { parts: Part[]; shake: number; lastHit: number; rebuild: number }
type Fruit = { mesh: THREE.Object3D; body: CANNON.Body }
type Picked = { part?: Part; fruit?: Fruit }
type Grab = {
	body: CANNON.Body
	part?: Part
	offset: THREE.Vector3
	point: THREE.Vector3
	dir: THREE.Vector3
	x: number
	y: number
	moved: boolean
}

const spread = (n: number) => (Math.random() - 0.5) * n
const pickOne = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]
const vec = (v: THREE.Vector3) => new CANNON.Vec3(v.x, v.y, v.z)
const shuffle = <T,>(list: readonly T[]) => {
	const out = [...list]
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[out[i], out[j]] = [out[j], out[i]]
	}
	return out
}

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
			'Tres puestos de mercado con fruta: arrastra la fruta o los pedazos para lanzarlos, o da clics a un puesto para irlo desarmando'
		)
		el.appendChild(canvas)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
		scene.add(
			new THREE.HemisphereLight(
				color('--color-estraza'),
				color('--color-cacao'),
				1.4
			)
		)
		const sun = new THREE.DirectionalLight(color('--color-amate'), 2)
		sun.position.set(3, 7, 5)
		sun.castShadow = true
		sun.shadow.mapSize.set(1024, 1024)
		Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 })
		scene.add(sun)

		const ground = new THREE.Mesh(
			keep(new THREE.PlaneGeometry(30, 30)),
			keep(
				new THREE.ShadowMaterial({ color: color('--color-ink'), opacity: 0.18 })
			)
		)
		ground.rotation.x = -Math.PI / 2
		ground.receiveShadow = true
		scene.add(ground)

		const world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.8, 0),
			allowSleep: true,
		})
		world.broadphase = new CANNON.SAPBroadphase(world)
		;(world.solver as CANNON.GSSolver).iterations = 16
		Object.assign(world.defaultContactMaterial, {
			friction: 0.45,
			restitution: 0.22,
			contactEquationStiffness: 5e7,
			contactEquationRelaxation: 3,
		})
		const wall = (x: number, y: number, z: number, rx: number, ry: number) => {
			const b = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane() })
			b.position.set(x, y, z)
			b.quaternion.setFromEuler(rx, ry, 0)
			world.addBody(b)
		}
		wall(0, 0, 0, -Math.PI / 2, 0)
		wall(-BOUNDS.x, 0, 0, 0, Math.PI / 2)
		wall(BOUNDS.x, 0, 0, 0, -Math.PI / 2)
		wall(0, 0, BOUNDS.zMin, 0, 0)
		wall(0, 0, BOUNDS.zMax, 0, Math.PI)

		const toonCache = new Map<string, THREE.MeshToonMaterial>()
		const toon = (name: string) => {
			const found = toonCache.get(name)
			if (found) return found
			const made = keep(new THREE.MeshToonMaterial({ color: color(name) }))
			toonCache.set(name, made)
			return made
		}
		const line = keep(new THREE.LineBasicMaterial({ color: color('--color-ink') }))
		const cacao = toon('--color-cacao')
		const estraza = toon('--color-estraza')
		const ink = toon('--color-ink')
		const coinTex = keep(new THREE.CanvasTexture(coinSprite(128, css)))
		coinTex.colorSpace = THREE.SRGBColorSpace
		const coinFace = keep(new THREE.MeshToonMaterial({ map: coinTex }))
		const geo = {
			post: keep(new THREE.CylinderGeometry(0.07, 0.07, 2.08, 10)),
			counter: keep(new THREE.BoxGeometry(1.6, 0.8, 0.7)),
			top: keep(new THREE.BoxGeometry(1.62, 0.06, 0.8)),
			awning: keep(new THREE.BoxGeometry(2.2, 0.12, 1.1)),
			stripe: keep(new THREE.BoxGeometry(0.3, 0.13, 1.11)),
			scallop: keep(new THREE.SphereGeometry(0.11, 12, 8)),
			sign: keep(new THREE.BoxGeometry(0.9, 0.5, 0.06)),
			string: keep(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 4)),
			ball: keep(new THREE.SphereGeometry(1, 18, 14)),
			stem: keep(new THREE.CylinderGeometry(0.015, 0.02, 0.08, 5)),
			coin: keep(new THREE.CylinderGeometry(0.13, 0.13, 0.045, 24)),
			crate: keep(new THREE.BoxGeometry(0.36, 0.26, 0.28)),
			slat: keep(new THREE.BoxGeometry(0.37, 0.03, 0.29)),
			tie: keep(new THREE.CylinderGeometry(0.05, 0.07, 0.08, 8)),
			cap: keep(new THREE.SphereGeometry(0.095, 12, 8)),
			foot: keep(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 10)),
			lipLong: keep(new THREE.BoxGeometry(1.62, 0.07, 0.03)),
			lipShort: keep(new THREE.BoxGeometry(0.03, 0.07, 0.8)),
		}
		const cacaoDark = toon('--color-cacao-3')
		const planks = (stripe: string) => {
			const c = document.createElement('canvas')
			c.width = 256
			c.height = 128
			const g = c.getContext('2d')
			if (g) {
				g.fillStyle = cssVar('--color-estraza')
				g.fillRect(0, 0, 256, 128)
				g.fillStyle = cssVar('--color-amate-2')
				for (let x = 0; x < 256; x += 32) g.fillRect(x + 16, 0, 16, 128)
				g.strokeStyle = cssVar('--color-cacao-2')
				g.lineWidth = 3
				for (let x = 32; x < 256; x += 32) {
					g.beginPath()
					g.moveTo(x, 0)
					g.lineTo(x, 128)
					g.stroke()
				}
				g.fillStyle = cssVar(stripe)
				g.fillRect(0, 0, 256, 20)
				g.fillStyle = cssVar('--color-estraza')
				for (let x = 0; x < 256; x += 32) g.fillRect(x + 16, 0, 16, 20)
				g.fillStyle = cssVar('--color-cacao-2')
				g.fillRect(0, 116, 256, 12)
			}
			const tex = keep(new THREE.CanvasTexture(c))
			tex.colorSpace = THREE.SRGBColorSpace
			return tex
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

		const decorate = (
			parent: THREE.Object3D,
			g: THREE.BufferGeometry,
			m: THREE.Material,
			[x, y, z]: [number, number, number],
			edged = false
		) => {
			const d = new THREE.Mesh(g, m)
			d.position.set(x, y, z)
			d.castShadow = true
			if (edged) d.add(new THREE.LineSegments(outline(g), line))
			parent.add(d)
			return d
		}

		const parts: Part[] = []
		const stalls: Stall[] = shuffle(STALLS).map((s, i) => {
			const x = (i - 1) * SPACING
			const tint = toon(s.color)
			const face = keep(
				new THREE.MeshToonMaterial({ map: signTexture(s.color, s.ink, s.price) })
			)
			const stall: Stall = { parts: [], shake: 0, lastHit: 0, rebuild: 0 }
			const add = (
				g: THREE.BufferGeometry,
				m: THREE.Material | THREE.Material[],
				shape: CANNON.Shape,
				mass: number,
				[px, py, pz]: [number, number, number],
				hp: number,
				{ edged = true, rz = 0 } = {}
			) => {
				const mesh = new THREE.Mesh(g, m)
				mesh.position.set(x + px, py, pz)
				mesh.rotation.z = rz
				mesh.castShadow = true
				if (edged) mesh.add(new THREE.LineSegments(outline(g), line))
				scene.add(mesh)
				const body = new CANNON.Body({ type: CANNON.Body.STATIC, shape })
				body.position.copy(vec(mesh.position))
				body.quaternion.set(
					mesh.quaternion.x,
					mesh.quaternion.y,
					mesh.quaternion.z,
					mesh.quaternion.w
				)
				body.linearDamping = 0.08
				body.angularDamping = 0.15
				body.sleepSpeedLimit = 0.2
				world.addBody(body)
				const part: Part = {
					mesh,
					body,
					stall,
					home: mesh.position.clone(),
					homeQ: mesh.quaternion.clone(),
					from: new THREE.Vector3(),
					fromQ: new THREE.Quaternion(),
					mass,
					hp,
					maxHp: hp,
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
				add(
					geo.post,
					cacao,
					new CANNON.Cylinder(0.07, 0.07, 2.08, 10),
					0.6,
					[px, 1.04, pz],
					2,
					{ edged: false }
				)
			)
			for (const p of posts) {
				decorate(p.mesh, geo.cap, cacao, [0, 1.04, 0])
				decorate(p.mesh, geo.foot, cacao, [0, -1.0, 0])
			}
			const counter = add(
				geo.counter,
				keep(new THREE.MeshToonMaterial({ map: planks(s.color) })),
				new CANNON.Box(new CANNON.Vec3(0.8, 0.4, 0.35)),
				3,
				[0, 0.4, 0],
				4
			)
			const top = add(
				geo.top,
				cacao,
				new CANNON.Box(new CANNON.Vec3(0.81, 0.03, 0.4)),
				0.8,
				[0, 0.83, 0],
				2
			)
			const lips: [number, number, number, number, number][] = [
				[0, 0.385, 0.81, 0.015, 1],
				[0, -0.385, 0.81, 0.015, 1],
				[0.795, 0, 0.015, 0.4, 0],
				[-0.795, 0, 0.015, 0.4, 0],
			]
			for (const [lx, lz, hx, hz, along] of lips) {
				top.body.addShape(
					new CANNON.Box(new CANNON.Vec3(hx, 0.035, hz)),
					new CANNON.Vec3(lx, 0.065, lz)
				)
				decorate(top.mesh, along ? geo.lipLong : geo.lipShort, cacaoDark, [lx, 0.065, lz], true)
			}
			const awning = add(
				geo.awning,
				tint,
				new CANNON.Box(new CANNON.Vec3(1.1, 0.06, 0.55)),
				1.4,
				[0, 2.2, 0],
				3
			)
			decorate(awning.mesh, geo.stripe, estraza, [-0.45, 0, 0], true)
			decorate(awning.mesh, geo.stripe, estraza, [0.45, 0, 0], true)
			for (let k = 0; k < 6; k++)
				decorate(awning.mesh, geo.scallop, k % 2 ? estraza : tint, [
					-0.92 + k * 0.37,
					-0.08,
					0.55,
				])
			const sign = add(
				geo.sign,
				[tint, tint, tint, tint, face, tint],
				new CANNON.Box(new CANNON.Vec3(0.45, 0.25, 0.03)),
				0.4,
				[spread(0.3), 1.55, 0.5],
				2,
				{ rz: spread(0.24) }
			)
			decorate(sign.mesh, geo.string, ink, [-0.25, 0.4, 0])
			decorate(sign.mesh, geo.string, ink, [0.25, 0.4, 0])
			Object.assign(awning, { needs: posts, min: 3 })
			Object.assign(sign, { needs: [awning], min: 1 })
			Object.assign(top, { needs: [counter], min: 1 })
			return stall
		})

		const reach: Record<Kind, number> = {
			round: 0.16,
			lemon: 0.17,
			pod: 0.23,
			grapes: 0.13,
			pumpkin: 0.23,
			coin: 0.14,
			crate: 0.24,
			sack: 0.22,
		}
		const makeFruit = (kind: Kind, x: number, z: number, floor: number): Fruit => {
			const root = new THREE.Group()
			const body = new CANNON.Body({ mass: 0.25, linearDamping: 0.12, angularDamping: 0.75 })
			const tint = toon(pickOne(KINDS[kind]))
			let lift = 0
			if (kind === 'coin') {
				const m = new THREE.Mesh(geo.coin, [tint, coinFace, coinFace])
				m.castShadow = true
				root.add(m)
				body.addShape(new CANNON.Cylinder(0.13, 0.13, 0.045, 12))
				body.mass = 0.12
				lift = 0.0225
			} else if (kind === 'crate') {
				decorate(root, geo.crate, tint, [0, 0, 0], true)
				decorate(root, geo.slat, cacao, [0, 0.06, 0])
				decorate(root, geo.slat, cacao, [0, -0.06, 0])
				body.addShape(new CANNON.Box(new CANNON.Vec3(0.18, 0.13, 0.14)))
				body.mass = 0.7
				lift = 0.13
			} else if (kind === 'sack') {
				decorate(root, geo.ball, tint, [0, 0, 0]).scale.set(0.2, 0.17, 0.2)
				decorate(root, geo.tie, cacao, [0, 0.18, 0])
				body.addShape(new CANNON.Sphere(0.17))
				body.mass = 0.6
				body.angularDamping = 0.8
				lift = 0.17
			} else if (kind === 'grapes') {
				const spots: [number, number, number][] = [
					[-0.055, 0, 0],
					[0.055, 0, 0],
					[0, 0, 0.06],
					[0, 0.07, 0.02],
				]
				for (const [gx, gy, gz] of spots) {
					decorate(root, geo.ball, tint, [gx, gy, gz]).scale.setScalar(0.065)
					body.addShape(new CANNON.Sphere(0.065), new CANNON.Vec3(gx, gy, gz))
				}
				decorate(root, geo.stem, cacao, [0, 0.13, 0.02])
				body.mass = 0.15
				lift = 0.065
			} else if (kind === 'pumpkin') {
				decorate(root, geo.ball, tint, [0, 0, 0]).scale.set(0.21, 0.15, 0.21)
				decorate(root, geo.stem, cacao, [0, 0.15, 0]).scale.setScalar(1.6)
				body.addShape(new CANNON.Sphere(0.16))
				body.mass = 0.5
				lift = 0.15
			} else {
				const r = kind === 'round' ? 0.12 + Math.random() * 0.04 : 0.11
				const stretch = kind === 'pod' ? 2.1 : kind === 'lemon' ? 1.45 : 1
				const m = decorate(root, geo.ball, tint, [0, 0, 0])
				m.scale.set(r * stretch, r, r)
				if (kind === 'round') decorate(root, geo.stem, cacao, [0, r, 0])
				else decorate(root, geo.stem, cacao, [r * stretch, 0, 0]).rotation.z = Math.PI / 2
				const balls = kind === 'pod' ? [-0.12, 0, 0.12] : kind === 'lemon' ? [-0.05, 0.05] : [0]
				for (const bx of balls) body.addShape(new CANNON.Sphere(r), new CANNON.Vec3(bx, 0, 0))
				lift = r
			}
			body.updateMassProperties()
			body.sleepSpeedLimit = 0.15
			body.position.set(x, floor + lift + 0.002, z)
			body.quaternion.setFromEuler(0, Math.random() * Math.PI * 2, 0)
			world.addBody(body)
			body.sleep()
			scene.add(root)
			const fruit: Fruit = { mesh: root, body }
			root.userData = { fruit }
			return fruit
		}

		const fruits: Fruit[] = []
		type Spot = { x: number; z: number; r: number }
		const blocked = (x: number, z: number, r: number) =>
			stalls.some((_, i) => {
				const sx = (i - 1) * SPACING
				return Math.abs(x - sx) < 1.02 + r && Math.abs(z) < 0.42 + r
			})
		const place = (
			odds: Kind[],
			[x0, x1]: [number, number],
			[z0, z1]: [number, number],
			floor: number,
			count: number,
			taken: Spot[],
			avoidStalls: boolean
		) => {
			for (let n = 0, tries = 0; n < count && tries < 400; tries++) {
				const kind = pickOne(odds)
				const r = reach[kind]
				const x = x0 + r + Math.random() * (x1 - x0 - 2 * r)
				const z = z0 + r + Math.random() * (z1 - z0 - 2 * r)
				if (avoidStalls && blocked(x, z, r)) continue
				if (taken.some(t => Math.hypot(t.x - x, t.z - z) < t.r + r + 0.006)) continue
				taken.push({ x, z, r })
				fruits.push(makeFruit(kind, x, z, floor))
				n++
			}
		}
		stalls.forEach((_, i) => {
			const x = (i - 1) * SPACING
			place(
				COUNTER_ODDS,
				[x - TOP_AREA.x, x + TOP_AREA.x],
				[-TOP_AREA.z, TOP_AREA.z],
				COUNTER_TOP,
				9 + Math.floor(Math.random() * 5),
				[],
				false
			)
		})
		place(
			GROUND_ODDS,
			[-BOUNDS.x + 0.1, BOUNDS.x - 0.1],
			[BOUNDS.zMin + 0.1, BOUNDS.zMax - 0.1],
			0,
			16 + Math.floor(Math.random() * 8),
			[],
			true
		)
		const pickable = [...fruits.map(f => f.mesh), ...parts.map(p => p.mesh)]

		const fit = () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
			const dist = Math.max(4.3 / (t * camera.aspect), 1.75 / t)
			camera.position.copy(VIEW).multiplyScalar(dist).add(TARGET)
			camera.lookAt(TARGET)
			camera.updateProjectionMatrix()
		}
		const resize = new ResizeObserver(fit)
		resize.observe(el)
		fit()

		const wakeAll = () => {
			for (const f of fruits) f.body.wakeUp()
			for (const p of parts) if (p.loose) p.body.wakeUp()
		}

		const loosen = (p: Part, now: number) => {
			if (p.loose) return
			p.loose = true
			p.mesh.position.copy(p.home)
			const b = p.body
			b.position.copy(vec(p.home))
			b.type = CANNON.Body.DYNAMIC
			b.mass = p.mass
			b.updateMassProperties()
			b.wakeUp()
			p.stall.lastHit = now
			for (const q of p.stall.parts)
				if (!q.loose && q.needs.length && q.needs.filter(n => !n.loose).length < q.min) {
					loosen(q, now)
					q.body.angularVelocity.set(spread(2), spread(2), spread(2))
				}
			wakeAll()
		}

		const strike = (p: Part, point: THREE.Vector3, dir: THREE.Vector3, now: number) => {
			const b = p.body
			const push = dir
				.clone()
				.multiplyScalar(5.5)
				.add(new THREE.Vector3(0, 3, 0))
				.multiplyScalar(b.mass)
			b.wakeUp()
			b.applyImpulse(
				vec(push),
				new CANNON.Vec3(
					point.x - b.position.x,
					point.y - b.position.y,
					point.z - b.position.z
				)
			)
			p.stall.lastHit = now
			wakeAll()
		}

		const ray = new THREE.Raycaster()
		ray.params.Line = { threshold: 0.01 }
		const ndc = new THREE.Vector2()
		const plane = new THREE.Plane()
		const aim = new THREE.Vector3()
		const target = new THREE.Vector3()
		let grab: Grab | null = null

		const cast = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect()
			ndc.set(
				((e.clientX - r.left) / r.width) * 2 - 1,
				-((e.clientY - r.top) / r.height) * 2 + 1
			)
			ray.setFromCamera(ndc, camera)
		}
		const pick = (e: PointerEvent) => {
			cast(e)
			const hit = ray.intersectObjects(pickable, true)[0]
			if (!hit) return null
			let o: THREE.Object3D | null = hit.object
			while (o && !(o.userData as Picked).part && !(o.userData as Picked).fruit)
				o = o.parent
			return o ? { ...(o.userData as Picked), point: hit.point } : null
		}

		const hold = (e: PointerEvent, body: CANNON.Body, point: THREE.Vector3, part?: Part) => {
			body.wakeUp()
			const center = new THREE.Vector3(body.position.x, body.position.y, body.position.z)
			grab = {
				body,
				part,
				offset: point.clone().sub(center),
				point: point.clone(),
				dir: ray.ray.direction.clone(),
				x: e.clientX,
				y: e.clientY,
				moved: false,
			}
			target.copy(center)
			plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(aim).negate(), point)
			canvas.setPointerCapture(e.pointerId)
			canvas.style.cursor = 'var(--cur-grabbing)'
		}

		const down = (e: PointerEvent) => {
			const hit = pick(e)
			if (!hit) return
			if (hit.fruit) {
				hold(e, hit.fruit.body, hit.point)
				return
			}
			const part = hit.part
			if (!part || part.stall.rebuild) return
			if (part.loose) {
				hold(e, part.body, hit.point, part)
				return
			}
			const now = performance.now()
			const dir = ray.ray.direction.clone()
			for (const f of fruits)
				if (f.mesh.position.distanceTo(hit.point) < 1) {
					f.body.wakeUp()
					f.body.velocity.vadd(
						new CANNON.Vec3(spread(0.3), 0.6 + Math.random() * 0.5, spread(0.3)),
						f.body.velocity
					)
				}
			part.stall.shake = reduced ? 0 : 1
			part.stall.lastHit = now
			if (--part.hp > 0) return
			loosen(part, now)
			strike(part, hit.point, dir, now)
		}

		const move = (e: PointerEvent) => {
			if (!grab) {
				const hit = pick(e)
				canvas.style.cursor = !hit
					? ''
					: hit.fruit || hit.part?.loose
						? 'var(--cur-grab)'
						: 'var(--cur-pointer)'
				return
			}
			if (Math.hypot(e.clientX - grab.x, e.clientY - grab.y) > TAP_PX) grab.moved = true
			cast(e)
			if (!ray.ray.intersectPlane(plane, aim)) return
			aim.sub(grab.offset)
			target.set(
				THREE.MathUtils.clamp(aim.x, -BOUNDS.x + 0.2, BOUNDS.x - 0.2),
				Math.max(aim.y, 0.15),
				THREE.MathUtils.clamp(aim.z, BOUNDS.zMin + 0.2, BOUNDS.zMax - 0.2)
			)
		}

		const up = () => {
			if (!grab) return
			const g = grab
			grab = null
			canvas.style.cursor = 'var(--cur-grab)'
			if (g.part && !g.moved) {
				strike(g.part, g.point, g.dir, performance.now())
				return
			}
			const v = g.body.velocity
			const speed = v.length()
			if (speed > 14) v.scale(14 / speed, v)
			if (g.part) g.part.stall.lastHit = performance.now()
		}

		canvas.addEventListener('pointerdown', down)
		canvas.addEventListener('pointermove', move)
		canvas.addEventListener('pointerup', up)
		canvas.addEventListener('pointercancel', up)

		const eject = (s: Stall) => {
			const sx = s.parts[4].home.x
			const inside = (p: Part, at: CANNON.Vec3) => {
				const { lowerBound: lo, upperBound: hi } = p.body.aabb
				return (
					at.x > lo.x - 0.02 &&
					at.x < hi.x + 0.02 &&
					at.y > lo.y - 0.02 &&
					at.y < hi.y + 0.02 &&
					at.z > lo.z - 0.02 &&
					at.z < hi.z + 0.02
				)
			}
			for (const f of fruits) {
				const b = f.body
				if (!s.parts.some(p => inside(p, b.position))) continue
				const front = b.position.z > -0.1
				b.position.set(
					THREE.MathUtils.clamp(b.position.x, sx - 0.9, sx + 0.9),
					0.3,
					front ? 0.75 + Math.random() * 0.4 : -0.75
				)
				b.velocity.set(spread(0.6), 0.5, front ? 0.6 : -0.3)
				b.angularVelocity.setZero()
				b.wakeUp()
			}
		}

		const settle = (s: Stall, now: number) => {
			if (s.rebuild) {
				const t = Math.min(1, (now - s.rebuild) / REBUILD_TIME)
				const e = 1 - (1 - t) ** 3
				for (const p of s.parts) {
					if (!p.loose) continue
					p.mesh.position.lerpVectors(p.from, p.home, e)
					p.mesh.quaternion.slerpQuaternions(p.fromQ, p.homeQ, e)
					p.body.position.copy(vec(p.mesh.position))
					p.body.quaternion.set(
						p.mesh.quaternion.x,
						p.mesh.quaternion.y,
						p.mesh.quaternion.z,
						p.mesh.quaternion.w
					)
				}
				if (t < 1) return
				s.rebuild = 0
				for (const p of s.parts) {
					if (!p.loose) continue
					const b = p.body
					b.type = CANNON.Body.STATIC
					b.mass = 0
					b.updateMassProperties()
					b.velocity.setZero()
					b.angularVelocity.setZero()
					b.collisionResponse = true
					b.aabbNeedsUpdate = true
					b.updateAABB()
					Object.assign(p, { loose: false, hp: p.maxHp })
				}
				s.lastHit = 0
				eject(s)
				wakeAll()
				return
			}
			if (grab?.part?.stall === s) s.lastHit = now
			if (s.parts.some(p => p.loose) && now - s.lastHit > REBUILD_MS) {
				s.rebuild = now
				for (const p of s.parts) {
					if (!p.loose) continue
					p.from.copy(p.mesh.position)
					p.fromQ.copy(p.mesh.quaternion)
					p.body.type = CANNON.Body.KINEMATIC
					p.body.collisionResponse = false
					p.body.velocity.setZero()
					p.body.angularVelocity.setZero()
				}
				return
			}
			for (const p of s.parts)
				if (p.loose) {
					p.mesh.position.set(p.body.position.x, p.body.position.y, p.body.position.z)
					p.mesh.quaternion.set(
						p.body.quaternion.x,
						p.body.quaternion.y,
						p.body.quaternion.z,
						p.body.quaternion.w
					)
				}
			if (!s.shake) return
			s.shake = Math.max(0, s.shake - (1 / 60) * 4)
			const offset = Math.sin(now * 0.06) * 0.04 * s.shake
			for (const p of s.parts) if (!p.loose) p.mesh.position.x = p.home.x + offset
		}

		const clock = new THREE.Clock()
		renderer.setAnimationLoop(() => {
			const dt = Math.min(clock.getDelta(), 1 / 20)
			const now = performance.now()
			if (grab) {
				const b = grab.body
				b.wakeUp()
				b.velocity.set(
					(target.x - b.position.x) * 16,
					(target.y - b.position.y) * 16,
					(target.z - b.position.z) * 16
				)
				b.angularVelocity.scale(0.9, b.angularVelocity)
			}
			for (const f of fruits) {
				const v = f.body.velocity
				const speed = v.length()
				if (speed > MAX_SPEED) v.scale(MAX_SPEED / speed, v)
			}
			world.step(STEP, dt, 8)
			for (const s of stalls) settle(s, now)
			for (const f of fruits) {
				f.mesh.position.set(f.body.position.x, f.body.position.y, f.body.position.z)
				f.mesh.quaternion.set(
					f.body.quaternion.x,
					f.body.quaternion.y,
					f.body.quaternion.z,
					f.body.quaternion.w
				)
			}
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
