import { useState } from 'react'

import { Art } from '@/components/ui/art'
import { useProductImages } from '@/hooks/market/use_images'
import type { Product } from '@/types/product_type'

export function Gallery({ product }: { product: Product }) {
	const images = useProductImages(product.id, product.hasImages)
	const [active, setActive] = useState(0)
	const pics = images.data ?? []
	if (!pics.length)
		return (
			<div className='product__art'>
				<Art id={product.art} label={product.name} />
			</div>
		)
	const current = pics[Math.min(active, pics.length - 1)]
	return (
		<div className='gallery'>
			<div className='gallery__main'>
				<img
					key={current.position}
					className='animate-page-in'
					src={current.data}
					alt={`${product.name}, foto ${active + 1}`}
				/>
			</div>
			{pics.length > 1 && (
				<div className='gallery__thumbs' role='group' aria-label='Fotos'>
					{pics.map((img, i) => (
						<button
							key={img.position}
							className='gallery__thumb'
							type='button'
							aria-label={`Ver foto ${i + 1}`}
							aria-current={i === active ? 'true' : undefined}
							onClick={() => setActive(i)}>
							<img src={img.data} alt='' />
						</button>
					))}
				</div>
			)}
		</div>
	)
}
