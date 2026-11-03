import { Link } from 'react-router'

import { Art, Qr } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { DemoNote, EmptyState, ErrorState } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useLocationMap } from '@/hooks/market/use_market'
import { useCoupons } from '@/hooks/wallet/use_wallet'
import type { CouponCard } from '@/types/trade_type'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

const STATE = {
	valid: ['Vigente', 'is-live'],
	used: ['Usado', 'is-used'],
	expired: ['Venció', 'is-rejected'],
	disabled: ['Cancelado', 'is-rejected'],
} as const

function Ticket({ c, i, place }: { c: CouponCard; i: number; place: string }) {
	const [label, cls] = STATE[c.state]
	const note =
		c.state === 'valid'
			? `Vale hasta ${shortDate(c.validUntil)}`
			: c.state === 'used'
				? 'Ya se canjeó'
				: `Venció el ${shortDate(c.validUntil)}`
	return (
		<li
			className={cn('ticket animate-tile-in', c.state !== 'valid' && 'is-off')}
			data-stall={c.stall}
			style={stagger(i)}>
			<div className='ticket__art'>
				<Art id={c.art} />
			</div>
			<div className='ticket__body'>
				<span className={cn('pill', cls)}>{label}</span>
				<h2 className='h4'>{c.productName}</h2>
				<p className='muted small'>
					{note} · {place}
				</p>
				{c.state === 'valid' && (
					<details className='ticket__qr'>
						<summary>
							<Icon name='ticket' />
							Mostrar código
						</summary>
						<Qr code={c.code} />
						<span className='num'>{c.code}</span>
					</details>
				)}
			</div>
			<span className='ticket__folio num'>{c.orderFolio}</span>
		</li>
	)
}

export default function CouponsPage() {
	const coupons = useCoupons()
	const places = useLocationMap()
	const list = coupons.data ?? []
	const valid = list.filter(c => c.state === 'valid')
	const past = list.filter(c => c.state !== 'valid')
	const placeOf = (c: CouponCard) =>
		(c.locationId && places.get(c.locationId)?.name) || 'Por confirmar'

	if (coupons.error)
		return (
			<div className='wrap narrow'>
				<ErrorState
					message={coupons.error.message}
					onRetry={() => void coupons.refetch()}
				/>
			</div>
		)

	return (
		<div className='wrap narrow'>
			<header className='page-head'>
				<h1 className='h1'>Mis cupones</h1>
				<p className='lede'>
					Enséñalos donde se canjean. El lugar escanea el código y listo.
				</p>
			</header>
			{valid.length ? (
				<ul className='tickets' role='list'>
					{valid.map((c, i) => (
						<Ticket key={c.orderFolio} c={c} i={i} place={placeOf(c)} />
					))}
				</ul>
			) : (
				!coupons.isLoading && (
					<EmptyState
						title='Todavía no tienes cupones vigentes'
						body='Cuando hagas un trueque, aquí aparece tu cupón con su código.'
						action={
							<Link className='btn btn--grana' to={ROUTES.market}>
								Ver el mercado
							</Link>
						}
					/>
				)
			)}
			{past.length > 0 && (
				<section className='section'>
					<div className='section__head'>
						<h2 className='h3'>Usados y vencidos</h2>
					</div>
					<ul className='tickets' role='list'>
						{past.map((c, i) => (
							<Ticket key={c.orderFolio} c={c} i={i} place={placeOf(c)} />
						))}
					</ul>
				</section>
			)}
			<DemoNote>Cupones de prueba.</DemoNote>
		</div>
	)
}
