import { memo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Coin } from '@/components/ui/art'
import { Cover } from '@/components/ui/cover'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { CATEGORY_LABELS, PRODUCT_STATUS } from '@/constants/stall'
import { useSetProductStatus } from '@/hooks/panel/use_panel'
import type { Product, ProductStatus } from '@/types/product_type'
import { formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

const DONE: Partial<Record<ProductStatus, string>> = {
	paused: 'Pausado: ya no se ve en el mercado',
	live: 'De vuelta en el mercado',
	retired: 'Retirado. Los cupones ya emitidos siguen valiendo',
}

const CARRY_MS = 1500
const OPEN_MS = 1350

type Fx = 'carry' | 'open' | null

const motionMs = (ms: number) =>
	matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms

function Actions({
	product,
	editable,
	onFx,
}: {
	product: Product
	editable: boolean
	onFx: (fx: Fx) => void
}) {
	const status = useSetProductStatus()
	const navigate = useNavigate()
	const [confirming, setConfirming] = useState(false)
	const set = (next: ProductStatus) =>
		status.mutate(
			{ id: product.id, status: next },
			{
				onSuccess: () => toast(DONE[next]),
				onError: e => {
					onFx(null)
					toast.error(e.message)
				},
			}
		)
	const retire = () => {
		onFx('carry')
		setTimeout(() => set('retired'), motionMs(CARRY_MS))
	}
	const edit = () => {
		onFx('open')
		setTimeout(() => navigate(ROUTES.editProduct(product.id)), motionMs(OPEN_MS))
	}
	if (confirming)
		return (
			<span
				className='row__confirm animate-panel-in'
				role='group'
				aria-label='Confirmar retiro'>
				¿Retirarlo del mercado?
				<button className='btn btn--sm btn--grana' type='button' onClick={retire}>
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
				<button className='btn btn--sm btn--ghost' type='button' onClick={edit}>
					<Icon name='edit' />
					<span>Editar</span>
				</button>
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
			<button
				className='btn btn--sm btn--ghost'
				type='button'
				onClick={() => setConfirming(true)}>
				<Icon name='trash' />
				<span>Retirar</span>
			</button>
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
	const [fx, setFx] = useState<Fx>(null)
	const [label, cls] = PRODUCT_STATUS[product.status]
	return (
		<li
			className={cn('prow animate-row-in', fx && `is-${fx}`)}
			data-stall={product.stall}
			data-status={product.status}
			inert={fx !== null}
			style={stagger(index)}>
			<span className='prow__lid' aria-hidden='true'>
				<i />
				<i />
				<b className='prow__seam' />
			</span>
			<svg className='prow__knife' viewBox='0 0 24 64' aria-hidden='true'>
				<path className='prow__blade' d='M8 2l8 8v10H8z' />
				<rect className='prow__grip' x='5' y='18' width='14' height='44' rx='4' />
				<path className='prow__ridge' d='M9 28h6M9 36h6M9 44h6M9 52h6' />
			</svg>
			<span className='prow__art'>
				<span className='prow__cover'>
					<Cover art={product.art} src={cover} />
				</span>
			</span>
			<span className='prow__main'>
				<span className='prow__label-head'>
					<span>Envío</span>
					<span className='num'>{product.folio}</span>
				</span>
				<span className='prow__label-body'>
					<span key={product.status} className={`pill prow__pill ${cls}`}>
						{label}
					</span>
					<b className='prow__name'>{product.name}</b>
					<span className='prow__fields'>
						<span>Precio</span>
						<span className='num'>
							<Coin />
							{product.price}
						</span>
						<span>Costo</span>
						<span className='num'>{formatMoney(product.cost)}</span>
						<span>Existencia</span>
						<span className='num'>
							{product.stock == null
								? 'Sin límite'
								: product.stockLeft ?? product.stock}
						</span>
					</span>
					<span className='prow__barcode' aria-hidden='true' />
				</span>
			</span>
			{product.reviewNote && (
				<span className='prow__reason'>
					<Icon name='info' />
					RH: {product.reviewNote}
				</span>
			)}
			<span className='prow__actions'>
				<Actions product={product} editable={product.origin === 'manual'} onFx={setFx} />
			</span>
			{product.status === 'paused' && (
				<span className='prow__stamp' aria-hidden='true'>
					En pausa
				</span>
			)}
			<span className='prow__dolly' aria-hidden='true'>
				<i />
				<i />
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
	const groups = Map.groupBy(products, p => p.category)
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
						{list.map((p, i) => (
							<Row key={p.id} product={p} cover={covers.get(p.id)} index={i} />
						))}
					</ul>
				</div>
			))}
		</div>
	)
}
