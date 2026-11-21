import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useSetProductStatus } from '@/hooks/panel/usePanel'
import type { ProductStatus } from '@/types/productType'

const STATUS_TOAST: Partial<Record<ProductStatus, string>> = {
	paused: 'Pausado: ya no se ve en la despensa',
	live: 'De vuelta en la despensa',
	retired: 'Retirado. Los cupones ya emitidos siguen valiendo',
}

interface ProductRowActionsProps {
	productId: string
	status: ProductStatus
	editable: boolean
}

export function ProductRowActions({
	productId,
	status,
	editable,
}: ProductRowActionsProps) {
	const setStatus = useSetProductStatus()
	const [confirming, setConfirming] = useState(false)

	const changeStatus = (next: ProductStatus) =>
		setStatus.mutate(
			{ id: productId, status: next },
			{
				onSuccess: () => toast(STATUS_TOAST[next]),
				onError: e => toast.error(e.message),
			}
		)

	if (confirming)
		return (
			<span className='row__confirm' role='group' aria-label='Confirmar retiro'>
				¿Retirarlo de la despensa?
				<button
					className='btn btn--sm btn--grana'
					type='button'
					disabled={setStatus.isPending}
					onClick={() => changeStatus('retired')}>
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
					to={ROUTES.editProduct(productId)}>
					<Icon name='edit' />
					<span>Editar</span>
				</Link>
			)}
			{status === 'live' && (
				<button
					className='btn btn--sm btn--ghost'
					type='button'
					disabled={setStatus.isPending}
					onClick={() => changeStatus('paused')}>
					<Icon name='pause' />
					<span>Pausar</span>
				</button>
			)}
			{status === 'paused' && (
				<button
					className='btn btn--sm btn--ghost'
					type='button'
					disabled={setStatus.isPending}
					onClick={() => changeStatus('live')}>
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
