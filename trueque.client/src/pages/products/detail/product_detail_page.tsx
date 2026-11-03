import { Link, useParams } from 'react-router'

import { Gallery } from '@/components/product/gallery'
import { ProductCta } from '@/components/product/product_cta'
import {
	Includes,
	Provenance,
	Where,
	Worth,
} from '@/components/product/product_extras'
import { PaymentPlan } from '@/components/trade/payment_plan'
import { Icon } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/price_sign'
import { ROUTES } from '@/constants/routes'
import { useCacaoValue } from '@/hooks/config/use_config'
import {
	useCompanyMap,
	useLocationMap,
	useProducts,
} from '@/hooks/market/use_market'
import { useBalance, useLots } from '@/hooks/wallet/use_wallet'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import { paymentPlan } from '@/utils/cacaos'

export default function ProductDetailPage() {
	const { id = '' } = useParams()
	const products = useProducts()
	const locations = useLocationMap()
	const companies = useCompanyMap()
	const balance = useBalance()
	const lots = useLots()
	const cacaoValue = useCacaoValue()
	if (products.isLoading) return <LoadingPage />
	const p = products.data?.find(x => x.id === id && x.status === 'live')
	if (!p) return <NotFoundPage />

	const money = balance.data?.balance ?? 0
	const can = money >= p.price && p.stockLeft !== 0
	const plan = can ? paymentPlan(lots.data ?? [], p.price) : null
	const facts = [
		['Lo ofrece', companies.get(p.companyId)?.name ?? 'Una empresa del grupo'],
		['El cupón vale', `${p.couponDays} días`],
		['Usos del cupón', p.swaps === 1 ? 'Uno' : String(p.swaps)],
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
			<div className='product' data-stall={p.stall}>
				<div className='product__stage'>
					<div className='stall__awning' aria-hidden='true' />
					<Gallery product={p} />
					<PriceSign price={p.price} className='product__sign' />
				</div>
				<div className='product__info'>
					<h1 className='h1'>{p.name}</h1>
					<p className='lede'>{p.detail ?? p.blurb}</p>
					<Worth price={p.price} cacaoValue={cacaoValue} />
					<dl className='facts'>
						{facts.map(([k, v]) => (
							<div key={k}>
								<dt>{k}</dt>
								<dd>{v}</dd>
							</div>
						))}
					</dl>
					<Includes items={p.includes} />
					<Where
						location={p.locationId ? locations.get(p.locationId) : undefined}
					/>
					<Provenance product={p} />
					<ProductCta product={p} balance={money} />
					{plan && <PaymentPlan plan={plan} />}
				</div>
			</div>
		</div>
	)
}
