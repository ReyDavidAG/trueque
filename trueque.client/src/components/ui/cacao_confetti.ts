import { POD_PATHS } from '@/components/ui/art'
import { coinSprite } from '@/components/ui/cacao_rain'

const GRAVITY = 1400
const DRAG = 1.6
const LIFE_MS = 2800
const FADE_MS = 700
const COUNT = 120
const CHIPS = [
	'--color-grana',
	'--color-maiz',
	'--color-achiote',
	'--color-nopal',
	'--color-anil',
] as const

type Bit = {
	kind: 'coin' | 'pod' | 'chip'
	color: string
	x: number
	y: number
	vx: number
	vy: number
	size: number
	spin: number
	turn: number
	flip: number
	flutter: number
}

function podSprite(size: number, css: CSSStyleDeclaration) {
	const c = document.createElement('canvas')
	c.width = c.height = size
	const g = c.getContext('2d')
	if (!g) return c
	const v = (n: string) => css.getPropertyValue(n).trim()
	g.scale(size / 512, size / 512)
	const body = new Path2D(POD_PATHS.body)
	g.fillStyle = v('--color-maiz')
	g.fill(body)
	g.fillStyle = v('--color-maiz-2')
	g.fill(new Path2D(POD_PATHS.rib))
	g.strokeStyle = v('--color-ink')
	g.lineWidth = 22
	g.lineJoin = 'round'
	g.lineCap = 'round'
	g.stroke(body)
	g.stroke(new Path2D(POD_PATHS.stem))
	return c
}

type Origin = { x: number; y: number; count?: number }

export function burstCacao(origin?: Origin) {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
	const css = getComputedStyle(document.documentElement)
	const dpr = Math.min(devicePixelRatio, 2)
	const W = innerWidth
	const H = innerHeight
	const canvas = document.createElement('canvas')
	canvas.width = W * dpr
	canvas.height = H * dpr
	canvas.className = 'cacao-confetti'
	const g = canvas.getContext('2d')
	if (!g) return
	document.body.append(canvas)
	const coin = coinSprite(Math.round(40 * dpr), css)
	const pod = podSprite(Math.round(40 * dpr), css)
	const chips = CHIPS.map(n => css.getPropertyValue(n).trim())
	const reach = Math.max(W, H)

	const life = origin ? LIFE_MS * 0.55 : LIFE_MS
	const bits: Bit[] = Array.from({ length: origin?.count ?? COUNT }, (_, i) => {
		const side = i % 3
		const x = origin ? origin.x : side === 0 ? W * 0.5 : side === 1 ? -10 : W + 10
		const base =
			origin || side === 0
				? -Math.PI / 2
				: side === 1
					? -Math.PI / 3.2
					: -Math.PI + Math.PI / 3.2
		const angle =
			base + (Math.random() - 0.5) * (origin ? 2.4 : side === 0 ? 1.4 : 0.7)
		const speed = origin
			? 260 + Math.random() * 420
			: reach * (0.9 + Math.random() * 0.8)
		const roll = Math.random()
		const kind: Bit['kind'] = origin
			? roll < 0.75
				? 'coin'
				: 'pod'
			: roll < 0.45
				? 'coin'
				: roll < 0.7
					? 'pod'
					: 'chip'
		const scale = origin ? 0.6 : 1
		return {
			kind,
			color: chips[i % chips.length],
			x,
			y: origin ? origin.y : H + 10,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: (kind === 'chip' ? 8 + Math.random() * 6 : 18 + Math.random() * 16) * scale,
			spin: Math.random() * Math.PI * 2,
			turn: (Math.random() - 0.5) * 10,
			flip: Math.random() * Math.PI * 2,
			flutter: 6 + Math.random() * 8,
		}
	})

	const start = performance.now()
	let prev = start
	const frame = (now: number) => {
		const dt = Math.min((now - prev) / 1000, 1 / 30)
		prev = now
		const t = now - start
		g.setTransform(1, 0, 0, 1, 0, 0)
		g.clearRect(0, 0, canvas.width, canvas.height)
		g.globalAlpha = Math.min(1, Math.max(0, (life - t) / FADE_MS))
		for (const b of bits) {
			const drag = Math.exp(-DRAG * dt)
			b.vx *= drag
			b.vy = b.vy * drag + GRAVITY * dt
			b.x += b.vx * dt + Math.sin(b.flip) * 20 * dt
			b.y += b.vy * dt
			b.spin += b.turn * dt
			b.flip += b.flutter * dt
			if (b.y - b.size > H && b.vy > 0) continue
			g.setTransform(dpr, 0, 0, dpr, 0, 0)
			g.translate(b.x, b.y)
			g.rotate(b.spin)
			g.scale(Math.max(0.15, Math.abs(Math.cos(b.flip))), 1)
			if (b.kind === 'chip') {
				g.fillStyle = b.color
				g.fillRect(-b.size / 2, -b.size / 4, b.size, b.size / 2)
			} else {
				g.drawImage(b.kind === 'coin' ? coin : pod, -b.size / 2, -b.size / 2, b.size, b.size)
			}
		}
		if (t < life) {
			requestAnimationFrame(frame)
			return
		}
		canvas.remove()
	}
	requestAnimationFrame(frame)
}
