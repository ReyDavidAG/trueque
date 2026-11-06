import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

import {
	ASTEROIDS_H,
	ASTEROIDS_LIVES,
	ASTEROIDS_W,
} from '@/constants/easterEggs'
import {
	createWorld,
	drawWorld,
	type GameKey,
	readBest,
	saveBest,
	stepWorld,
} from '@/utils/asteroids'

const KEYS: Record<string, GameKey> = {
	ArrowLeft: 'left',
	a: 'left',
	A: 'left',
	ArrowRight: 'right',
	d: 'right',
	D: 'right',
	ArrowUp: 'thrust',
	w: 'thrust',
	W: 'thrust',
	' ': 'fire',
}

const PADS: { key: GameKey; label: string; text: string }[] = [
	{ key: 'left', label: 'Girar a la izquierda', text: '◀' },
	{ key: 'thrust', label: 'Avanzar', text: '▲' },
	{ key: 'right', label: 'Girar a la derecha', text: '▶' },
	{ key: 'fire', label: 'Disparar', text: '●' },
]

export function AsteroidsGame({ onExit }: { onExit: () => void }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const pressed = useRef(new Set<GameKey>())
	const [run, setRun] = useState(0)
	const [hud, setHud] = useState({ score: 0, lives: ASTEROIDS_LIVES, level: 1 })
	const [over, setOver] = useState(false)
	const [best, setBest] = useState(readBest)

	useEffect(() => {
		const canvas = canvasRef.current
		const ctx = canvas?.getContext('2d')
		if (!canvas || !ctx) return
		const style = getComputedStyle(canvas)
		const world = createWorld()
		const keys = pressed.current
		let prev = performance.now()
		let shown = ''
		let frame = 0
		const tick = (now: number) => {
			const dt = Math.min((now - prev) / 1000, 1 / 30)
			prev = now
			stepWorld(world, keys, dt)
			drawWorld(ctx, world, style.color, style.backgroundColor, now)
			const stamp = `${world.score}|${world.lives}|${world.level}`
			if (stamp !== shown) {
				shown = stamp
				setHud({ score: world.score, lives: world.lives, level: world.level })
			}
			if (world.over) {
				setBest(saveBest(world.score))
				setOver(true)
				return
			}
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		canvas.parentElement?.focus()
		return () => {
			cancelAnimationFrame(frame)
			keys.clear()
		}
	}, [run])

	const onKey = (e: KeyboardEvent, down: boolean) => {
		if (e.key === 'Escape') return onExit()
		const key = KEYS[e.key]
		if (!key) return
		e.preventDefault()
		if (down) pressed.current.add(key)
		else pressed.current.delete(key)
	}

	const again = () => {
		setOver(false)
		setHud({ score: 0, lives: ASTEROIDS_LIVES, level: 1 })
		setRun(r => r + 1)
	}

	return (
		<div
			className='rocks'
			tabIndex={0}
			role='application'
			aria-label='Rompe asteroides. Flechas para moverte, espacio para disparar, Escape para salir.'
			onKeyDown={e => onKey(e, true)}
			onKeyUp={e => onKey(e, false)}>
			<div className='rocks__hud'>
				<span>PUNTOS {String(hud.score).padStart(5, '0')}</span>
				<span>NIVEL {hud.level}</span>
				<span aria-label={`${hud.lives} vidas`}>
					{'▲ '.repeat(hud.lives).trim()}
				</span>
				<button type='button' className='rocks__btn' onClick={onExit}>
					Salir
				</button>
			</div>
			<canvas
				ref={canvasRef}
				className='rocks__screen'
				width={ASTEROIDS_W}
				height={ASTEROIDS_H}
			/>
			<div className='rocks__pads'>
				{PADS.map(p => (
					<button
						key={p.key}
						type='button'
						className='rocks__pad'
						aria-label={p.label}
						onPointerDown={() => pressed.current.add(p.key)}
						onPointerUp={() => pressed.current.delete(p.key)}
						onPointerLeave={() => pressed.current.delete(p.key)}
						onPointerCancel={() => pressed.current.delete(p.key)}>
						{p.text}
					</button>
				))}
			</div>
			{over && (
				<div className='rocks__over' role='dialog' aria-label='Fin del juego'>
					<p className='rocks__title'>FIN DEL JUEGO</p>
					<p>PUNTOS {hud.score}</p>
					<p>RÉCORD {best}</p>
					<div className='rocks__row'>
						<button
							type='button'
							className='rocks__btn'
							onClick={again}
							autoFocus>
							Otra vez
						</button>
						<button type='button' className='rocks__btn' onClick={onExit}>
							Salir
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
