import { toast } from 'sonner'

import { Art, Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { useSetProductStatus } from '@/hooks/panel/use_panel'
import type { PriceReview } from '@/types/panel_type'
import type { Product } from '@/types/product_type'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

const LABEL = {
	draft: ['Borrador', 'is-pending'],
	pending: ['Esperando a RH', 'is-pending'],
	live: ['Publicado', 'is-live'],
	paused: ['Pausado', 'is-used'],
	rejected: ['Rechazado', 'is-rejected'],
	retired: ['Retirado', 'is-used'],
} as const

export function ProductRows({
	products,
	reviews,
}: {
	products: Product[]
	reviews: Map<string, PriceReview>
}) {
	const setStatus = useSetProductStatus()
	const change = (p: Product, status: Product['status'], msg: string) =>
		setStatus.mutate(
			{ id: p.id, status },
			{
				onSuccess: () => toast.success(msg),
				onError: e => toast.error(e.message),
			}
		)

	return (
		<ul className='rows' role='list'>
			{products.map((p, i) => {
				const [label, cls] = LABEL[p.status]
				const review = reviews.get(p.id)
				return (
					<li key={p.id} className='row animate-row-in' style={stagger(i)}>
						<span className='row__art'>
							<Art id={p.art} />
						</span>
						<span className='row__name'>
							{p.name}
							{p.origin === 'custodia' && (
								<small className='row__origin'>
									<Icon name='laptop' />
									De Custodia · {p.originRef}
								</small>
							)}
							{review?.note && p.status !== 'live' && (
								<small className='row__note'>RH: {review.note}</small>
							)}
						</span>
						<span className='row__price num'>
							<Coin />
							{p.price}
						</span>
						<span className='row__status'>
							<span className={cn('pill', cls)}>{label}</span>
							{p.status === 'live' && (
								<button
									className='link-btn'
									type='button'
									disabled={setStatus.isPending}
									onClick={() =>
										change(
											p,
											'paused',
											'Producto pausado: ya no aparece en el mercado'
										)
									}>
									Pausar
								</button>
							)}
							{(p.status === 'paused' || p.status === 'rejected') && (
								<button
									className='link-btn'
									type='button'
									disabled={setStatus.isPending}
									onClick={() => change(p, 'pending', 'Mandado otra vez a RH')}>
									Mandar a RH
								</button>
							)}
						</span>
					</li>
				)
			})}
		</ul>
	)
}
