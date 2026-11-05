import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacao_rain'
import { tokenColors } from '@/utils/token_color'

const R = 1.15
const DEPTH = 0.72
const DROP_MS = 700
const GAP_MS = 55

const spread = (n: number) => (Math.random() - 0.5) * n

const coinCount = (balance: number) =>
	Math.max(0, Math.min(40, Math.round(Math.sqrt(balance) * 2.5)))

const easeOut = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3

const bounce = (t: number) => {
	const n = 7.5625
	const d = 2.75
	if (t < 1 / d) return n * t * t
	if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
	if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
	return n * (t -= 2.625 / d) * t + 0.984375
}

export function WalletJar({ balance, earned }: { balance: number; earned: number }) {
	const host = useRef<HTMLDivElement>(null)

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
		canvas.className = 'jar__canvas'
		el.appendChild(canvas)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
		camera.position.set(0, 2.3, 4.6)
		camera.lookAt(0, -0.15, 0)
		scene.add(new THREE.HemisphereLight(color('--color-estraza'), color('--color-cacao-3'), 1.5))
		const sun = new THREE.DirectionalLight(color('--color-amate'), 2.2)
		sun.position.set(2, 4, 3)
		scene.add(sun)

		const toon = (n: string, side: THREE.Side = THREE.FrontSide) =>
			keep(new THREE.MeshToonMaterial({ color: color(n), side }))
		const hull = keep(
			new THREE.MeshBasicMaterial({ color: color('--color-ink'), side: THREE.BackSide })
		)

		const jar = new THREE.Group()
		scene.add(jar)
		const shell = keep(new THREE.SphereGeometry(R, 48, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2))
		const outside = new THREE.Mesh(shell, toon('--color-cacao-2'))
		outside.scale.y = DEPTH
		const inside = new THREE.Mesh(shell, toon('--color-cacao-3', THREE.BackSide))
		inside.scale.set(0.96, DEPTH * 0.96, 0.96)
		const line = new THREE.Mesh(shell, hull)
		line.scale.set(1.035, DEPTH * 1.04, 1.035)
		const rim = new THREE.Mesh(keep(new THREE.TorusGeometry(R * 0.98, 0.05, 10, 64)), toon('--color-maiz-2'))
		rim.rotation.x = Math.PI / 2
		const band = new THREE.Mesh(keep(new THREE.TorusGeometry(R * 0.86, 0.035, 8, 64)), toon('--color-maiz'))
		band.rotation.x = Math.PI / 2
		band.position.y = -0.36
		const foot = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.42, 0.5, 0.12, 32)), toon('--color-cacao'))
		foot.position.y = -DEPTH * R - 0.02
		jar.add(line, outside, inside, rim, band, foot)

		const face = keep(new THREE.CanvasTexture(coinSprite(128, css)))
		face.colorSpace = THREE.SRGBColorSpace
		const faceMat = keep(new THREE.MeshToonMaterial({ map: face, transparent: true }))
		const coinGeo = keep(new THREE.CylinderGeometry(0.17, 0.17, 0.045, 28))
		const rimMat = toon('--color-ink')

		const keepN = coinCount(balance)
		const n = reduced ? keepN : Math.max(keepN, coinCount(earned))
		const takeN = n - keepN
		const coins: {
			mesh: THREE.Mesh
			from: number
			to: THREE.Vector3
			delay: number
			taken: boolean
			grab: THREE.Vector3
			hold: THREE.Vector3
		}[] = []
		let layer = 0
		let placed = 0
		while (placed < n) {
			const y = -DEPTH * R + 0.1 + layer * 0.075
			const radius = R * Math.sqrt(Math.max(0, 1 - (y / (DEPTH * R)) ** 2)) * 0.78
			const ring = Math.max(1, Math.floor((radius * radius) / 0.045))
			for (let k = 0; k < ring && placed < n; k++, placed++) {
				const a = Math.random() * Math.PI * 2
				const d = Math.sqrt(Math.random()) * radius
				const mesh = new THREE.Mesh(coinGeo, [rimMat, faceMat, faceMat])
				mesh.rotation.set(spread(0.5), Math.random() * Math.PI, spread(0.5))
				jar.add(mesh)
				const to = new THREE.Vector3(Math.cos(a) * d, y, Math.sin(a) * d)
				mesh.position.copy(to)
				coins.push({
					mesh,
					from: 2.6 + Math.random() * 0.6,
					to,
					delay: placed * GAP_MS,
					taken: false,
					grab: new THREE.Vector3(),
					hold: new THREE.Vector3(spread(0.3), -0.2 - Math.random() * 0.12, 0.12 + spread(0.2)),
				})
			}
			layer++
		}

		const skin = toon('--color-achiote-soft')
		const hand = new THREE.Group()
		const part = (
			geo: THREE.BufferGeometry,
			mat: THREE.Material,
			[x, y, z]: [number, number, number],
			rx = 0,
			rz = 0
		) => {
			const m = new THREE.Mesh(keep(geo), mat)
			m.position.set(x, y, z)
			m.rotation.set(rx, 0, rz)
			const h = new THREE.Mesh(m.geometry, hull)
			h.scale.setScalar(1.1)
			m.add(h)
			hand.add(m)
		}
		part(new THREE.BoxGeometry(0.52, 0.16, 0.44), skin, [0, 0, 0])
		for (let f = 0; f < 4; f++)
			part(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), skin, [-0.19 + f * 0.126, -0.15, 0.17], 0.6)
		part(new THREE.CapsuleGeometry(0.06, 0.18, 4, 8), skin, [0.32, -0.05, 0.02], 0, 0.9)
		part(new THREE.CylinderGeometry(0.21, 0.23, 0.34, 18), toon('--color-grana'), [0, 0.24, -0.04])
		hand.visible = false
		scene.add(hand)
		const peak = coins.length ? Math.max(...coins.map(c => c.to.y)) : 0
		const phase = {
			down: n * GAP_MS + DROP_MS + 250,
			grab: 0,
			lift: 0,
			gone: 0,
		}
		phase.grab = phase.down + 650
		phase.lift = phase.grab + 300
		phase.gone = phase.lift + 950
		const handFrom = new THREE.Vector3(0.5, 3.4, 0.3)
		const handAt = new THREE.Vector3(0, peak + 0.42, 0.1)
		const handTo = new THREE.Vector3(2.9, 3.2, 0.2)
		const taking = coins.slice(coins.length - takeN)
		let grabbed = false

		const fit = () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
		}
		const resize = new ResizeObserver(fit)
		resize.observe(el)
		fit()

		const drag = { on: false, x: 0, spin: 0, v: 0.25 }
		const down = (e: PointerEvent) => {
			drag.on = true
			drag.x = e.clientX
			canvas.setPointerCapture(e.pointerId)
		}
		const move = (e: PointerEvent) => {
			if (!drag.on) return
			const dx = (e.clientX - drag.x) * 0.012
			drag.x = e.clientX
			drag.spin += dx
			drag.v = dx * 30
		}
		const up = () => {
			drag.on = false
		}
		canvas.addEventListener('pointerdown', down)
		canvas.addEventListener('pointermove', move)
		canvas.addEventListener('pointerup', up)
		canvas.addEventListener('pointercancel', up)

		const start = performance.now()
		let prev = start
		renderer.setAnimationLoop(now => {
			const dt = Math.min((now - prev) / 1000, 1 / 30)
			prev = now
			const t = now - start
			for (const c of coins) {
				if (c.taken) continue
				const k = reduced ? 1 : Math.min(1, Math.max(0, (t - c.delay) / DROP_MS))
				c.mesh.visible = k > 0
				c.mesh.position.y = c.from + (c.to.y - c.from) * bounce(k)
			}
			if (takeN > 0 && t >= phase.down && t < phase.gone + 100) {
				hand.visible = t < phase.gone
				if (t < phase.grab) {
					const k = easeOut((t - phase.down) / (phase.grab - phase.down))
					hand.position.lerpVectors(handFrom, handAt, k)
					hand.rotation.z = (1 - k) * 0.4
				} else if (t < phase.lift) {
					if (!grabbed) {
						grabbed = true
						for (const c of taking) {
							c.taken = true
							hand.attach(c.mesh)
							c.grab.copy(c.mesh.position)
						}
					}
					const k = (t - phase.grab) / (phase.lift - phase.grab)
					hand.position.copy(handAt).add(new THREE.Vector3(0, -0.06 * Math.sin(k * Math.PI), 0))
					for (const c of taking) c.mesh.position.lerpVectors(c.grab, c.hold, easeOut(k))
				} else {
					const k = Math.min(1, (t - phase.lift) / (phase.gone - phase.lift))
					hand.position.lerpVectors(handAt, handTo, k * k)
					hand.rotation.z = -k * 0.5
				}
			}
			if (!drag.on) {
				drag.v += (0.25 - drag.v) * Math.min(1, dt * 1.5)
				if (!reduced) drag.spin += drag.v * dt
			}
			jar.rotation.y = drag.spin
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
	}, [balance, earned])

	return <div ref={host} className='jar' aria-hidden='true' />
}

