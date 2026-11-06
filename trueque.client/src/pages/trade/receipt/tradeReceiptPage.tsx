import { Link, useParams } from 'react-router'

import { CouponTicket } from '@/components/trade/couponTicket'
import { Icon } from '@/components/ui/icon'
import { DemoNote } from '@/components/ui/stateViews'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/useSession'
import { useLocationMap } from '@/hooks/market/useMarket'
import { useBalance, useReceipt } from '@/hooks/wallet/useWallet'
import LoadingPage from '@/pages/core/loading/loadingPage'
import NotFoundPage from '@/pages/core/not_found/notFoundPage'
import { cacaos } from '@/utils/cacaos'
import { shortDate } from '@/utils/dates'

export default function TradeReceiptPage() {
	const { folio = '' } = useParams()
	const { person } = useRequiredSession()
	const receipt = useReceipt(folio)
	const balance = useBalance()
	const locations = useLocationMap()
	if (receipt.isLoading) return <LoadingPage />
	const r = receipt.data
	if (!r) return <NotFoundPage />
	const place =
		(r.locationId && locations.get(r.locationId)?.name) || 'Por confirmar'
	const rows = [
		['Producto', r.productName],
		['Lo paga', person.companyName],
		['Fecha', shortDate(r.createdAt)],
		['Trueque', `− ${cacaos(r.price)}`],
	]

	return (
		<div className='wrap narrow'>
			<div className='done-head animate-page-in'>
				<span className='done-head__mark'>
					<Icon name='check' />
				</span>
				<h1 className='h2'>¡Trato hecho!</h1>
				<p className='lede'>
					Tu cupón ya está listo. Enséñalo donde se canjea.
				</p>
			</div>
			<section className='receipt' aria-label='Recibo'>
				<header className='receipt__head'>
					<span className='receipt__brand'>El Trueque</span>
					<span className='num'>{r.orderFolio}</span>
				</header>
				<dl className='receipt__rows'>
					{rows.map(([k, v]) => (
						<div key={k}>
							<dt>{k}</dt>
							<dd>{v}</dd>
						</div>
					))}
				</dl>
				<div className='receipt__total'>
					<span>Tu saldo hoy</span>
					<b className='num'>{cacaos(balance.data?.balance ?? 0)}</b>
				</div>
				{r.used.length > 0 && (
					<details className='receipt__lots'>
						<summary>Qué cacaos se usaron</summary>
						<ul role='list'>
							{r.used.map(u => (
								<li key={`${u.sourceRef}-${u.expiresOn}`}>
									<span className='num'>{u.amount}</span> {u.sourceRef}{' '}
									<span className='muted'>
										· vencían {shortDate(u.expiresOn)}
									</span>
								</li>
							))}
						</ul>
					</details>
				)}
			</section>
			<CouponTicket coupon={r} place={place} />
			<p className='hint'>
				<Icon name='phone' />
				<span>
					Más adelante lo verás también en la app de RH, en <b>Cupones</b>, con
					el mismo código.
				</span>
			</p>
			<div className='btn-row'>
				<Link className='btn btn--ghost' to={ROUTES.coupons}>
					Mis cupones
				</Link>
				<Link className='btn btn--grana' to={ROUTES.market}>
					Volver al mercado
				</Link>
			</div>
			<DemoNote>
				Cupón de prueba: todavía no se emite en el sistema de cupones de RH.
			</DemoNote>
		</div>
	)
}
