import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

import { Art, Qr } from '@/components/ui/art'
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

const canTilt = () =>
	matchMedia('(pointer: fine)').matches &&
	!matchMedia('(prefers-reduced-motion: reduce)').matches

export function Ticket3d({ c, i, place }: { c: CouponCard; i: number; place: string }) {
	const [now] = useState(Date.now)
	const [flipped, setFlipped] = useState(false)
	const card = useRef<HTMLDivElement>(null)
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
	const stub = (
		<div className='ticket3d__stub'>
			<span className='ticket3d__stub-label'>Cupón</span>
			<span className='num ticket3d__stub-folio'>{c.orderFolio}</span>
		</div>
	)
	const rest = () => {
		card.current?.style.setProperty('--ry', '0deg')
		card.current?.style.setProperty('--rx', '0deg')
	}

	return (
		<li
			className={cn(
				'ticket3d animate-tile-in',
				c.state !== 'valid' && `is-${c.state}`,
				soon && 'is-soon',
				flipped && 'is-flipped',
			)}
			data-stall={c.stall}
			style={{ '--i': i } as CSSProperties}
			onPointerMove={tilt}
			onPointerLeave={rest}>
			<div ref={card} className='ticket3d__card'>
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
								onClick={() => setFlipped(true)}>
								<Icon name='ticket' />
								Mostrar código
							</button>
						)}
					</div>
					{stub}
					{c.state !== 'valid' && (
						<span className='ticket3d__stamp' aria-hidden>
							{STAMP[c.state]}
						</span>
					)}
				</div>
				{c.state === 'valid' && (
					<div className='ticket ticket3d__face ticket3d__back' inert={!flipped}>
						<Qr code={c.code} />
						<div className='ticket__body'>
							<span className='small muted'>Enséñalo en {place}</span>
							<span className='num ticket3d__code'>{c.code}</span>
							<button
								type='button'
								className='ticket3d__flip'
								onClick={() => setFlipped(false)}>
								<Icon name='arrowLeft' />
								Voltear
							</button>
						</div>
						{stub}
					</div>
				)}
			</div>
		</li>
	)
}
