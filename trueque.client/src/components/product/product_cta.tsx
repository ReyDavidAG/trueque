import { Link } from 'react-router'

import { Reach } from '@/components/market/reach'
import { ROUTES } from '@/constants/routes'
import type { Product } from '@/types/product_type'
import { cacaos } from '@/utils/cacaos'

export function ProductCta({
	product,
	balance,
}: {
	product: Product
	balance: number
}) {
	const can = balance >= product.price && product.stockLeft !== 0
	return (
		<div className='product__cta'>
			<Reach product={product} balance={balance} />
			{can ? (
				<>
					<Link
						className='btn btn--grana btn--lg btn--block'
						to={ROUTES.trade(product.id)}>
						Hacer el trueque
					</Link>
					<p className='muted small'>
						Te quedarían {cacaos(balance - product.price)}. Puedes revisar antes
						de confirmar.
					</p>
				</>
			) : (
				<>
					<button className='btn btn--lg btn--block' type='button' disabled>
						{product.stockLeft === 0 ? 'Agotado' : 'Todavía no te alcanza'}
					</button>
					<Link className='link' to={ROUTES.earn}>
						Ve cómo ganar cacaos en Chispa
					</Link>
				</>
			)}
		</div>
	)
}
