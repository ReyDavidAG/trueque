import { Qr } from '@/components/ui/art'
import { stallOf } from '@/constants/stall'
import type { CouponCard } from '@/types/trade_type'
import { shortDate } from '@/utils/dates'

export function CouponTicket({
	coupon,
	place,
}: {
	coupon: CouponCard
	place: string
}) {
	return (
		<section
			className='coupon'
			data-stall={stallOf(coupon.art)}
			aria-label='Cupón'>
			<div className='coupon__main'>
				<p className='kicker'>Cupón</p>
				<h2 className='coupon__name'>{coupon.productName}</h2>
				<dl className='coupon__facts'>
					<div>
						<dt>Se canjea en</dt>
						<dd>{place}</dd>
					</div>
					<div>
						<dt>Vale hasta</dt>
						<dd>{shortDate(coupon.validUntil)}</dd>
					</div>
					<div>
						<dt>Canjes</dt>
						<dd>
							{coupon.swapsBudget - coupon.swapsUsed} de {coupon.swapsBudget}
						</dd>
					</div>
				</dl>
			</div>
			<div className='coupon__stub'>
				<Qr code={coupon.code} />
				<span className='coupon__code num'>{coupon.code}</span>
			</div>
		</section>
	)
}
