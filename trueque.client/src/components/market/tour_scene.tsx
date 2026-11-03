import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { coinSprite } from '@/components/ui/cacao_rain'
import { tokenColors } from '@/utils/token_color'

const SWAP_MS = 520
const TICKET = { w: 1.7, h: 0.95, notch: 0.13 }

type Model = { group: THREE.Group; update: (t: number) => void }

const easeOutBack = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function starShape(outer: number, inner: number) {
	const s = new THREE.Shape()
	for (let i = 0; i < 8; i++) {
		const r = i % 2 ? inner : outer
		const a = (i / 8) * Math.PI * 2 + Math.PI / 2
		if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r)
		else s.moveTo(Math.cos(a) * r, Math.sin(a) * r)
	}
	s.closePath()
	return s
}

function ticketShape() {
	const { w, h, notch } = TICKET
	const x = -w / 2
	const y = -h / 2
	const r = 0.1
	const s = new THREE.Shape()
	s.moveTo(x + r, y)
	s.lineTo(x + w - r, y)
	s.quadraticCurveTo(x + w, y, x + w, y + r)
	s.lineTo(x + w, -notch)
	s.absarc(x + w, 0, notch, -Math.PI / 2, Math.PI / 2, true)
	s.lineTo(x + w, y + h - r)
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
	s.lineTo(x + r, y + h)
	s.quadraticCurveTo(x, y + h, x, y + h - r)
	s.lineTo(x, notch)
	s.absarc(x, 0, notch, Math.PI / 2, -Math.PI / 2, true)
	s.lineTo(x, y + r)
	s.quadraticCurveTo(x, y, x + r, y)
	return s
}

export function TourScene({ step }: { step: number }) {
	const host = useRef<HTMLDivElement>(null)
	const stepRef = useRef(step)

	useEffect(() => {
		stepRef.current = step
	}, [step])

	useEffect(() => {
		const el = host.current
		if (!el) return
		const css = getComputedStyle(el)
		const cssVar = (n: string) => css.getPropertyValue(n).trim()
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
		canvas.className = 'tour__canvas'
		el.appendChild(canvas)

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
		camera.position.set(0, 0.3, 6.4)
		camera.lookAt(0, 0, 0)
		scene.add(new THREE.HemisphereLight(color('--color-estraza'), color('--color-cacao'), 1.6))
		const sun = new THREE.DirectionalLight(color('--color-amate'), 2.2)
		sun.position.set(3, 4, 5)
		scene.add(sun)

		const toon = (n: string) => keep(new THREE.MeshToonMaterial({ color: color(n) }))
		const hull = keep(
			new THREE.MeshBasicMaterial({ color: color('--color-ink'), side: THREE.BackSide }),
		)
		const glass = keep(
			new THREE.MeshToonMaterial({
				color: color('--color-on-dark'),
				transparent: true,
				opacity: 0.35,
			}),
		)
		const mesh = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], line = 1.06) => {
			keep(g)
			const o = new THREE.Mesh(g, m)
			if (line) {
				const h = new THREE.Mesh(g, hull)
				h.scale.setScalar(line)
				o.add(h)
			}
			return o
		}

		const coinTex = keep(new THREE.CanvasTexture(coinSprite(256, css)))
		coinTex.colorSpace = THREE.SRGBColorSpace
		const coinFace = keep(new THREE.MeshToonMaterial({ map: coinTex, transparent: true }))
		const coinRim = toon('--color-cacao-3')
		const coin = (r: number) => {
			const g = new THREE.CylinderGeometry(r, r, r * 0.22, 40)
			g.rotateX(Math.PI / 2)
			return mesh(g, [coinRim, coinFace, coinFace], 1.05)
		}

		const ticketCanvas = document.createElement('canvas')
		ticketCanvas.width = 340
		ticketCanvas.height = 190
		const tg = ticketCanvas.getContext('2d')
		if (tg) {
			tg.fillStyle = cssVar('--color-estraza')
			tg.fillRect(0, 0, 340, 190)
			tg.fillStyle = cssVar('--color-grana')
			tg.fillRect(0, 0, 92, 190)
			tg.setLineDash([10, 9])
			tg.lineWidth = 5
			tg.strokeStyle = cssVar('--color-ink')
			tg.beginPath()
			tg.moveTo(92, 14)
			tg.lineTo(92, 176)
			tg.stroke()
			tg.setLineDash([])
			tg.fillStyle = cssVar('--color-ink')
			tg.font = `700 34px ${cssVar('--font-mono')}`
			tg.fillText('CAC-', 120, 82)
			tg.fillRect(120, 108, 180, 12)
			tg.fillRect(120, 132, 120, 12)
			tg.drawImage(coinSprite(64, css), 14, 63, 64, 64)
		}
		const ticketTex = keep(new THREE.CanvasTexture(ticketCanvas))
		ticketTex.colorSpace = THREE.SRGBColorSpace
		ticketTex.repeat.set(1 / TICKET.w, 1 / TICKET.h)
		ticketTex.offset.set(0.5, 0.5)
		const ticketFace = keep(new THREE.MeshToonMaterial({ map: ticketTex }))
		const ticket = (scale = 1) => {
			const g = new THREE.ExtrudeGeometry(ticketShape(), {
				depth: 0.08,
				bevelEnabled: false,
				curveSegments: 10,
			})
			g.center()
			const m = mesh(g, [ticketFace, toon('--color-amate-3')], 1.04)
			m.scale.setScalar(scale)
			return m
		}

		const earn = (): Model => {
			const group = new THREE.Group()
			const star = mesh(
				new THREE.ExtrudeGeometry(starShape(1, 0.34), {
					depth: 0.32,
					bevelEnabled: true,
					bevelSize: 0.05,
					bevelThickness: 0.05,
					bevelSegments: 2,
				}),
				toon('--color-grana'),
			)
			star.geometry.center()
			group.add(star)
			const coins = [0, 1, 2].map(() => coin(0.26))
			group.add(...coins)
			return {
				group,
				update: t => {
					star.rotation.y = Math.sin(t * 1.2) * 0.6
					star.scale.setScalar(1 + Math.sin(t * 3) * 0.04)
					coins.forEach((c, i) => {
						const a = t * 1.4 + (i * Math.PI * 2) / 3
						c.position.set(Math.cos(a) * 1.35, Math.sin(a * 2) * 0.25, Math.sin(a) * 0.6)
						c.rotation.y = t * 3 + i
					})
				},
			}
		}

		const choose = (): Model => {
			const group = new THREE.Group()
			const target = coin(0.55)
			target.rotation.x = -0.5
			target.position.y = -0.35
			const lens = new THREE.Group()
			const rim = mesh(new THREE.TorusGeometry(0.55, 0.1, 14, 40), toon('--color-anil'), 1.08)
			const disc = mesh(new THREE.CircleGeometry(0.52, 32), glass, 0)
			const handle = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.9, 12), toon('--color-cacao'))
			handle.position.set(0.62, -0.62, 0)
			handle.rotation.z = Math.PI / 4
			lens.add(rim, disc, handle)
			group.add(target, lens)
			return {
				group,
				update: t => {
					lens.position.set(Math.cos(t * 1.3) * 0.45, 0.15 + Math.sin(t * 2.6) * 0.2, 0.6)
					lens.rotation.y = Math.sin(t * 1.3) * 0.3
					target.rotation.z = Math.sin(t) * 0.15
				},
			}
		}

		const trade = (): Model => {
			const group = new THREE.Group()
			const c = coin(0.48)
			const k = ticket(0.62)
			group.add(c, k)
			return {
				group,
				update: t => {
					const cycle = (t % 2.4) / 2.4
					const p = easeInOut(Math.min(1, cycle / 0.55))
					const turn = Math.floor(t / 2.4) % 2
					const a = (p + turn) * Math.PI
					c.position.set(Math.cos(a) * 0.85, Math.sin(a) * 0.45, Math.sin(a) * 0.4)
					k.position.set(-Math.cos(a) * 0.85, -Math.sin(a) * 0.45, -Math.sin(a) * 0.4)
					c.rotation.y = a * 2
					k.rotation.z = Math.sin(a) * 0.4
					k.rotation.y = Math.sin(t * 1.5) * 0.3
				},
			}
		}

		const show = (): Model => {
			const group = new THREE.Group()
			const k = ticket(1.05)
			const beam = mesh(
				new THREE.BoxGeometry(2.1, 0.05, 0.05),
				keep(
					new THREE.MeshBasicMaterial({
						color: color('--color-grana'),
						transparent: true,
						opacity: 0.85,
					}),
				),
				0,
			)
			beam.position.z = 0.12
			group.add(k, beam)
			return {
				group,
				update: t => {
					k.rotation.y = Math.sin(t * 1.1) * 0.45
					k.rotation.x = Math.sin(t * 0.8) * 0.15
					beam.position.y = Math.sin(t * 2.4) * 0.5
					beam.rotation.y = k.rotation.y
				},
			}
		}

		const last = (): Model => {
			const group = new THREE.Group()
			const frame = toon('--color-cacao')
			const cap = () => mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 24), frame)
			const top = cap()
			top.position.y = 0.95
			const bottom = cap()
			bottom.position.y = -0.95
			const posts = [0, 1, 2].map(i => {
				const p = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), frame)
				const a = (i / 3) * Math.PI * 2
				p.position.set(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5)
				return p
			})
			const bulb = (up: boolean) => {
				const g = new THREE.ConeGeometry(0.45, 0.85, 24, 1, true)
				const m = mesh(g, glass, 0)
				m.position.y = up ? 0.45 : -0.45
				m.rotation.z = up ? Math.PI : 0
				return m
			}
			const sand = toon('--color-maiz')
			const sandTop = mesh(new THREE.ConeGeometry(0.36, 0.6, 20), sand, 0)
			sandTop.rotation.z = Math.PI
			const sandBottom = mesh(new THREE.ConeGeometry(0.4, 0.55, 20), sand, 0)
			const glassy = new THREE.Group()
			glassy.add(top, bottom, ...posts, bulb(true), bulb(false), sandTop, sandBottom)
			group.add(glassy)
			return {
				group,
				update: t => {
					const cycle = (t % 4) / 4
					const flow = Math.min(1, cycle / 0.8)
					const flip = cycle > 0.8 ? easeInOut((cycle - 0.8) / 0.2) : 0
					sandTop.scale.setScalar(Math.max(0.01, 1 - flow))
					sandTop.position.y = 0.2 + (1 - flow) * 0.12
					sandBottom.scale.setScalar(Math.max(0.01, flow))
					sandBottom.position.y = -0.9 + flow * 0.27
					glassy.rotation.z = flip * Math.PI
					glassy.rotation.y = t * 0.5
				},
			}
		}

		const models = [earn(), choose(), trade(), show(), last()]
		const holder = new THREE.Group()
		scene.add(holder)
		for (const m of models) {
			m.group.visible = false
			holder.add(m.group)
		}

		const fit = () => {
			const w = el.clientWidth
			const h = el.clientHeight
			if (!w || !h) return
			renderer.setSize(w, h, false)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
			if (reduced) draw(performance.now())
		}

		const drag = { on: false, x: 0, y: 0, rx: 0, ry: 0, vx: 0, vy: 0 }
		const down = (e: PointerEvent) => {
			Object.assign(drag, { on: true, x: e.clientX, y: e.clientY })
			canvas.setPointerCapture(e.pointerId)
		}
		const move = (e: PointerEvent) => {
			if (!drag.on) return
			drag.ry += (e.clientX - drag.x) * 0.012
			drag.rx += (e.clientY - drag.y) * 0.008
			drag.rx = Math.max(-0.8, Math.min(0.8, drag.rx))
			drag.x = e.clientX
			drag.y = e.clientY
		}
		const up = () => {
			drag.on = false
		}
		canvas.addEventListener('pointerdown', down)
		canvas.addEventListener('pointermove', move)
		canvas.addEventListener('pointerup', up)
		canvas.addEventListener('pointercancel', up)

		let shown = -1
		let leaving = -1
		let swapAt = 0
		const clock = new THREE.Clock()
		let prev = performance.now()

		const draw = (now: number) => {
			const dt = Math.min((now - prev) / 1000, 1 / 30)
			prev = now
			const t = reduced ? 1 : clock.getElapsedTime()
			const want = stepRef.current
			if (want !== shown) {
				if (shown >= 0) leaving = shown
				shown = want
				swapAt = now
				models[shown].group.visible = true
			}
			const k = reduced ? 1 : Math.min(1, (now - swapAt) / SWAP_MS)
			models.forEach((m, i) => {
				if (i === shown) {
					m.group.scale.setScalar(Math.max(0.001, easeOutBack(k)))
					m.group.rotation.y = (1 - k) * -1.6
				} else if (i === leaving && k < 1) {
					const out = 1 - k
					m.group.scale.setScalar(Math.max(0.001, out * out))
					m.group.rotation.y = k * 1.6
				} else m.group.visible = false
				if (m.group.visible) m.update(t)
			})
			if (!drag.on) {
				drag.rx -= drag.rx * Math.min(1, dt * 4)
				drag.ry -= drag.ry * Math.min(1, dt * 4)
			}
			holder.rotation.set(drag.rx, drag.ry, 0)
			renderer.render(scene, camera)
		}

		const resize = new ResizeObserver(fit)
		resize.observe(el)
		fit()
		renderer.setAnimationLoop(now => draw(now))

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

	return <div ref={host} className='tour__visor' aria-hidden='true' />
}
