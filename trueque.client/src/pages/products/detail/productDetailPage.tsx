import { useMemo } from 'react'
import { Link, useParams } from 'react-router'

import { BoardCard } from '@/components/market/boardCard'
import { BuyBox } from '@/components/product/buyBox'
import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useCacaoValue } from '@/hooks/config/useConfig'
import { useCovers } from '@/hooks/market/useImages'
import {
	useCompanyMap,
	useLocationMap,
	useProducts,
} from '@/hooks/market/useMarket'
import { useBalance } from '@/hooks/wallet/useWallet'
import LoadingPage from '@/pages/core/loading/loadingPage'
import NotFoundPage from '@/pages/core/not_found/notFoundPage'
import type { Product } from '@/types/productType'

const RELATED = 5

export default function ProductDetailPage() {
	const { id = '' } = useParams()
	const products = useProducts()
	const balance = useBalance().data?.balance ?? 0
	const live = useMemo(
		() => (products.data ?? []).filter(p => p.status === 'live'),
		[products.data]
	)
	const p = live.find(x => x.id === id)
	const related = useMemo(
		() =>
			p
				? live
						.filter(
							x => x.id !== p.id && balance >= x.price && x.stockLeft !== 0
						)
						.sort(
							(a, b) =>
								Number(b.companyId === p.companyId) -
									Number(a.companyId === p.companyId) || b.price - a.price
						)
						.slice(0, RELATED)
				: [],
		[live, p, balance]
	)
	if (products.isLoading) return <LoadingPage />
	if (!p) return <NotFoundPage />
	return <ProductDetail p={p} balance={balance} related={related} />
}

function ProductDetail({
	p,
	balance,
	related,
}: {
	p: Product
	balance: number
	related: Product[]
}) {
	const companies = useCompanyMap()
	const location = useLocationMap().get(p.locationId ?? '')
	const cacaoValue = useCacaoValue()
	const covers = useCovers([p, ...related])
	const company = companies.get(p.companyId)?.name ?? 'Una empresa del grupo'
	const uses = p.swaps === 1 ? 'un uso' : `${p.swaps} usos`

	return (
		<div className='wrap wrap--wide'>
			<nav className='crumbs' aria-label='Estás en'>
				<Link to={ROUTES.market}>La despensa</Link>
				<Icon name='chevronRight' />
				<span>{company}</span>
				<Icon name='chevronRight' />
				<span aria-current='page'>{p.name}</span>
			</nav>
			<div className='product product--simple' data-stall={p.stall}>
				<div className='product__summary'>
					<div className='product__stage'>
						<div className='product__art'>
							<Cover art={p.art} src={covers.get(p.id)} label={p.name} />
						</div>
					</div>
					<div className='product__info'>
						<span className='company-chip'>
							<i aria-hidden='true' />
							{company}
						</span>
						<h1 className='product__name'>{p.name}</h1>
						<p className='product__detail'>{p.detail || p.blurb}</p>
						{p.includes.length > 0 && (
							<section className='get'>
								<h2 className='get__title'>Qué recibes</h2>
								<ul className='get__list' role='list'>
									{p.includes.map(x => (
										<li key={x}>
											<Icon name='check' />
											{x}
										</li>
									))}
								</ul>
							</section>
						)}
						<ul className='where-list' role='list'>
							{location && (
								<li>
									<Icon name='pin' />
									<span>
										<b>{location.name}</b>
										{location.address && ` · ${location.address}`}
										{location.reference && <small>{location.reference}</small>}
									</span>
								</li>
							)}
							<li>
								<Icon name='ticket' />
								<span>
									El cupón vale <b>{p.couponDays} días</b> · {uses}
								</span>
							</li>
						</ul>
						{p.origin === 'custodia' && (
							<p className='provenance-line'>
								<Icon name='laptop' />
								<span>
									Viene de Custodia: IT la revisó y borró los datos
									{p.originRef && (
										<>
											{' '}
											· folio <span className='num'>{p.originRef}</span>
										</>
									)}
								</span>
							</p>
						)}
					</div>
				</div>
				<BuyBox product={p} balance={balance} cacaoValue={cacaoValue} />
			</div>
			{related.length > 0 && (
				<section className='related' aria-labelledby='related-title'>
					<h2 className='related__title' id='related-title'>
						También te alcanza
					</h2>
					<div className='bgrid bgrid--row'>
						{related.map((x, i) => (
							<BoardCard
								key={x.id}
								product={x}
								balance={balance}
								index={i}
								cover={covers.get(x.id)}
								companyName={companies.get(x.companyId)?.name ?? ''}
							/>
						))}
					</div>
				</section>
			)}
		</div>
	)
}
