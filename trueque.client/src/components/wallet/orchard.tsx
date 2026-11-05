import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import type { Movement } from '@/types/wallet_type'
import { shortDate } from '@/utils/dates'
import { tokenColors } from '@/utils/token_color'

const MAX_TREES = 5
const GROW_MS = 650
const FIELD = 7.5
const ROWS = [-4.6, -2.3, 0, 2.3, 4.6]
const COINS_PER_POD = 30
const FILLERS = 9

type Tree = { source: string; total: number; moves: Movement[] }
type PodInfo = { move: Movement; part: number; index: number; count: number }
type Tip = PodInfo & { x: number; y: number }

const seeded = (seed: number) => {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}
const spreadR = (rand: () => number, n: number) => (rand() - 0.5) * n

const sourceOf = (m: Movement) => m.label.split(' · ')[0]
const refOf = (m: Movement) => m.label.split(' · ').slice(1).join(' · ')
const easeBack = (t: number) => {
	const k = Math.min(1, Math.max(0, t))
	return 1 + 2.4 * (k - 1) ** 3 + 1.4 * (k - 1) ** 2
}

export function Orchard({ moves }: { moves: Movement[] }) {
	const host = useRef<HTMLDivElement>(null)
	const labels = useRef<(HTMLLIElement | null)[]>([])
	const [tip, setTip] = useState<Tip | null>(null)

	const trees = useMemo(() => {
		const map = new Map<string, Tree>()
		for (const m of moves) {
			if (m.amount <= 0) continue
			const key = sourceOf(m)
			const t = map.get(key) ?? { source: key, total: 0, moves: [] }
			t.total += m.amount
			t.moves.push(m)
			map.set(key, t)
		}
		const sorted = [...map.values()].sort((a, b) => b.total - a.total)
		if (sorted.length <= MAX_TREES) return sorted
		const rest = sorted.slice(MAX_TREES - 1)
		return [
			...sorted.slice(0, MAX_TREES - 1),
			{
				source: 'Otros',
				total: rest.reduce((s, t) => s + t.total, 0),
				moves: rest.flatMap(t => t.moves),
			},
		]
	}, [moves])

	useEffect(() => {
		const el = host.current
		if (!el || !trees.length) return
		const color = tokenColors(getComputedStyle(el))
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
		canvas.className = 'orchard__canvas'
		el.prepend(canvas)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
		scene.add(new THREE.HemisphereLight(color('--color-estraza'), color('--color-cacao'), 1.4))
		const sun = new THREE.DirectionalLight(color('--color-amate'), 2.2)
		sun.position.set(4, 9, 6)
		sun.castShadow = true
		sun.shadow.mapSize.set(1024, 1024)
		Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 })
		scene.add(sun)

		const toon = (n: string) => keep(new THREE.MeshToonMaterial({ color: color(n) }))
		const hull = keep(
			new THREE.MeshBasicMaterial({ color: color('--color-ink'), side: THREE.BackSide })
		)
		const outlined = (geo: THREE.BufferGeometry, mat: THREE.Material, line = 1.06) => {
			const m = new THREE.Mesh(geo, mat)
			m.castShadow = true
			const h = new THREE.Mesh(geo, hull)
			h.scale.setScalar(line)
			m.add(h)
			return m
		}

		const rand = seeded(trees.length * 97 + trees[0].total)
		const flat = (n: string, mix = 0) =>
			keep(
				new THREE.MeshToonMaterial({
					color: color(n).lerp(color('--color-ink'), mix),
					flatShading: true,
				})
			)

		const ground = new THREE.Mesh(
			keep(new THREE.CylinderGeometry(FIELD + 0.3, FIELD + 0.6, 0.5, 72)),
			toon('--color-cacao-2')
		)
		ground.position.y = -0.26
		scene.add(ground)
		const grass = new THREE.Mesh(
			keep(new THREE.CylinderGeometry(FIELD, FIELD, 0.04, 72)),
			flat('--color-nopal', 0.05)
		)
		grass.material = keep(
			new THREE.MeshToonMaterial({
				color: color('--color-nopal-soft').lerp(color('--color-nopal'), 0.35),
			})
		)
		grass.receiveShadow = true
		scene.add(grass)

		const furrowGeo = keep(new THREE.BoxGeometry(1, 0.07, 0.34))
		const soil = toon('--color-cacao-2')
		for (const z of ROWS) {
			const len = 2 * Math.sqrt(Math.max(0, FIELD ** 2 - z ** 2)) - 1.6
			if (len <= 0) continue
			const f = new THREE.Mesh(furrowGeo, soil)
			f.scale.x = len
			f.position.set(0, 0.04, z)
			f.receiveShadow = true
			scene.add(f)
		}

		const tuftGeo = keep(new THREE.ConeGeometry(0.07, 0.28, 4))
		const tufts = new THREE.InstancedMesh(tuftGeo, flat('--color-nopal', 0.15), 140)
		const stoneGeo = keep(new THREE.DodecahedronGeometry(0.12))
		const stones = new THREE.InstancedMesh(stoneGeo, flat('--color-amate-3', 0.1), 24)
		const place = new THREE.Object3D()
		const scatter = (mesh: THREE.InstancedMesh, lift: number) => {
			for (let k = 0; k < mesh.count; k++) {
				const a = rand() * Math.PI * 2
				const r = Math.sqrt(rand()) * (FIELD - 0.4)
				place.position.set(Math.cos(a) * r, lift, Math.sin(a) * r)
				place.rotation.set(spreadR(rand, 0.4), rand() * 6.3, spreadR(rand, 0.4))
				place.scale.setScalar(0.6 + rand() * 0.8)
				place.updateMatrix()
				mesh.setMatrixAt(k, place.matrix)
			}
			mesh.receiveShadow = true
			scene.add(mesh)
		}
		scatter(tufts, 0.12)
		scatter(stones, 0.05)

		const trunkGeo = keep(new THREE.CylinderGeometry(0.12, 0.22, 1.5, 8))
		trunkGeo.translate(0, 0.75, 0)
		const branchGeo = keep(new THREE.CylinderGeometry(0.05, 0.1, 1.15, 6))
		branchGeo.translate(0, 0.575, 0)
		const leafGeo = keep(new THREE.IcosahedronGeometry(1, 1))
		const podGeo = keep(
			new THREE.LatheGeometry(
				[
					[0, -0.32],
					[0.06, -0.28],
					[0.11, -0.17],
					[0.135, -0.03],
					[0.125, 0.1],
					[0.085, 0.2],
					[0.03, 0.26],
					[0, 0.27],
				].map(([x, y]) => new THREE.Vector2(x, y)),
				10
			)
		)
		const stemGeo = keep(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 5))
		const bark = toon('--color-cacao')
		const leaves = [flat('--color-nopal'), flat('--color-nopal', 0.18), flat('--color-nopal', 0.32)]
		const ripe = [flat('--color-maiz'), flat('--color-achiote'), flat('--color-maiz-2')]
		const podHot = flat('--color-grana')

		const spots: THREE.Vector3[] = []
		for (const z of ROWS)
			for (let x = -FIELD + 1.6; x <= FIELD - 1.6; x += 2.5) {
				const p = new THREE.Vector3(x + spreadR(rand, 0.9), 0, z + spreadR(rand, 0.5))
				if (p.length() < FIELD - 1.3) spots.push(p)
			}
		const focus = new THREE.Vector3(0, 0, 0.8)
		spots.sort((a, b) => a.distanceTo(focus) - b.distanceTo(focus))

		const top = trees[0].total
		const grows: { obj: THREE.Object3D; delay: number; size: number }[] = []
		const pods: THREE.Mesh[] = []
		const anchors: THREE.Vector3[] = []

		const makeTree = (scale: number) => {
			const tree = new THREE.Group()
			tree.rotation.y = rand() * Math.PI * 2
			tree.add(outlined(trunkGeo, bark, 1.1))
			const branches: THREE.Mesh[] = []
			for (let b = 0; b < 3; b++) {
				const branch = outlined(branchGeo, bark, 1.12)
				branch.position.y = 1.15 + b * 0.12
				branch.rotation.set(0, (b / 3) * Math.PI * 2 + spreadR(rand, 0.4), 0.75 + spreadR(rand, 0.2), 'YXZ')
				tree.add(branch)
				branches.push(branch)
			}
			const tips = branches.map(br => {
				const tip = new THREE.Vector3(0, 1.15, 0).applyEuler(br.rotation).add(br.position)
				return tip
			})
			const clusters = [
				...tips.map(t => [t.x, t.y + 0.25, t.z, 0.62] as const),
				[0, 2.45, 0, 0.82] as const,
				[spreadR(rand, 0.4), 2.95, spreadR(rand, 0.4), 0.58] as const,
			]
			clusters.forEach(([x, y, z, r], k) => {
				const c = outlined(leafGeo, leaves[k % leaves.length], 1.06)
				c.position.set(x, y, z)
				c.scale.set(r * 1.15, r * 0.9, r * 1.15)
				c.rotation.set(rand() * 3, rand() * 3, 0)
				tree.add(c)
			})
			tree.userData.scale = scale
			return { tree, branches }
		}

		const hang = (parent: THREE.Object3D, at: THREE.Vector3, fix?: THREE.Quaternion) => {
			const pod = new THREE.Group()
			pod.position.copy(at)
			if (fix) pod.quaternion.copy(fix)
			parent.add(pod)
			return pod
		}

		trees.forEach((t, i) => {
			const spot = spots[i] ?? new THREE.Vector3(i * 2.4 - 4, 0, 0)
			const s = 0.75 + 0.45 * (t.total / top)
			const { tree, branches } = makeTree(s)
			tree.position.copy(spot)
			scene.add(tree)
			grows.push({ obj: tree, delay: i * 180, size: s })
			anchors.push(new THREE.Vector3(spot.x, 3.45 * s, spot.z))

			const slots: (() => THREE.Group)[] = []
			for (let k = 0; k < 8; k++) {
				const a = k * 2.4
				const h = 0.42 + (k % 4) * 0.22
				slots.push(() => hang(tree, new THREE.Vector3(Math.cos(a) * 0.22, h, Math.sin(a) * 0.22)))
			}
			for (const br of branches)
				for (const f of [0.32, 0.55, 0.78])
					slots.push(() =>
						hang(br, new THREE.Vector3(0.07, 1.15 * f, 0), br.quaternion.clone().invert())
					)

			let slot = 0
			let order = 0
			for (const m of t.moves) {
				const count = Math.ceil(m.amount / COINS_PER_POD)
				for (let p = 0; p < count && slot < slots.length; p++) {
					const part = Math.min(COINS_PER_POD, m.amount - p * COINS_PER_POD)
					const pod = slots[slot++]()
					const size = 0.75 + 0.35 * (part / COINS_PER_POD)
					const body = outlined(podGeo, ripe[(slot + i) % ripe.length], 1.1)
					body.scale.setScalar(size)
					body.position.y = -0.3 * size
					body.rotation.y = rand() * 3
					body.userData = { move: m, part, index: p + 1, count, base: body.material }
					const stem = new THREE.Mesh(stemGeo, bark)
					stem.position.y = -0.02
					pod.add(body, stem)
					pods.push(body)
					grows.push({ obj: pod, delay: i * 180 + 500 + order++ * 70, size: 1 })
				}
			}
		})

		spots.slice(trees.length, trees.length + FILLERS).forEach((spot, k) => {
			const s = 0.42 + rand() * 0.22
			const { tree } = makeTree(s)
			tree.position.copy(spot)
			scene.add(tree)
			grows.push({ obj: tree, delay: 200 + k * 60, size: s })
		})
		const width = FIELD * 2 - 4

		const controls = new OrbitControls(camera, canvas)
		controls.enableDamping = true
		controls.enablePan = false
		controls.minDistance = 5
		controls.maxDistance = 22
		controls.minPolarAngle = 0.35
		controls.maxPolarAngle = 1.38
		controls.autoRotate = !reduced
		controls.autoRotateSpeed = 0.6
		controls.target.set(0, 1.1, 0)
		controls.addEventListener('start', () => {
			controls.autoRotate = false
		})

		const fit = () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
		}
		const aspect = Math.max(1, el.clientWidth / Math.max(1, el.clientHeight))
		const dist = Math.min(19, Math.max(9, (width / 2 + 3) / Math.tan(THREE.MathUtils.degToRad(17)) / aspect))
		camera.position.set(0, dist * 0.55, dist)
		const resize = new ResizeObserver(fit)
		resize.observe(el)
		fit()

		const ray = new THREE.Raycaster()
		const ndc = new THREE.Vector2()
		let hot: THREE.Mesh | null = null
		const point = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect()
			ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
			ray.setFromCamera(ndc, camera)
			const hit = ray.intersectObjects(pods, false)[0]?.object as THREE.Mesh | undefined
			if (hot && hot !== hit) hot.material = (hot.userData as { base: THREE.Material }).base
			hot = hit ?? null
			canvas.style.cursor = hit ? 'var(--cur-pointer)' : ''
			if (!hit) {
				setTip(null)
				return
			}
			hit.material = podHot
			const info = hit.userData as PodInfo
			setTip({ ...info, x: e.clientX - r.left, y: e.clientY - r.top })
		}
		const leave = () => {
			if (hot) hot.material = (hot.userData as { base: THREE.Material }).base
			hot = null
			setTip(null)
		}
		canvas.addEventListener('pointermove', point)
		canvas.addEventListener('pointerdown', point)
		canvas.addEventListener('pointerleave', leave)

		const tmp = new THREE.Vector3()
		const start = performance.now()
		renderer.setAnimationLoop(now => {
			const t = now - start
			for (const g of grows) {
				const k = reduced ? 1 : easeBack((t - g.delay) / GROW_MS)
				g.obj.visible = k > 0.001
				g.obj.scale.setScalar(Math.max(0.001, k) * g.size)
			}
			controls.update()
			anchors.forEach((a, i) => {
				const li = labels.current[i]
				if (!li) return
				tmp.copy(a).project(camera)
				const visible = tmp.z < 1
				li.style.transform = `translate(${((tmp.x + 1) / 2) * el.clientWidth}px, ${((1 - tmp.y) / 2) * el.clientHeight}px) translate(-50%, -100%)`
				li.style.opacity = visible ? '1' : '0'
			})
			renderer.render(scene, camera)
		})

		return () => {
			renderer.setAnimationLoop(null)
			resize.disconnect()
			controls.dispose()
			canvas.removeEventListener('pointermove', point)
			canvas.removeEventListener('pointerdown', point)
			canvas.removeEventListener('pointerleave', leave)
			for (const item of trash) item.dispose()
			renderer.dispose()
			canvas.remove()
		}
	}, [trees])

	if (!trees.length) return null

	return (
		<div className='orchard'>
			<div ref={host} className='orchard__stage'>
				<ol className='orchard__tags' aria-hidden='true'>
					{trees.map((t, i) => (
						<li
							key={t.source}
							ref={node => {
								labels.current[i] = node
							}}>
							<b className='num'>+{t.total}</b>
							<span>{t.source}</span>
						</li>
					))}
				</ol>
				{tip && (
					<div className='orchard__tip' style={{ left: tip.x, top: tip.y }} role='status'>
						<b className='num'>+{tip.part} cacaos</b>
						<span>{sourceOf(tip.move)}</span>
						{refOf(tip.move) && <span className='num'>{refOf(tip.move)}</span>}
						<small>
							{tip.count > 1
								? `Mazorca ${tip.index} de ${tip.count} · abono de ${tip.move.amount}`
								: 'Abono completo'}{' '}
							· {shortDate(tip.move.createdAt)}
						</small>
					</div>
				)}
			</div>
			<p className='orchard__hint muted'>
				Arrastra para recorrer tu huerto · rueda o pellizca para acercarte
			</p>
			<ul className='sr-only'>
				{trees.map(t => (
					<li key={t.source}>
						{t.source}: {t.total} cacaos en {t.moves.length} abonos.{' '}
						{t.moves
							.map(m => `+${m.amount} ${refOf(m)} ${shortDate(m.createdAt)}`)
							.join('; ')}
					</li>
				))}
			</ul>
		</div>
	)
}
