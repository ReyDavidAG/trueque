import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Art, Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { EmptyState } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useLocationMap, useProducts } from '@/hooks/market/use_market'
import { useBalance, useTrade } from '@/hooks/wallet/use_wallet'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'

export default function TradeReviewPage() {
	const { id = '' } = useParams()
	const navigate = useNavigate()
	const products = useProducts()
	const balance = useBalance()
	const locations = useLocationMap()
	const trade = useTrade()
	if (products.isLoading || balance.isLoading) return <LoadingPage />
	const p = products.data?.find(x => x.id === id && x.status === 'live')
	if (!p) return <NotFoundPage />
	const money = balance.data?.balance ?? 0

	if (!trade.isPending && (money < p.price || p.stockLeft === 0))
		return (
			<div className='wrap narrow'>
				<EmptyState
					title='Este trueque ya no se puede hacer'
					body='Puede que se haya agotado o que ya no te alcance.'
					action={
						<Link className='btn' to={ROUTES.product(p.id)}>
							Ver el producto
						</Link>
					}
				/>
			</div>
		)

	const confirm = () =>
		trade.mutate(p.id, {
			onSuccess: r => navigate(ROUTES.receipt(r.folio), { replace: true }),
			onError: e => toast.error(e.message),
		})

	return (
		<div className='wrap narrow'>
			<Link className='back-link' to={ROUTES.product(p.id)}>
				<Icon name='arrowLeft' />
				{p.name}
			</Link>
			<section className='confirm' data-stall={p.stall}>
				<div className='confirm__art'>
					<Art id={p.art} />
				</div>
				<h1 className='h2'>¿Hacemos el trueque?</h1>
				<div className='confirm__math'>
					<div>
						<span>Tienes</span>
						<b className='num'>{money}</b>
					</div>
					<div className='is-minus'>
						<span>Cuesta</span>
						<b className='num'>− {p.price}</b>
					</div>
					<div className='is-total'>
						<span>Te quedan</span>
						<b className='num'>{money - p.price}</b>
					</div>
				</div>
				<p className='muted small'>
					Al confirmar se descuentan los cacaos y se emite tu cupón. Vale{' '}
					{p.couponDays} días. Se canjea en:{' '}
					{(p.locationId && locations.get(p.locationId)?.name) ||
						'por confirmar'}
					.
				</p>
				<div className='confirm__actions'>
					<Link className='btn btn--ghost' to={ROUTES.product(p.id)}>
						Ahora no
					</Link>
					<button
						className='btn btn--grana btn--lg'
						type='button'
						data-state={trade.isPending ? 'loading' : undefined}
						disabled={trade.isPending}
						onClick={confirm}>
						<Coin className='btn__bean' />
						{trade.isPending ? 'Haciendo el trueque…' : 'Confirmar trueque'}
					</button>
				</div>
			</section>
		</div>
	)
}
