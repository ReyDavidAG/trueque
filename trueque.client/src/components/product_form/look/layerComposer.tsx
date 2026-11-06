import { LAYER_EDITS } from '@/constants/lookEditor'
import type { FigureFilter } from '@/hooks/panel/useFigureFilter'
import type { LayerComposer as Composer } from '@/hooks/panel/useLayerComposer'
import { cn } from '@/utils/cn'

import { FigurePicker } from './figurePicker'
import { LayerActions } from './layerActions'
import { LayerColors } from './layerColors'
import { LayerList } from './layerList'
import { LayerSize } from './layerSize'
import { LayerTextField } from './layerTextField'
import { ShapePicker } from './shapePicker'

interface LayerComposerProps {
	composer: Composer
	figureFilter: FigureFilter
	stall: string
}

export function LayerComposer({
	composer,
	figureFilter,
	stall,
}: LayerComposerProps) {
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
						<LayerTextField
							value={layer.ref}
							onChange={ref => update({ ref })}
						/>
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
