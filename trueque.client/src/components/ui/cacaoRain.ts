import { POD_PATHS } from '@/utils/artDrawing'

const GRAVITY = 3200
const FILL_MS = 1200
const HOP_MS = 180
const HOLD_MS = 250
const CLEAR_MS = 1100

type Coin = {
	x: number
	y: number
	size: number
	spin: number
	flip: number
	launch: number
	arrive: number
	leave: number
	kick: number
	drift: number
	turn: number
}

let active = false

export function coinSprite(size: number, css: CSSStyleDeclaration) {
	const c = document.createElement('canvas')
	c.width = c.height = size
	const g = c.getContext('2d')
	if (!g) return c
	const v = (n: string) => css.getPropertyValue(n).trim()
	g.scale(size / 512, size / 512)
	g.fillStyle = v('--color-ink')
	g.beginPath()
	g.arc(256, 256, 246, 0, Math.PI * 2)
	g.fill()
	g.fillStyle = v('--color-cacao')
	g.beginPath()
	g.arc(256, 256, 224, 0, Math.PI * 2)
	g.fill()
	g.strokeStyle = v('--color-cacao-3')
	g.lineWidth = 12
	g.beginPath()
	g.arc(256, 256, 200, 0, Math.PI * 2)
	g.stroke()
	g.translate(256, 262)
	g.rotate((-32 * Math.PI) / 180)
	g.scale(0.84, 0.84)
	g.translate(-256, -256)
	const body = new Path2D(POD_PATHS.body)
	g.fillStyle = v('--color-maiz')
	g.fill(body)
	g.fillStyle = v('--color-maiz-2')
	g.fill(new Path2D(POD_PATHS.rib))
	g.strokeStyle = v('--color-ink')
	g.lineWidth = 18
	g.lineJoin = 'round'
	g.lineCap = 'round'
	g.stroke(body)
	g.stroke(new Path2D(POD_PATHS.stem))
	return c
}

export function rainCacao(onCovered: () => void) {
	if (active) return
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
		onCovered()
		return
	}
	const css = getComputedStyle(document.documentElement)
	const dpr = Math.min(devicePixelRatio, 2)
	const W = innerWidth
	const H = innerHeight
	const size = Math.round(Math.min(110, Math.max(64, Math.min(W, H) / 7)))
	const sprite = coinSprite(Math.round(size * dpr), css)
	const canvas = document.createElement('canvas')
	canvas.width = W * dpr
	canvas.height = H * dpr
	canvas.className = 'cacao-rain'
	const g = canvas.getContext('2d')
	if (!g) {
		onCovered()
		return
	}
	active = true
	document.body.append(canvas)

	const gap = size * 0.7
	const rowH = gap * 0.87
	const rows = Math.ceil((H + size) / rowH)
	const fallMs = (y: number) => Math.sqrt((2 * (y + size)) / GRAVITY) * 1000
	const lead = fallMs(H)
	const coins: Coin[] = []
	for (let row = 0; row <= rows; row++) {
		const y = H - row * rowH
		for (let x = row % 2 ? gap / 2 : 0; x < W + gap; x += gap) {
			const arrive = lead + (row / rows) * FILL_MS + Math.random() * 160
			coins.push({
				x: x + (Math.random() - 0.5) * 10,
				y: y + (Math.random() - 0.5) * 10,
				size: size * (1 + Math.random() * 0.12),
				spin: Math.random() * Math.PI * 2,
				flip: Math.random() * Math.PI * 2,
				launch: arrive - fallMs(y),
				arrive,
				leave: 0,
				kick: Math.random() * 260,
				drift: (Math.random() - 0.5) * 220,
				turn: (Math.random() - 0.5) * 8,
			})
		}
	}
	coins.sort((a, b) => a.arrive - b.arrive)
	const filled = Math.max(...coins.map(c => c.arrive)) + HOP_MS
	const clearAt = filled + HOLD_MS
	for (const c of coins)
		c.leave =
			clearAt +
			(1 - c.y / H) * CLEAR_MS * 0.75 +
			Math.random() * CLEAR_MS * 0.25
	const end = clearAt + CLEAR_MS + fallMs(H + size) + 200
	const start = performance.now()
	let covered = false

	const frame = (now: number) => {
		const t = now - start
		g.setTransform(1, 0, 0, 1, 0, 0)
		g.clearRect(0, 0, canvas.width, canvas.height)
		for (const c of coins) {
			if (t < c.launch) continue
			let y = c.y
			let squash = 1
			let spin = c.spin
			if (t < c.arrive) {
				const left = (c.arrive - t) / 1000
				y = c.y - (GRAVITY * left * left) / 2
				squash = Math.max(0.2, Math.abs(Math.cos(c.flip + t * 0.012)))
				spin += left * 5
			} else if (t < c.arrive + HOP_MS) {
				y = c.y - Math.sin(((t - c.arrive) / HOP_MS) * Math.PI) * size * 0.12
			}
			let x = c.x
			if (t > c.leave) {
				const s = (t - c.leave) / 1000
				y += -c.kick * s + (GRAVITY * s * s) / 2
				if (y - c.size > H) continue
				x += c.drift * s
				spin += c.turn * s
				squash = Math.max(0.2, Math.abs(Math.cos(c.flip + s * 9)))
			}
			g.setTransform(dpr, 0, 0, dpr, 0, 0)
			g.translate(x, y)
			g.rotate(spin)
			g.scale(squash, 1)
			g.drawImage(sprite, -c.size / 2, -c.size / 2, c.size, c.size)
		}
		if (!covered && t >= filled) {
			covered = true
			onCovered()
		}
		if (t < end) {
			requestAnimationFrame(frame)
			return
		}
		canvas.remove()
		active = false
	}
	requestAnimationFrame(frame)
}
