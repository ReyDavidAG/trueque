import { LAYER_EDITS } from '@/constants/look_editor'
import type { FigureFilter } from '@/hooks/panel/use_figure_filter'
import type { LayerComposer as Composer } from '@/hooks/panel/use_layer_composer'
import { cn } from '@/utils/cn'

import { FigurePicker } from './figure_picker'
import { LayerActions } from './layer_actions'
import { LayerColors } from './layer_colors'
import { LayerList } from './layer_list'
import { LayerSize } from './layer_size'
import { LayerTextField } from './layer_text_field'
import { ShapePicker } from './shape_picker'

interface LayerComposerProps {
	composer: Composer
	figureFilter: FigureFilter
	stall: string
}

export function LayerComposer({ composer, figureFilter, stall }: LayerComposerProps) {
	const { layers, layer, at, edit, palette, canAdd, update } = composer
	const pick = (ref: string) => update({ ref, swaps: {} })

	return (
		<div className='composer'>
			<LayerList
				layers={layers}
				selected={at}
				stall={stall}
				canAdd={canAdd}
				onSelect={composer.select}
				onAdd={composer.add}
			/>
			<div className='composer__edit'>
				<div className='subtabs' role='tablist' aria-label='Editar capa'>
					{LAYER_EDITS.map(([id, label]) => (
						<button
							key={id}
							type='button'
							role='tab'
							aria-selected={edit === id}
							className={cn('subtab', edit === id && 'is-active')}
							onClick={() => composer.setEdit(id)}>
							{label}
						</button>
					))}
				</div>

				<div key={`${edit}${at}`} className='wizard__pane'>
					{edit === 'what' && layer.kind === 'f' && (
						<FigurePicker
							selectedRef={layer.ref}
							stall={stall}
							filter={figureFilter}
							onPick={pick}
						/>
					)}
					{edit === 'what' && layer.kind === 's' && (
						<ShapePicker selectedRef={layer.ref} stall={stall} onPick={pick} />
					)}
					{edit === 'what' && layer.kind === 't' && (
						<LayerTextField value={layer.ref} onChange={ref => update({ ref })} />
					)}
					{edit === 'colors' && (
						<LayerColors
							palette={palette}
							swaps={layer.swaps}
							onSwaps={swaps => update({ swaps })}
							onShuffle={composer.shuffle}
						/>
					)}
					{edit === 'size' && <LayerSize placement={layer} onChange={update} />}
				</div>

				<LayerActions
					isFront={at === layers.length - 1}
					isBack={at === 0}
					canAdd={canAdd}
					canRemove={layers.length > 1}
					onShift={composer.shift}
					onDuplicate={composer.duplicate}
					onRemove={composer.remove}
				/>
			</div>
		</div>
	)
}
