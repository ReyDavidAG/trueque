import { Icon } from '@/components/ui/icon'
import type { Product } from '@/types/productType'
import { cacaos } from '@/utils/cacaos'

export function Reach({
	product,
	balance,
}: {
	product: Product
	balance: number
}) {
	if (product.stockLeft === 0)
		return <span className='reach is-out'>Agotado</span>
	if (balance >= product.price)
		return (
			<span className='reach is-ok'>
				<Icon name='check' />
				Te alcanza
			</span>
		)
	return (
		<span className='reach is-short'>
			Te faltan {cacaos(product.price - balance)}
		</span>
	)
}
