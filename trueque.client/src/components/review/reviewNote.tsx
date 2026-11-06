import { cn } from '@/utils/cn'

interface Props {
	id: string
	rejecting: boolean
	note: string
	error: string | null
	busy: boolean
	onNote: (v: string) => void
	onReject: () => void
	onCancel: () => void
}

export function ReviewNote({
	id,
	rejecting,
	note,
	error,
	busy,
	onNote,
	onReject,
	onCancel,
}: Props) {
	return (
		<div className='decision animate-panel-in'>
			<div className='field'>
				<label htmlFor={`note-${id}`}>
					{rejecting ? 'Por qué lo rechazas' : 'Por qué ajustas el precio'}
				</label>
				<textarea
					id={`note-${id}`}
					className={cn('input input--area', error && 'animate-nudge')}
					rows={2}
					maxLength={200}
					placeholder={
						rejecting
							? 'Ej. No es un beneficio para el personal.'
							: 'Ej. Igualamos al precio de productos parecidos.'
					}
					aria-invalid={Boolean(error)}
					aria-describedby={`note-${id}-help`}
					value={note}
					onChange={e => onNote(e.target.value)}
				/>
				<p
					className={cn('field__help', error && 'is-error')}
					id={`note-${id}-help`}>
					{error ?? 'Lo ve quien lo publicó. Al menos 10 letras.'}
				</p>
			</div>
			{rejecting && (
				<div className='approval__actions'>
					<button
						className='btn btn--sm'
						type='button'
						disabled={busy}
						onClick={onReject}>
						Rechazar producto
					</button>
					<button
						className='btn btn--ghost btn--sm'
						type='button'
						onClick={onCancel}>
						Cancelar
					</button>
				</div>
			)}
		</div>
	)
}
