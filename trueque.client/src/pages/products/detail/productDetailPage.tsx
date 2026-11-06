import { Link, useParams } from 'react-router'

import { Chalkboard } from '@/components/product/chalkboard'
import { ChalkValue } from '@/components/product/chalkValue'
import { ProductCta } from '@/components/product/productCta'
import { Pickup } from '@/components/product/productExtras'
import { StallScene } from '@/components/product/stallScene'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useCacaoValue } from '@/hooks/config/useConfig'
import {
	useCompanyMap,
	useLocationMap,
	useProducts,
} from '@/hooks/market/useMarket'
import { useEdits } from '@/hooks/product/useEdits'
import { useSeenChanges } from '@/hooks/product/useSeenChanges'
import { useBalance } from '@/hooks/wallet/useWallet'
import LoadingPage from '@/pages/core/loading/loadingPage'
import NotFoundPage from '@/pages/core/not_found/notFoundPage'
import type { ExchangeLocation, Product } from '@/types/productType'

const FACT_OF_EDIT: Record<string, string> = {
	couponDays: 'El cupón vale',
	swaps: 'Usos del cupón',
}

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
	return (
		<ProductDetail
			p={p}
			money={balance.data?.balance ?? 0}
			cacaoValue={cacaoValue}
			companyName={companies.get(p.companyId)?.name}
			location={p.locationId ? locations.get(p.locationId) : undefined}
		/>
	)
}

function ProductDetail({
	p,
	money,
	cacaoValue,
	companyName,
	location,
}: {
	p: Product
	money: number
	cacaoValue: number
	companyName?: string
	location?: ExchangeLocation
}) {
	const missing = Math.max(0, p.price - money)
	const greeting =
		p.stockLeft === 0
			? 'Ya se me acabó, marchante. Vuelva pronto.'
			: missing === 0
				? '¡Pásele, pásele! Sí le alcanza, ¿se lo lleva?'
				: `No le alcanza todavía: le faltan ${missing} cacaos. Júntelos en Chispa y aquí lo espero.`
	const facts: [string, string][] = [
		['Lo ofrece', companyName ?? 'Una empresa del grupo'],
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
	if (p.origin === 'custodia')
		facts.push(['Viene de Custodia', `Folio ${p.originRef}`])
	const seen = useSeenChanges(`trueque.seen.detail.${p.id}`, {
		...Object.fromEntries(
			facts.filter(([k]) => k !== 'Existencias' && k !== 'Lo ofrece')
		),
		name: p.name,
		lede: p.detail ?? '',
		includes: p.includes.join('|'),
		location: p.locationId ?? '',
	})
	const edits = useEdits(p.id, 'detail')
	const fresh = new Set([...seen, ...[...edits].map(f => FACT_OF_EDIT[f] ?? f)])

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
					news={[p.price, cacaoValue, money, ...facts.flat()].join('|')}
					label={
						<div className='stall3__label'>
							<h1>
								<ChalkValue value={p.name} paper fresh={fresh.has('name')} />
							</h1>
							<Pickup location={location} fresh={fresh.has('location')} />
						</div>
					}
				/>
				<Chalkboard
					lede={p.detail ?? p.blurb}
					facts={facts}
					includes={p.includes}
					fresh={fresh}
					price={p.price}
					cacaoValue={cacaoValue}>
					<ProductCta product={p} balance={money} />
				</Chalkboard>
			</div>
		</div>
	)
}
