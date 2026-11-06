import { ART } from '@/constants/art/artCatalog'
import { SHAPES } from '@/constants/art/artShapes'
import { CENTERED_LAYER } from '@/constants/lookEditor'

import { encodeDesign, type Layer } from './artRecipe'

const FIGURE_LABELS = new Map(ART.map(a => [a.id, a.label]))
const SHAPE_LABELS = new Map<string, string>(SHAPES.map(s => [s.id, s.label]))

export const layerLabel = (layer: Layer) =>
	layer.kind === 't'
		? `“${layer.ref}”`
		: layer.kind === 's'
			? (SHAPE_LABELS.get(layer.ref) ?? 'Forma')
			: (FIGURE_LABELS.get(layer.ref) ?? 'Figura')

export const layerThumb = (layer: Layer) =>
	encodeDesign([{ ...layer, ...CENTERED_LAYER }])
