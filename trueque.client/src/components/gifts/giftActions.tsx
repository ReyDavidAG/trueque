import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import {
	useCancelGrant,
	useDecideGrant,
	useSubmitGrant,
} from '@/hooks/grants/useGrantActions'
import type { Grant } from '@/types/grantType'
import { cn } from '@/utils/cn'

interface Props {
	grant: Grant
	isHr: boolean
	canApprove: boolean
	personId: string
	inList: boolean
}

const MIN_NOTE = 10

export function GiftActions({
	grant,
	isHr,
	canApprove,
	personId,
	inList,
}: Props) {
	const submit = useSubmitGrant()
	const decide = useDecideGrant()
	const cancel = useCancelGrant()
	const [note, setNote] = useState('')
	const [error, setError] = useState<string | null>(null)
	const busy = submit.isPending || decide.isPending || cancel.isPending
	const s = grant.status
	const canDecide =
		canApprove && s === 'pending' && grant.createdBy !== personId && !inList
	const canEdit = isHr && (s === 'draft' || s === 'rejected')
	const canCancel =
		isHr && ['draft', 'rejected', 'pending', 'scheduled'].includes(s)
	const needsNote = s === 'pending' || s === 'scheduled'
	if (!canDecide && !canEdit && !canCancel) return null

	const fail = (e: Error) => {
		setError(e.message)
		toast.error(e.message)
	}
	const withNote = (run: (n: string) => void) => () => {
		const n = note.trim()
		if (n.length < MIN_NOTE) {
			setError(`Escribe el motivo (al menos ${MIN_NOTE} letras).`)
			return
		}
		setError(null)
		run(n)
	}

	return (
		<section className='form-card gift-actions' aria-label='Acciones'>
			{(canDecide || (canCancel && needsNote)) && (
				<div className='field'>
					<label htmlFor='g-note'>Motivo</label>
					<textarea
						id='g-note'
						className={cn('input input--area', error && 'animate-nudge')}
						rows={2}
						maxLength={500}
						value={note}
						aria-invalid={Boolean(error)}
						aria-describedby='g-note-help'
						onChange={e => setNote(e.target.value)}
					/>
					<p
						className={cn('field__help', error && 'is-error')}
						id='g-note-help'>
						{error ??
							'Para rechazar o cancelar algo en curso. Queda en la bitácora.'}
					</p>
				</div>
			)}
			<div className='form-card__actions'>
				{canCancel && (
					<button
						type='button'
						className='btn btn--ghost'
						disabled={busy}
						onClick={
							needsNote
								? withNote(n =>
										cancel.mutate(
											{ id: grant.id, note: n },
											{
												onSuccess: () => toast.success('Regalo cancelado'),
												onError: fail,
											}
										)
									)
								: () =>
										cancel.mutate(
											{ id: grant.id, note: null },
											{
												onSuccess: () => toast.success('Regalo cancelado'),
												onError: fail,
											}
										)
						}>
						<Icon name='x' />
						Cancelar regalo
					</button>
				)}
				{canEdit && (
					<Link className='btn btn--ghost' to={ROUTES.editGift(grant.id)}>
						<Icon name='edit' />
						{s === 'rejected' ? 'Corregir' : 'Editar'}
					</Link>
				)}
				{isHr && s === 'draft' && (
					<button
						type='button'
						className='btn btn--grana'
						disabled={busy}
						onClick={() =>
							submit.mutate(grant.id, {
								onSuccess: () => toast.success('Mandado a autorizar'),
								onError: fail,
							})
						}>
						<Icon name='shield' />
						Mandar a autorizar
					</button>
				)}
				{canDecide && (
					<>
						<button
							type='button'
							className='btn btn--ghost'
							disabled={busy}
							onClick={withNote(n =>
								decide.mutate(
									{ id: grant.id, approve: false, note: n },
									{
										onSuccess: () => toast.success('Regalo rechazado'),
										onError: fail,
									}
								)
							)}>
							Rechazar
						</button>
						<button
							type='button'
							className='btn btn--grana'
							disabled={busy}
							onClick={() =>
								decide.mutate(
									{ id: grant.id, approve: true, note: note.trim() || null },
									{
										onSuccess: r =>
											toast.success(
												r === 'delivered'
													? 'Autorizado y entregado'
													: 'Autorizado y programado'
											),
										onError: fail,
									}
								)
							}>
							<Icon name='check' />
							Autorizar
						</button>
					</>
				)}
			</div>
		</section>
	)
}
