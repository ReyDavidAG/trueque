import { memo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Coin } from '@/components/ui/art'
import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { PRODUCT_STATUS } from '@/constants/stall'
import { useSetProductStatus } from '@/hooks/panel/use_panel'
import type { Product, ProductStatus } from '@/types/product_type'
import { formatMoney } from '@/utils/cacaos'
import { stagger } from '@/utils/stagger'

const DONE: Partial<Record<ProductStatus, string>> = {
	paused: 'Pausado: ya no se ve en el mercado',
	live: 'De vuelta en el mercado',
	retired: 'Retirado. Los cupones ya emitidos siguen valiendo',
}

function Actions({
	product,
	editable,
}: {
	product: Product
	editable: boolean
}) {
	const status = useSetProductStatus()
	const [confirming, setConfirming] = useState(false)
	const set = (next: ProductStatus) =>
		status.mutate(
			{ id: product.id, status: next },
			{
				onSuccess: () => toast(DONE[next]),
				onError: e => toast.error(e.message),
			}
		)
	if (confirming)
		return (
			<span
				className='row__confirm animate-panel-in'
				role='group'
				aria-label='Confirmar retiro'>
				¿Retirarlo del mercado?
				<button
					className='btn btn--sm btn--grana'
					type='button'
					onClick={() => set('retired')}>
					Sí, retirar
				</button>
				<button
					className='btn btn--sm btn--ghost'
					type='button'
					onClick={() => setConfirming(false)}>
					No
				</button>
			</span>
		)
	return (
		<>
			{editable && (
				<Link
					className='btn btn--sm btn--ghost'
					to={ROUTES.editProduct(product.id)}>
					<Icon name='edit' />
					<span>Editar</span>
				</Link>
			)}
			{product.status === 'live' && (
				<button
					className='btn btn--sm btn--ghost'
					type='button'
					disabled={status.isPending}
					onClick={() => set('paused')}>
					<Icon name='pause' />
					<span>Pausar</span>
				</button>
			)}
			{product.status === 'paused' && (
				<button
					className='btn btn--sm btn--ghost'
					type='button'
					disabled={status.isPending}
					onClick={() => set('live')}>
					<Icon name='play' />
					<span>Reanudar</span>
				</button>
			)}
			{product.status !== 'retired' && (
				<button
					className='btn btn--sm btn--ghost'
					type='button'
					onClick={() => setConfirming(true)}>
					<Icon name='trash' />
					<span>Retirar</span>
				</button>
			)}
		</>
	)
}

const Row = memo(function Row({
	product,
	cover,
	index,
}: {
	product: Product
	cover?: string
	index: number
}) {
	const [label, cls] = PRODUCT_STATUS[product.status]
	return (
		<li
			className='prow animate-row-in'
			data-stall={product.stall}
			style={stagger(index)}>
			<span className='prow__art'>
				<Cover art={product.art} src={cover} />
			</span>
			<span className='prow__main'>
				<b>{product.name}</b>
				<span className='prow__meta'>
					<span className='num'>
						<Coin />
						{product.price}
					</span>
					· costo {formatMoney(product.cost)} ·{' '}
					{product.stock == null
						? 'sin límite'
						: `${product.stockLeft ?? product.stock} en existencia`}
				</span>
				{product.reviewNote && (
					<span className='prow__reason'>
						<Icon name='info' />
						RH: {product.reviewNote}
					</span>
				)}
			</span>
			<span className={`pill ${cls}`}>{label}</span>
			<span className='prow__actions'>
				<Actions product={product} editable={product.origin === 'manual'} />
			</span>
		</li>
	)
})

export function ProductRows({
	products,
	covers,
}: {
	products: Product[]
	covers: Map<string, string>
}) {
	return (
		<ul className='prows' role='list'>
			{products.map((p, i) => (
				<Row key={p.id} product={p} cover={covers.get(p.id)} index={i} />
			))}
		</ul>
	)
}
