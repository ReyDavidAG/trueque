import type { IconName } from '@/components/ui/icon'
import type { LayerKind } from '@/utils/art_recipe'

export const LOOK_TABS = [
	['stall', 'Tienda', 'store'],
	['design', 'Diseño', 'spark'],
	['photos', 'Fotos', 'eye'],
] as const
export type LookTab = (typeof LOOK_TABS)[number][0]

export const LAYER_EDITS = [
	['what', 'Qué es'],
	['colors', 'Colores'],
	['size', 'Tamaño y lugar'],
] as const
export type LayerEdit = (typeof LAYER_EDITS)[number][0]

export const ADDABLE_LAYERS: [LayerKind, string, IconName][] = [
	['f', 'Figura', 'box'],
	['s', 'Forma', 'plus'],
	['t', 'Texto', 'edit'],
]

export const NEW_LAYER_REF: Record<LayerKind, string> = {
	f: 'ticket',
	s: 'star',
	t: 'Nuevo',
}

export const ART_WIDTH = 240
export const ART_HEIGHT = 180
export const CENTERED_LAYER = { x: 120, y: 90, s: 100, r: 0, flip: false }
export const NEW_LAYER_SPREAD = 18
export const NEW_SHAPE_SCALE = 70
export const DUPLICATE_OFFSET = { x: 16, y: -10 }
export const MAX_STAGGER = 16
export const ALL_FIGURES = { id: 'all', label: 'Todas' }

export type KnobKey = 's' | 'x' | 'y' | 'r'

export const SIZE_KNOBS: { label: string; key: KnobKey; min: number; max: number; unit: string }[] = [
	{ label: 'Tamaño', key: 's', min: 20, max: 220, unit: '%' },
	{ label: 'Giro', key: 'r', min: -180, max: 180, unit: '°' },
	{ label: 'Horizontal', key: 'x', min: 0, max: ART_WIDTH, unit: '' },
	{ label: 'Vertical', key: 'y', min: 0, max: ART_HEIGHT, unit: '' },
]
