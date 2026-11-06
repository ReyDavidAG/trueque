import { Icon } from '@/components/ui/icon'

interface LayerActionsProps {
	isFront: boolean
	isBack: boolean
	canAdd: boolean
	canRemove: boolean
	onShift: (direction: -1 | 1) => void
	onDuplicate: () => void
	onRemove: () => void
}

export function LayerActions({
	isFront,
	isBack,
	canAdd,
	canRemove,
	onShift,
	onDuplicate,
	onRemove,
}: LayerActionsProps) {
	return (
		<div className='layer-actions'>
			<button
				type='button'
				className='btn btn--ghost btn--sm'
				disabled={isFront}
				onClick={() => onShift(1)}>
				Al frente
			</button>
			<button
				type='button'
				className='btn btn--ghost btn--sm'
				disabled={isBack}
				onClick={() => onShift(-1)}>
				Atrás
			</button>
			<button
				type='button'
				className='btn btn--ghost btn--sm'
				disabled={!canAdd}
				onClick={onDuplicate}>
				Duplicar
			</button>
			<button
				type='button'
				className='btn btn--ghost btn--sm'
				disabled={!canRemove}
				onClick={onRemove}>
				<Icon name='trash' />
				Quitar capa
			</button>
		</div>
	)
}
