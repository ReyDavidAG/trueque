import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useSetProductStatus } from '@/hooks/panel/usePanel'
import type { ProductStatus } from '@/types/productType'
import { motionMs } from '@/utils/reducedMotion'

const STATUS_TOAST: Partial<Record<ProductStatus, string>> = {
	paused: 'Pausado: ya no se ve en el mercado',
	live: 'De vuelta en el mercado',
	retired: 'Retirado. Los cupones ya emitidos siguen valiendo',
}

const CARRY_MS = 1500
const OPEN_MS = 1350

export type RowEffect = 'carry' | 'open' | null

interface ProductRowActionsProps {
	productId: string
	status: ProductStatus
	editable: boolean
	onEffect: (effect: RowEffect) => void
}

export function ProductRowActions({
	productId,
	status,
	editable,
	onEffect,
}: ProductRowActionsProps) {
	const setStatus = useSetProductStatus()
	const navigate = useNavigate()
	const [confirming, setConfirming] = useState(false)

	const changeStatus = (next: ProductStatus) =>
		setStatus.mutate(
			{ id: productId, status: next },
			{
				onSuccess: () => toast(STATUS_TOAST[next]),
				onError: e => {
					onEffect(null)
					toast.error(e.message)
				},
			}
		)
	const retire = () => {
		onEffect('carry')
		setTimeout(() => changeStatus('retired'), motionMs(CARRY_MS))
	}
	const edit = () => {
		onEffect('open')
		setTimeout(() => navigate(ROUTES.editProduct(productId)), motionMs(OPEN_MS))
	}

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
					onClick={retire}>
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
