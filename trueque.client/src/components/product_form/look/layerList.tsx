import { Art } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { ADDABLE_LAYERS } from '@/constants/lookEditor'
import type { Layer, LayerKind } from '@/utils/artRecipe'
import { cn } from '@/utils/cn'
import { layerLabel, layerThumb } from '@/utils/layerLabel'

interface LayerListProps {
	layers: Layer[]
	selected: number
	stall: string
	canAdd: boolean
	onSelect: (index: number) => void
	onAdd: (kind: LayerKind) => void
}

export function LayerList({
	layers,
	selected,
	stall,
	canAdd,
	onSelect,
	onAdd,
}: LayerListProps) {
	return (
		<div className='layers' role='listbox' aria-label='Capas'>
			{layers.map((l, i) => (
				<button
					key={`${i}${l.kind}${l.ref}`}
					type='button'
					role='option'
					aria-selected={i === selected}
					className={cn('layer', i === selected && 'is-active')}
					data-stall={stall}
					onClick={() => onSelect(i)}>
					<span className='layer__thumb'>
						<Art id={layerThumb(l)} />
					</span>
					<span className='layer__label'>{layerLabel(l)}</span>
				</button>
			))}
			{ADDABLE_LAYERS.map(([kind, label, icon]) => (
				<button
					key={kind}
					type='button'
					className='layer layer--add'
					disabled={!canAdd}
					onClick={() => onAdd(kind)}>
					<span className='layer__thumb'>
						<Icon name={icon} />
					</span>
					<span className='layer__label'>+ {label}</span>
				</button>
			))}
		</div>
	)
}
