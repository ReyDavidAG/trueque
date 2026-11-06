import type { ReactNode } from 'react'

import { Art } from '@/components/ui/art'
import { PriceSign } from '@/components/ui/price_sign'
import { useProductImages } from '@/hooks/market/use_images'
import { useStallPhysics } from '@/hooks/product/use_stall_physics'
import { useVendorPoke } from '@/hooks/product/use_vendor_poke'
import { useVendorTalk } from '@/hooks/product/use_vendor_talk'
import type { Product } from '@/types/product_type'
import { cn } from '@/utils/cn'

import { CounterBell, VendorArm, VendorBody, VendorHat } from './vendor_parts'

export function StallScene({
	product,
	greeting,
	label,
	missing,
}: {
	product: Product
	greeting: string
	label: ReactNode
	missing: number
}) {
	const images = useProductImages(product.id, product.hasImages)
	const photo = images.data?.[0]?.data
	const vendor = useVendorTalk(missing)
	const { wink, dents, stachePulled, poke } = useVendorPoke(vendor.say, vendor.later)
	const rig = useStallPhysics({
		say: vendor.say,
		arrivedAt: vendor.arrivedAt,
		stachePulled,
	})

	return (
		<section
			className={cn(
				'stall3',
				vendor.angry && 'is-angry',
				!vendor.here && 'is-away',
				vendor.act && `do-${vendor.act}`
			)}
			data-stall={product.stall}>
			<div className='stall3__roof' aria-hidden='true' />
			<div className='stall__awning stall3__awning' aria-hidden='true' />
			<div ref={rig.roomRef} className='stall3__room'>
				<button
					type='button'
					className='stall3__sign-btn'
					aria-label={`Precio: ${product.price} cacaos`}
					onClick={() => vendor.say.current('sign')}>
					<PriceSign price={product.price} className='stall3__sign' />
				</button>
				<button
					type='button'
					className='stall3__bell'
					aria-label='Tocar la campana'
					onClick={vendor.ring}>
					<CounterBell />
				</button>
				<div ref={rig.vendorRef} className='stall3__vendor'>
					<button
						type='button'
						className='stall3__talk'
						aria-label='Platicar con el vendedor'
						onClick={poke}>
						<VendorBody shut={vendor.act === 'wince'} wink={wink} dents={dents} />
					</button>
					<div ref={rig.armRef} className='stall3__arm'>
						<VendorArm />
					</div>
				</div>
				{vendor.here ? (
					<p className='stall3__bubble' aria-live='polite' key={vendor.quip ?? greeting}>
						{vendor.quip ?? greeting}
					</p>
				) : (
					<p className='stall3__note'>Toca la campana para que te atiendan</p>
				)}
				<div ref={rig.hatRef} className='stall3__hat' aria-hidden='true'>
					<VendorHat />
				</div>
				<div ref={rig.goodsRef} className='stall3__goods'>
					{photo ? (
						<img src={photo} alt={product.name} draggable={false} />
					) : (
						<Art id={product.art} label={product.name} />
					)}
				</div>
			</div>
			<div className='stall3__counter'>{label}</div>
			<p className='stall3__tips'>
				{vendor.here
					? 'Arrastra el producto, quítale el sombrero, jálale el bigote o chócala.'
					: 'El vendedor salió un momento.'}
			</p>
		</section>
	)
}
