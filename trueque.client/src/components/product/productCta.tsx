import { useState } from 'react'
import { Link } from 'react-router'

import { ROUTES } from '@/constants/routes'
import type { Product } from '@/types/productType'
import { cacaos } from '@/utils/cacaos'

import { ChalkValue } from './chalkValue'

export function ProductCta({
	product,
	balance,
}: {
	product: Product
	balance: number
}) {
	const [declined, setDeclined] = useState(false)
	const soldOut = product.stockLeft === 0
	const can = balance >= product.price && !soldOut

	return (
		<div className='chalk-cta' aria-live='polite'>
			{soldOut ? (
				<p>
					<b>Agotado.</b> Vuelve pronto.
				</p>
			) : !can ? (
				<>
					<p>
						<b>
							Te faltan <ChalkValue value={cacaos(product.price - balance)} />.
						</b>
					</p>
					<Link className='chalk-btn' to={ROUTES.earn}>
						Ve cómo ganar cacaos
					</Link>
				</>
			) : declined ? (
				<>
					<p>
						<b>Va, aquí te lo guardo.</b>
					</p>
					<button
						className='chalk-btn'
						type='button'
						onClick={() => setDeclined(false)}>
						Pensándolo bien, sí
					</button>
				</>
			) : (
				<>
					<p>
						<b>¡Te alcanza!</b> Te quedarían{' '}
						<ChalkValue value={cacaos(balance - product.price)} />.
					</p>
					<div className='chalk-cta__row'>
						<Link className='chalk-btn is-main' to={ROUTES.trade(product.id)}>
							Sí, me lo llevo
						</Link>
						<button
							className='chalk-btn'
							type='button'
							onClick={() => setDeclined(true)}>
							Ahorita no
						</button>
					</div>
				</>
			)}
			<p className='chalk-cta__note'>
				Se usan primero los cacaos que vencen más pronto.
			</p>
		</div>
	)
}
