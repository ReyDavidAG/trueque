import { useEffect, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

import { Art } from './art'

const LINES = [
	'¿Sí? Está cerrado.',
	'Ya cerramos, vuelve más tarde.',
	'¡Que está cerrado!',
	'No hay nada, de veras.',
	'Toc, toc… ¿quién es? Nadie. Cerrado.',
	'Me vas a tumbar la cortina.',
	'Estoy contando cacaos, no molestes.',
	'Voy a llamar a RH.',
	'Ya, ya… mejor cambia los filtros.',
]
const RESET_MS = 3500
const SHOW_MS = 2600
const SHOUT_AT = 380
const HIDE_AT = 2100
const SHUT_AT = 2450
const DONE_AT = 3350
const SPRING = 260
const DAMP = 9

export function ClosedStall({ onAngry }: { onAngry?: () => void }) {
	const [knocks, setKnocks] = useState(0)
	const [line, setLine] = useState<string | null>(null)
	const [open, setOpen] = useState(false)
	const [shout, setShout] = useState(false)
	const busy = useRef(false)
	const timers = useRef<number[]>([])
	const reset = useRef(0)
	const hide = useRef(0)
	const door = useRef<HTMLSpanElement>(null)
	const bubble = useRef<HTMLParagraphElement>(null)
	const spring = useRef({ x: 0, v: 0, raf: 0, prev: 0, side: 1 })

	useEffect(() => {
		const s = spring.current
		const list = timers.current
		return () => {
			cancelAnimationFrame(s.raf)
			window.clearTimeout(reset.current)
			window.clearTimeout(hide.current)
			for (const t of list) window.clearTimeout(t)
		}
	}, [])

	const wobble = () => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
		const s = spring.current
		s.side = -s.side
		s.v += s.side * 70
		if (s.raf) return
		s.prev = performance.now()
		const step = (now: number) => {
			const dt = Math.min((now - s.prev) / 1000, 1 / 30)
			s.prev = now
			s.v += (-SPRING * s.x - DAMP * s.v) * dt
			s.x += s.v * dt
			const moving = Math.abs(s.x) + Math.abs(s.v) * 0.05 > 0.02
			if (!moving) s.x = s.v = 0
			if (door.current)
				door.current.style.transform = `translateX(${s.x.toFixed(2)}px) rotate(${(s.x * 0.3).toFixed(2)}deg)`
			if (bubble.current)
				bubble.current.style.rotate = `${(-s.x * 0.6).toFixed(2)}deg`
			s.raf = moving ? requestAnimationFrame(step) : 0
		}
		s.raf = requestAnimationFrame(step)
	}

	const later = (ms: number, fn: () => void) => {
		timers.current.push(window.setTimeout(fn, ms))
	}

	const tantrum = () => {
		busy.current = true
		window.clearTimeout(reset.current)
		window.clearTimeout(hide.current)
		setOpen(true)
		later(SHOUT_AT, () => {
			setShout(true)
			setLine(
				onAngry
					? '¡Ya estuvo! Te quito los filtros y cierro.'
					: '¡Ya estuvo! Aquí no hay nada.'
			)
		})
		later(HIDE_AT, () => {
			setShout(false)
			setLine(null)
		})
		later(SHUT_AT, () => setOpen(false))
		later(DONE_AT, () => {
			busy.current = false
			timers.current = []
			setKnocks(0)
			onAngry?.()
		})
	}

	const knock = () => {
		if (busy.current) return
		wobble()
		const next = knocks + 1
		setKnocks(next)
		if (next > LINES.length) {
			tantrum()
			return
		}
		setLine(LINES[next - 1])
		window.clearTimeout(reset.current)
		window.clearTimeout(hide.current)
		reset.current = window.setTimeout(() => setKnocks(0), RESET_MS)
		hide.current = window.setTimeout(() => setLine(null), SHOW_MS)
	}

	return (
		<div className={cn('closed', open && 'is-open', shout && 'is-shout')}>
			{line && (
				<p
					ref={bubble}
					className={cn('closed__bubble', shout && 'is-angry')}
					role='status'>
					{line}
				</p>
			)}
			<button
				type='button'
				className='closed__door'
				aria-label='Tocar la cortina del puesto'
				onClick={knock}>
				<span ref={door}>
					<Art id='closed' />
					<span className='closed__window' aria-hidden='true'>
						<svg className='closed__person' viewBox='0 0 100 100'>
							<path
								className='p-shirt'
								d='M16 104c0-24 15-34 34-34s34 10 34 34z'
							/>
							<g className='closed__fist'>
								<path className='p-shirt' d='M72 80l12-18 7 5-9 19z' />
								<circle className='p-skin' cx='88' cy='58' r='7' />
							</g>
							<circle className='p-skin' cx='50' cy='44' r='22' />
							<path
								className='p-hair'
								d='M28 42c0-17 10-26 22-26s22 9 22 26c-6-9-14-11-22-11s-16 2-22 11z'
							/>
							<path className='p-line' d='M36 39l10 5M64 39l-10 5' />
							<circle className='p-ink' cx='42' cy='49' r='2.6' />
							<circle className='p-ink' cx='58' cy='49' r='2.6' />
							<path className='p-line' d='M41 61q9-7 18 0' />
							<path
								className='p-mad'
								d='M74 14l3 6M82 14l-3 6M71 22l6-1M85 22l-6-1'
							/>
						</svg>
					</span>
				</span>
			</button>
		</div>
	)
}
