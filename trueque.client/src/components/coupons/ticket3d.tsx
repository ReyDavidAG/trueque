import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

import { Art, Qr } from '@/components/ui/art'
import { Hand } from '@/components/ui/hand'
import { Icon } from '@/components/ui/icon'
import type { CouponCard } from '@/types/trade_type'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'

const STATE = {
	valid: ['Vigente', 'is-live'],
	used: ['Usado', 'is-used'],
	expired: ['Venció', 'is-rejected'],
	disabled: ['Cancelado', 'is-rejected'],
} as const

const STAMP = { used: 'Canjeado', expired: 'Vencido', disabled: 'Cancelado' } as const
const SOON_DAYS = 7
const DAY = 86_400_000
const MAX_TILT = 9
const TORN_KEY = 'trueque.torn'

const canTilt = () =>
	matchMedia('(pointer: fine)').matches &&
	!matchMedia('(prefers-reduced-motion: reduce)').matches

const tornList = (): string[] => {
	try {
		return JSON.parse(localStorage.getItem(TORN_KEY) ?? '[]') as string[]
	} catch {
		return []
	}
}

const markTorn = (folio: string) => {
	try {
		localStorage.setItem(TORN_KEY, JSON.stringify([...tornList(), folio].slice(-50)))
	} catch {
		return
	}
}

function Stub({ folio }: { folio: string }) {
	return (
		<div className='ticket3d__stub'>
			<span className='ticket3d__stub-label'>Cupón</span>
			<span className='num ticket3d__stub-folio'>{folio}</span>
		</div>
	)
}

export function Ticket3d({ c, i, place }: { c: CouponCard; i: number; place: string }) {
	const [now] = useState(Date.now)
	const [seen] = useState(() => tornList().includes(c.orderFolio))
	const [done, setDone] = useState(false)
	const [turns, setTurns] = useState(0)
	const card = useRef<HTMLDivElement>(null)
	const flipped = turns % 2 === 1
	const tearing = c.state === 'used' && !seen && !done
	const [label, cls] = STATE[c.state]
	const days = Math.ceil((new Date(c.validUntil).getTime() - now) / DAY)
	const soon = c.state === 'valid' && days <= SOON_DAYS
	const note =
		c.state === 'valid'
			? soon
				? days <= 1
					? 'Vence hoy'
					: `Vence en ${days} días`
				: `Vale hasta ${shortDate(c.validUntil)}`
			: c.state === 'used'
				? 'Ya se canjeó'
				: `Venció el ${shortDate(c.validUntil)}`

	const tilt = (e: PointerEvent<HTMLLIElement>) => {
		const el = card.current
		if (!el || !canTilt()) return
		const r = e.currentTarget.getBoundingClientRect()
		const x = (e.clientX - r.left) / r.width - 0.5
		const y = (e.clientY - r.top) / r.height - 0.5
		el.style.setProperty('--ry', `${x * MAX_TILT * 2}deg`)
		el.style.setProperty('--rx', `${-y * MAX_TILT}deg`)
	}
	const rest = () => {
		card.current?.style.setProperty('--ry', '0deg')
		card.current?.style.setProperty('--rx', '0deg')
	}
	const turn = () => setTurns(t => t + 1)
	const finish = () => {
		markTorn(c.orderFolio)
		setDone(true)
	}

	return (
		<li
			className={cn(
				'ticket3d animate-tile-in',
				c.state !== 'valid' && `is-${c.state}`,
				soon && 'is-soon',
				flipped && 'is-flipped',
				tearing && 'is-tearing'
			)}
			data-stall={c.stall}
			style={{ '--i': i, '--turns': turns } as CSSProperties}
			onPointerMove={tilt}
			onPointerLeave={rest}>
			<div ref={card} className='ticket3d__card'>
				<div className='ticket3d__spin'>
				<div className='ticket3d__edge' aria-hidden />
				<div className='ticket ticket3d__face' inert={flipped}>
					<div className='ticket__art'>
						<Art id={c.art} />
					</div>
					<div className='ticket__body'>
						<span className={cn('pill', soon ? 'is-soon' : cls)}>
							{soon && <Icon name='clock' />}
							{soon ? 'Por vencer' : label}
						</span>
						<h2 className='h4'>{c.productName}</h2>
						<p className='muted small'>
							<span className={cn(soon && 'ticket3d__due')}>{note}</span> · {place}
						</p>
						{c.state === 'valid' && (
							<button
								type='button'
								className='ticket3d__flip'
								aria-expanded={flipped}
								onClick={turn}>
								<Icon name='ticket' />
								Mostrar código
							</button>
						)}
					</div>
					<Stub folio={c.orderFolio} />
					{c.state !== 'valid' && (
						<span className='ticket3d__stamp' aria-hidden>
							{STAMP[c.state]}
						</span>
					)}
				</div>
				{c.state === 'valid' && (
					<div className='ticket ticket3d__face ticket3d__back' inert={!flipped}>
						<Stub folio={c.orderFolio} />
						<div className='ticket__body'>
							<span className='small muted'>Enséñalo en {place}</span>
							<span className='num ticket3d__code'>{c.code}</span>
							<button type='button' className='ticket3d__flip' onClick={turn}>
								<Icon name='refresh' />
								Voltear
							</button>
						</div>
						<Qr code={c.code} />
					</div>
				)}
				</div>
			</div>
			{c.state === 'used' && (
				<div className='ticket3d__rip' aria-hidden='true'>
					<Stub folio={c.orderFolio} />
				</div>
			)}
			{tearing && (
				<>
					<Hand className='ticket3d__hand' />
					<span className='ticket3d__thanks' role='status' onAnimationEnd={finish}>
						¡Gracias! Que lo disfrutes
					</span>
				</>
			)}
		</li>
	)
}
