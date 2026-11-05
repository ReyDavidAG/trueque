import { Link, useParams } from 'react-router'

import { Chalkboard } from '@/components/product/chalkboard'
import { ProductCta } from '@/components/product/product_cta'
import { Pickup } from '@/components/product/product_extras'
import { StallScene } from '@/components/product/stall_scene'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useCacaoValue } from '@/hooks/config/use_config'
import {
	useCompanyMap,
	useLocationMap,
	useProducts,
} from '@/hooks/market/use_market'
import { useBalance } from '@/hooks/wallet/use_wallet'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'

export default function ProductDetailPage() {
	const { id = '' } = useParams()
	const products = useProducts()
	const locations = useLocationMap()
	const companies = useCompanyMap()
	const balance = useBalance()
	const cacaoValue = useCacaoValue()
	if (products.isLoading) return <LoadingPage />
	const p = products.data?.find(x => x.id === id && x.status === 'live')
	if (!p) return <NotFoundPage />

	const money = balance.data?.balance ?? 0
	const missing = Math.max(0, p.price - money)
	const greeting =
		p.stockLeft === 0
			? 'Ya se me acabó, marchante. Vuelva pronto.'
			: missing === 0
				? '¡Pásele, pásele! Sí le alcanza, ¿se lo lleva?'
				: `No le alcanza todavía: le faltan ${missing} cacaos. Júntelos en Chispa y aquí lo espero.`
	const facts: [string, string][] = [
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
	if (p.origin === 'custodia') facts.push(['Viene de Custodia', `Folio ${p.originRef}`])

	return (
		<div className='wrap'>
			<Link className='back-link' to={ROUTES.market}>
				<Icon name='arrowLeft' />
				El mercado
			</Link>
			<div className='product'>
				<StallScene
					product={p}
					greeting={greeting}
					missing={missing}
					label={
						<div className='stall3__label'>
							<h1>{p.name}</h1>
							<Pickup
								location={p.locationId ? locations.get(p.locationId) : undefined}
							/>
						</div>
					}
				/>
				<Chalkboard
					lede={p.detail ?? p.blurb}
					facts={facts}
					includes={p.includes}
					price={p.price}
					cacaoValue={cacaoValue}>
					<ProductCta product={p} balance={money} />
				</Chalkboard>
			</div>
		</div>
	)
}
