import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react'

import { Art } from '@/components/ui/art'
import { PriceSign } from '@/components/ui/priceSign'
import type { VendorPart } from '@/constants/vendor'
import { useProductImages } from '@/hooks/market/useImages'
import { useChangeCount } from '@/hooks/product/useChangeCount'
import { useEdits } from '@/hooks/product/useEdits'
import { photoStamp, useSeenChanges } from '@/hooks/product/useSeenChanges'
import { useStallPhysics } from '@/hooks/product/useStallPhysics'
import { useVendorPoke } from '@/hooks/product/useVendorPoke'
import { useVendorTalk } from '@/hooks/product/useVendorTalk'
import type { Product } from '@/types/productType'
import { cn } from '@/utils/cn'

import { MiniVendor } from './miniVendor'
import { CounterBell, VendorArm, VendorBody, VendorHat } from './vendorParts'

const PHOTO_CYCLE_MS = 4500

function useCycle(count: number, ms: number) {
	const [index, setIndex] = useState(0)
	useEffect(() => {
		if (count < 2) return
		const id = window.setInterval(() => setIndex(i => (i + 1) % count), ms)
		return () => clearInterval(id)
	}, [count, ms])
	return count ? index % count : 0
}

export function StallScene({
	product,
	greeting,
	label,
	missing,
	news,
}: {
	product: Product
	greeting: string
	label: ReactNode
	missing: number
	news: string
}) {
	const images = useProductImages(product.id, product.hasImages)
	const photos = images.data?.map(i => i.data) ?? []
	const shown = useCycle(photos.length, PHOTO_CYCLE_MS)
	const vendor = useVendorTalk(missing)
	const { wink, dents, stachePulled, poke } = useVendorPoke(
		vendor.say,
		vendor.later
	)
	const { roomRef, vendorRef, armRef, hatRef, goodsRef } = useStallPhysics({
		say: vendor.say,
		arrivedAt: vendor.arrivedAt,
		stachePulled,
	})
	const ready = images.isSuccess || !product.hasImages
	const look = ready ? photoStamp(product.art, photos[0]) : undefined
	const seen = useSeenChanges(
		ready ? `trueque.seen.stall.${product.id}` : null,
		{
			price: String(product.price),
			look: look ?? '',
		}
	)
	const edits = useEdits(product.id, 'stall', ready)
	const priceWrites =
		useChangeCount(product.price) +
		(seen.has('price') || edits.has('price') ? 1 : 0)
	const lookWrites =
		useChangeCount(look) + (seen.has('look') || edits.has('look') ? 1 : 0)
	const heard = useRef({ price: product.price, name: product.name, look, news })
	useEffect(() => {
		const prev = heard.current
		heard.current = { price: product.price, name: product.name, look, news }
		const part: VendorPart | null =
			prev.price !== product.price
				? 'newPrice'
				: prev.name !== product.name
					? 'newName'
					: prev.look !== undefined && look !== undefined && prev.look !== look
						? 'newLook'
						: prev.news !== news
							? 'board'
							: null
		if (part) vendor.say.current(part)
	}, [product.price, product.name, look, news, vendor.say])

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
			<div ref={roomRef} className='stall3__room'>
				<button
					key={priceWrites}
					type='button'
					className={cn('stall3__sign-btn', priceWrites > 0 && 'is-fresh')}
					aria-label={`Precio: ${product.price} cacaos`}
					onClick={() => vendor.say.current('sign')}>
					<PriceSign price={product.price} className='stall3__sign' />
					{priceWrites > 0 && (
						<span className='stall3__fresh'>¡Nuevo precio!</span>
					)}
				</button>
				<button
					type='button'
					className='stall3__bell'
					aria-label='Tocar la campana'
					onClick={vendor.ring}>
					<CounterBell />
				</button>
				<div ref={vendorRef} className='stall3__vendor'>
					<button
						type='button'
						className='stall3__talk'
						aria-label='Platicar con el vendedor'
						onClick={poke}>
						<VendorBody
							shut={vendor.act === 'wince'}
							wink={wink}
							dents={dents}
						/>
					</button>
					<div ref={armRef} className='stall3__arm'>
						<VendorArm />
					</div>
				</div>
				{vendor.here ? (
					<p
						className='stall3__bubble'
						aria-live='polite'
						key={vendor.quip ?? greeting}>
						{vendor.quip ?? greeting}
					</p>
				) : (
					<p className='stall3__note'>Toca la campana para que te atiendan</p>
				)}
				<div className='stall3__stand' aria-hidden='true' />
				<div ref={hatRef} className='stall3__hat' aria-hidden='true'>
					<VendorHat />
				</div>
				<div
					ref={goodsRef}
					className={cn('stall3__goods', lookWrites > 0 && 'is-fresh')}>
					{lookWrites > 0 && (
						<Fragment key={lookWrites}>
							<span className='stall3__sparkle' aria-hidden='true' />
							<MiniVendor className='stall3__swapper' />
						</Fragment>
					)}
					{photos.length > 0 ? (
						photos.map((src, i) => (
							<img
								key={i}
								src={src}
								alt={i === shown ? product.name : ''}
								className={cn(i === shown && 'is-on')}
								draggable={false}
							/>
						))
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
