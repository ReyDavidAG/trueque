import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
	DUPLICATE_OFFSET,
	type LayerEdit,
	NEW_LAYER_REF,
	NEW_LAYER_SPREAD,
	NEW_SHAPE_SCALE,
} from '@/constants/lookEditor'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import { layerDrawing } from '@/utils/artDrawing'
import {
	ART_COLORS,
	colorsIn,
	decodeDesign,
	encodeDesign,
	type Layer,
	type LayerKind,
	MAX_LAYERS,
	newLayer,
	TEXT_COLOR,
} from '@/utils/artRecipe'

const pickOne = <T>(list: readonly T[]) =>
	list[Math.floor(Math.random() * list.length)]

export function useLayerComposer() {
	const { control, setValue } = useFormContext<ProductForm>()
	const code = useWatch({ control, name: 'art' }) ?? 'ticket'
	const [selected, setSelected] = useState(0)
	const [edit, setEdit] = useState<LayerEdit>('what')

	const layers = decodeDesign(code)
	const at = Math.min(selected, layers.length - 1)
	const layer = layers[at]
	const canAdd = layers.length < MAX_LAYERS
	const palette =
		layer.kind === 't'
			? [TEXT_COLOR]
			: colorsIn(layerDrawing({ ...layer, swaps: {} }))

	const save = (next: Layer[]) =>
		setValue('art', encodeDesign(next), {
			shouldDirty: true,
			shouldValidate: true,
		})
	const update = (patch: Partial<Layer>) =>
		save(layers.map((l, i) => (i === at ? { ...l, ...patch } : l)))

	const add = (kind: LayerKind) => {
		if (!canAdd) return
		const base = newLayer(kind, NEW_LAYER_REF[kind])
		const next = [
			...layers,
			{
				...base,
				x: base.x + (layers.length % 3) * NEW_LAYER_SPREAD - NEW_LAYER_SPREAD,
				s: kind === 'f' ? base.s : NEW_SHAPE_SCALE,
			},
		]
		save(next)
		setSelected(next.length - 1)
		setEdit('what')
	}

	const remove = () => {
		if (layers.length < 2) return
		save(layers.filter((_, i) => i !== at))
		setSelected(Math.max(0, at - 1))
	}

	const duplicate = () => {
		if (!canAdd) return
		const copy = {
			...layer,
			x: layer.x + DUPLICATE_OFFSET.x,
			y: layer.y + DUPLICATE_OFFSET.y,
		}
		save([...layers.slice(0, at + 1), copy, ...layers.slice(at + 1)])
		setSelected(at + 1)
	}

	const shift = (direction: -1 | 1) => {
		const to = at + direction
		if (to < 0 || to >= layers.length) return
		const next = [...layers]
		;[next[at], next[to]] = [next[to], next[at]]
		save(next)
		setSelected(to)
	}

	const shuffle = () =>
		update({
			swaps: Object.fromEntries(palette.map(c => [c, pickOne(ART_COLORS)[0]])),
		})

	return {
		code,
		layers,
		at,
		layer,
		palette,
		canAdd,
		edit,
		setEdit,
		select: setSelected,
		update,
		add,
		remove,
		duplicate,
		shift,
		shuffle,
	}
}

export type LayerComposer = ReturnType<typeof useLayerComposer>
