import {
	ASTEROIDS_BEST_KEY,
	ASTEROIDS_H as H,
	ASTEROIDS_LIVES,
	ASTEROIDS_W as W,
} from '@/constants/easterEggs'

export type GameKey = 'left' | 'right' | 'thrust' | 'fire'

interface Rock {
	x: number
	y: number
	vx: number
	vy: number
	size: number
	r: number
	shape: number[]
}

interface Shot {
	x: number
	y: number
	vx: number
	vy: number
	life: number
}

export interface World {
	ship: {
		x: number
		y: number
		angle: number
		vx: number
		vy: number
		safe: number
	}
	rocks: Rock[]
	shots: Shot[]
	score: number
	lives: number
	level: number
	cooldown: number
	thrusting: boolean
	over: boolean
}

const TURN = 4
const THRUST = 130
const MAX_SPEED = 150
const SHOT_SPEED = 210
const SHOT_LIFE = 0.85
const SHOT_GAP = 0.2
const MAX_SHOTS = 6
const SAFE_TIME = 2
const SHIP_R = 4
const ROCK_R: Record<number, number> = { 3: 16, 2: 9, 1: 5 }
const ROCK_POINTS: Record<number, number> = { 3: 20, 2: 50, 1: 100 }

const wrap = (v: number, max: number) =>
	v < 0 ? v + max : v >= max ? v - max : v

const makeRock = (x: number, y: number, size: number, level: number): Rock => {
	const angle = Math.random() * Math.PI * 2
	const speed = 14 + Math.random() * 18 + level * 4 + (3 - size) * 10
	return {
		x,
		y,
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		size,
		r: ROCK_R[size],
		shape: Array.from({ length: 9 }, () => 0.7 + Math.random() * 0.35),
	}
}

const spawnWave = (world: World) => {
	const count = 2 + world.level
	world.rocks = Array.from({ length: count }, (_, i) => {
		const edge = i % 2 === 0
		return makeRock(
			edge ? 0 : Math.random() * W,
			edge ? Math.random() * H : 0,
			3,
			world.level
		)
	})
}

const resetShip = (world: World) => {
	world.ship = {
		x: W / 2,
		y: H / 2,
		angle: -Math.PI / 2,
		vx: 0,
		vy: 0,
		safe: SAFE_TIME,
	}
}

export function createWorld(): World {
	const world: World = {
		ship: { x: 0, y: 0, angle: 0, vx: 0, vy: 0, safe: 0 },
		rocks: [],
		shots: [],
		score: 0,
		lives: ASTEROIDS_LIVES,
		level: 1,
		cooldown: 0,
		thrusting: false,
		over: false,
	}
	resetShip(world)
	spawnWave(world)
	return world
}

export function stepWorld(
	world: World,
	keys: ReadonlySet<GameKey>,
	dt: number
) {
	const { ship } = world
	if (keys.has('left')) ship.angle -= TURN * dt
	if (keys.has('right')) ship.angle += TURN * dt
	world.thrusting = keys.has('thrust')
	if (world.thrusting) {
		ship.vx += Math.cos(ship.angle) * THRUST * dt
		ship.vy += Math.sin(ship.angle) * THRUST * dt
	}
	const speed = Math.hypot(ship.vx, ship.vy)
	if (speed > MAX_SPEED) {
		ship.vx *= MAX_SPEED / speed
		ship.vy *= MAX_SPEED / speed
	}
	const drag = Math.pow(0.4, dt)
	ship.vx *= drag
	ship.vy *= drag
	ship.x = wrap(ship.x + ship.vx * dt, W)
	ship.y = wrap(ship.y + ship.vy * dt, H)
	ship.safe = Math.max(0, ship.safe - dt)

	world.cooldown -= dt
	if (
		keys.has('fire') &&
		world.cooldown <= 0 &&
		world.shots.length < MAX_SHOTS
	) {
		world.cooldown = SHOT_GAP
		world.shots.push({
			x: ship.x + Math.cos(ship.angle) * 6,
			y: ship.y + Math.sin(ship.angle) * 6,
			vx: Math.cos(ship.angle) * SHOT_SPEED + ship.vx,
			vy: Math.sin(ship.angle) * SHOT_SPEED + ship.vy,
			life: SHOT_LIFE,
		})
	}

	for (const s of world.shots) {
		s.x = wrap(s.x + s.vx * dt, W)
		s.y = wrap(s.y + s.vy * dt, H)
		s.life -= dt
	}
	for (const r of world.rocks) {
		r.x = wrap(r.x + r.vx * dt, W)
		r.y = wrap(r.y + r.vy * dt, H)
	}

	const born: Rock[] = []
	world.rocks = world.rocks.filter(rock => {
		const hit = world.shots.find(
			s => s.life > 0 && Math.hypot(s.x - rock.x, s.y - rock.y) < rock.r
		)
		if (!hit) return true
		hit.life = 0
		world.score += ROCK_POINTS[rock.size]
		if (rock.size > 1)
			born.push(
				makeRock(rock.x, rock.y, rock.size - 1, world.level),
				makeRock(rock.x, rock.y, rock.size - 1, world.level)
			)
		return false
	})
	world.rocks.push(...born)
	world.shots = world.shots.filter(s => s.life > 0)

	if (
		ship.safe <= 0 &&
		world.rocks.some(r => Math.hypot(r.x - ship.x, r.y - ship.y) < r.r + SHIP_R)
	) {
		world.lives -= 1
		if (world.lives <= 0) world.over = true
		else resetShip(world)
	}

	if (!world.rocks.length) {
		world.level += 1
		spawnWave(world)
	}
}

const plot = (
	ctx: CanvasRenderingContext2D,
	x0: number,
	y0: number,
	x1: number,
	y1: number
) => {
	let x = Math.round(x0)
	let y = Math.round(y0)
	const tx = Math.round(x1)
	const ty = Math.round(y1)
	const dx = Math.abs(tx - x)
	const dy = -Math.abs(ty - y)
	const sx = x < tx ? 1 : -1
	const sy = y < ty ? 1 : -1
	let err = dx + dy
	for (let i = 0; i < 512; i++) {
		ctx.fillRect(wrap(x, W), wrap(y, H), 1, 1)
		if (x === tx && y === ty) return
		const e2 = 2 * err
		if (e2 >= dy) {
			err += dy
			x += sx
		}
		if (e2 <= dx) {
			err += dx
			y += sy
		}
	}
}

const polygon = (ctx: CanvasRenderingContext2D, points: [number, number][]) =>
	points.forEach(([x, y], i) => {
		const [nx, ny] = points[(i + 1) % points.length]
		plot(ctx, x, y, nx, ny)
	})

export function drawWorld(
	ctx: CanvasRenderingContext2D,
	world: World,
	ink: string,
	background: string,
	now: number
) {
	ctx.fillStyle = background
	ctx.fillRect(0, 0, W, H)
	ctx.fillStyle = ink
	const { ship } = world
	const blink = ship.safe > 0 && Math.floor(now / 100) % 2 === 0
	if (!world.over && !blink) {
		const tip = (a: number, d: number): [number, number] => [
			ship.x + Math.cos(ship.angle + a) * d,
			ship.y + Math.sin(ship.angle + a) * d,
		]
		polygon(ctx, [tip(0, 7), tip(2.5, 6), tip(Math.PI, 2), tip(-2.5, 6)])
		if (world.thrusting && Math.floor(now / 60) % 2 === 0)
			polygon(ctx, [tip(2.8, 4), tip(Math.PI, 8), tip(-2.8, 4)])
	}
	for (const rock of world.rocks)
		polygon(
			ctx,
			rock.shape.map((k, i) => {
				const a = (i / rock.shape.length) * Math.PI * 2
				return [
					rock.x + Math.cos(a) * rock.r * k,
					rock.y + Math.sin(a) * rock.r * k,
				]
			})
		)
	for (const s of world.shots)
		ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2)
}

export function readBest() {
	try {
		return Number(localStorage.getItem(ASTEROIDS_BEST_KEY)) || 0
	} catch {
		return 0
	}
}

export function saveBest(score: number) {
	const best = Math.max(readBest(), score)
	try {
		localStorage.setItem(ASTEROIDS_BEST_KEY, String(best))
	} catch {
		return best
	}
	return best
}
