import { useMemo } from 'react'

import { ReviewCard } from '@/components/review/review_card'
import { DemoNote, EmptyState } from '@/components/ui/state_views'
import { useCacaoValue } from '@/hooks/config/use_config'
import { useCovers } from '@/hooks/market/use_images'
import {
	useCategories,
	useCompanyMap,
	useProducts,
} from '@/hooks/market/use_market'
import { formatMoney } from '@/utils/cacaos'

export function HrPanel() {
	const products = useProducts()
	const categories = useCategories()
	const companies = useCompanyMap()
	const cacaoValue = useCacaoValue()
	const pending = useMemo(
		() => (products.data ?? []).filter(p => p.status === 'pending'),
		[products.data]
	)
	const covers = useCovers(pending)
	const ranges = useMemo(
		() => new Map((categories.data ?? []).map(c => [c.code, c])),
		[categories.data]
	)

	return (
		<div className='wrap'>
			<header className='page-head'>
				<p className='kicker'>RH corporativo</p>
				<h1 className='h1'>Precios por aprobar</h1>
				<p className='lede'>
					Cada empresa propone el precio de lo que ofrece. Tú cuidas que cueste
					lo mismo en todas: el sugerido es su costo entre{' '}
					{formatMoney(cacaoValue)} por cacao. Ajusta en la barra y aprueba en
					el mismo paso.
				</p>
			</header>
			{pending.length ? (
				<div className='approvals'>
					{pending.map((p, i) => {
						const range = ranges.get(p.category)
						return range ? (
							<ReviewCard
								key={p.id}
								product={p}
								range={range}
								companyName={companies.get(p.companyId)?.name ?? ''}
								cover={covers.get(p.id)}
								cacaoValue={cacaoValue}
								index={i}
							/>
						) : null
					})}
				</div>
			) : (
				!products.isLoading && (
					<EmptyState
						title='Nada por revisar'
						body='Cuando una empresa publique o cambie un precio, aparece aquí y te avisamos en la campana.'
					/>
				)
			)}
			<DemoNote>Productos y costos de prueba.</DemoNote>
		</div>
	)
}
