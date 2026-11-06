import { CATEGORY_LABELS } from '@/constants/stall'
import type { Category, Product } from '@/types/productType'

import { ProductRow } from './productRow'

const groupByCategory = (products: Product[]) => {
	const groups = new Map<Category, Product[]>()
	for (const product of products)
		groups.set(product.category, [
			...(groups.get(product.category) ?? []),
			product,
		])
	return groups
}

interface ProductRowsProps {
	products: Product[]
	covers: Map<string, string>
}

export function ProductRows({ products, covers }: ProductRowsProps) {
	const groups = groupByCategory(products)
	return (
		<div className='prow-groups'>
			{[...groups].map(([category, list]) => (
				<div key={category} className='prow-group'>
					{groups.size > 1 && (
						<h3 className='prow-group__title'>
							{CATEGORY_LABELS[category]}
							<span className='num'>{list.length}</span>
						</h3>
					)}
					<ul className='prows' role='list'>
						{list.map((product, index) => (
							<ProductRow
								key={product.id}
								product={product}
								cover={covers.get(product.id)}
								index={index}
							/>
						))}
					</ul>
				</div>
			))}
		</div>
	)
}
