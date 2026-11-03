import { Icon } from '@/components/ui/icon'
import type { ExchangeLocation, Product } from '@/types/product_type'
import { formatMoney } from '@/utils/cacaos'

export function Worth({
	price,
	cacaoValue,
}: {
	price: number
	cacaoValue: number
}) {
	return (
		<p className='worth'>
			<Icon name='coins' />
			Equivale a <b>{formatMoney(price * cacaoValue)}</b> en especie
		</p>
	)
}

export function Includes({ items }: { items: string[] }) {
	if (!items.length) return null
	return (
		<section className='includes'>
			<h2 className='h4'>Qué incluye</h2>
			<ul role='list'>
				{items.map(x => (
					<li key={x}>
						<Icon name='check' />
						{x}
					</li>
				))}
			</ul>
		</section>
	)
}

export function Where({ location }: { location?: ExchangeLocation }) {
	if (!location) return null
	return (
		<section className='where'>
			<Icon name='pin' />
			<span>
				<b>{location.name}</b>
				{location.address}
				{location.reference && <small>{location.reference}</small>}
			</span>
		</section>
	)
}

export function Provenance({ product }: { product: Product }) {
	if (product.origin !== 'custodia') return null
	return (
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
					Folio <span className='num'>{product.originRef}</span>
				</li>
			</ul>
		</section>
	)
}
