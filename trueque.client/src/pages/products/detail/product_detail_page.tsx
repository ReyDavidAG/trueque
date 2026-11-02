import { Link, useParams } from 'react-router'

import { Reach } from '@/components/market/reach'
import { PaymentPlan } from '@/components/trade/payment_plan'
import { Art } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/price_sign'
import { ROUTES } from '@/constants/routes'
import { stallOf } from '@/constants/stall'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useLocationMap, useProducts } from '@/hooks/market/use_market'
import { useBalance, useLots } from '@/hooks/wallet/use_wallet'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import { cacaos, paymentPlan } from '@/utils/cacaos'

export default function ProductDetailPage() {
	const { id = '' } = useParams()
	const { person } = useRequiredSession()
	const products = useProducts()
	const locations = useLocationMap()
	const balance = useBalance()
	const lots = useLots()
	if (products.isLoading) return <LoadingPage />
	const p = products.data?.find(x => x.id === id && x.status === 'live')
	if (!p) return <NotFoundPage />

	const money = balance.data?.balance ?? 0
	const can = money >= p.price && p.stockLeft !== 0
	const plan = can ? paymentPlan(lots.data ?? [], p.price) : null
	const facts = [
		[
			'Lo ofrece',
			p.companyId === person.companyId
				? person.companyName
				: 'Otra empresa del grupo',
		],
		[
			'Se canjea en',
			(p.locationId && locations.get(p.locationId)?.name) || 'Por confirmar',
		],
		['El cupón vale', `${p.couponDays} días`],
		[
			'Existencias',
			p.stockLeft == null
				? 'Sin límite'
				: p.stockLeft === 0
					? 'Agotado'
					: `Quedan ${p.stockLeft}`,
		],
	]

	return (
		<div className='wrap'>
			<Link className='back-link' to={ROUTES.market}>
				<Icon name='arrowLeft' />
				El mercado
			</Link>
			<div className='product' data-stall={stallOf(p.art)}>
				<div className='product__stage'>
					<div className='stall__awning' aria-hidden='true' />
					<div className='product__art'>
						<Art id={p.art} label={p.name} />
					</div>
					<PriceSign price={p.price} className='product__sign' />
				</div>
				<div className='product__info'>
					<h1 className='h1'>{p.name}</h1>
					<p className='lede'>{p.detail ?? p.blurb}</p>
					<dl className='facts'>
						{facts.map(([k, v]) => (
							<div key={k}>
								<dt>{k}</dt>
								<dd>{v}</dd>
							</div>
						))}
					</dl>
					{p.origin === 'custodia' && (
						<section className='provenance'>
							<h2 className='h4'>
								<Icon name='laptop' />
								Viene de Custodia
							</h2>
							<ul className='checks' role='list'>
								<li className='is-ok'>
									<Icon name='check' />
									IT lo revisó y borró los datos
								</li>
								<li className='is-ok'>
									<Icon name='check' />
									Contabilidad lo dio de baja
								</li>
								<li>
									<Icon name='box' />
									Folio <span className='num'>{p.originRef}</span>
								</li>
							</ul>
						</section>
					)}
					<div className='product__cta'>
						<Reach product={p} balance={money} />
						{can ? (
							<>
								<Link
									className='btn btn--grana btn--lg btn--block'
									to={ROUTES.trade(p.id)}>
									Hacer el trueque
								</Link>
								<p className='muted small'>
									Te quedarían {cacaos(money - p.price)}. Puedes revisar antes
									de confirmar.
								</p>
							</>
						) : (
							<>
								<button
									className='btn btn--lg btn--block'
									type='button'
									disabled>
									{p.stockLeft === 0 ? 'Agotado' : 'Todavía no te alcanza'}
								</button>
								<Link className='link' to={ROUTES.earn}>
									Ve cómo ganar cacaos en Chispa
								</Link>
							</>
						)}
					</div>
					{plan && <PaymentPlan plan={plan} />}
				</div>
			</div>
		</div>
	)
}
