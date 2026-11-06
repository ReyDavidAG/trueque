import { useFormContext, useWatch } from 'react-hook-form'

import { Stall } from '@/components/market/stall'
import { Icon } from '@/components/ui/icon'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type {
	CategoryInfo,
	ExchangeLocation,
	Product,
	ProductImage,
} from '@/types/productType'
import { cacaos, formatMoney } from '@/utils/cacaos'

interface Props {
	images: ProductImage[]
	category: CategoryInfo
	location?: ExchangeLocation
	companyId: string
	companyName: string
}

export function StepReview({
	images,
	category,
	location,
	companyId,
	companyName,
}: Props) {
	const { control } = useFormContext<ProductForm>()
	const v = useWatch({ control })
	const swaps = Number(v.swaps) || 1
	const preview: Product = {
		id: 'preview',
		folio: '',
		companyId,
		category: category.code,
		kind: v.kind ?? 'service',
		name: v.name ?? '',
		blurb: v.blurb ?? '',
		detail: v.detail ?? null,
		includes: [],
		art: v.art ?? 'ticket',
		stall: v.stall ?? 'grana',
		price: Number(v.price) || 0,
		cost: Number(v.cost) || 0,
		stock: v.stock ? Number(v.stock) : null,
		stockLeft: v.stock ? Number(v.stock) : null,
		couponDays: Number(v.couponDays) || 30,
		swaps,
		locationId: v.locationId ?? null,
		availableFrom: null,
		availableUntil: null,
		status: 'pending',
		origin: 'manual',
		originRef: null,
		hasImages: images.length > 0,
		reviewNote: null,
	}
	const rows = [
		['Costo para tu empresa', formatMoney(preview.cost)],
		['Precio', cacaos(preview.price)],
		[
			'Existencias',
			preview.stock == null ? 'Sin límite' : String(preview.stock),
		],
		[
			'El cupón vale',
			`${preview.couponDays} días · ${swaps} ${swaps === 1 ? 'uso' : 'usos'}`,
		],
		['Categoría', category.name],
		['Se canjea en', location?.name ?? '—'],
	]
	return (
		<div className='review-split'>
			<div className='review-split__card'>
				<p className='kicker'>Así se verá en el mercado</p>
				<div className='stalls stalls--one'>
					<Stall
						product={preview}
						balance={Number.MAX_SAFE_INTEGER}
						index={0}
						cover={images[0]?.data}
						companyName={companyName}
						link={false}
					/>
				</div>
			</div>
			<div className='stack'>
				<dl className='facts'>
					{rows.map(([k, val]) => (
						<div key={k}>
							<dt>{k}</dt>
							<dd>{val}</dd>
						</div>
					))}
				</dl>
				<p className='hint'>
					<Icon name='shield' />
					<span>
						RH revisa que el precio sea parejo entre empresas. Te avisamos en
						cuanto decida.
					</span>
				</p>
			</div>
		</div>
	)
}
