import { Art } from '@/components/ui/art'
import { Hand } from '@/components/ui/hand'
import type { CouponLookup } from '@/types/config_type'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'

export function RedeemTicket({ c, torn = false }: { c: CouponLookup; torn?: boolean }) {
	return (
		<div className={cn('rticket', torn && 'is-torn')} data-stall={c.productStall}>
			<div className='rticket__half is-left'>
				<span className='rticket__art'>
					<Art id={c.productArt} />
				</span>
				<span className='rticket__name'>{c.productName}</span>
			</div>
			<div className='rticket__half is-right'>
				<span className='rticket__label'>Cupón</span>
				<span className='num rticket__code'>{c.code}</span>
				<span className='small muted'>Vale hasta {shortDate(c.validUntil)}</span>
			</div>
			{torn && (
				<>
					<Hand className='rticket__hand is-left' />
					<Hand className='rticket__hand is-right' />
					<span className='rticket__thanks' role='status'>
						¡Gracias por usar tu cupón!
					</span>
				</>
			)}
		</div>
	)
}
