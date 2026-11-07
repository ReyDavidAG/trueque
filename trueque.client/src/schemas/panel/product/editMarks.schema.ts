import { z } from 'zod'

export const EDIT_FIELDS = [
	'name',
	'blurb',
	'price',
	'look',
	'lede',
	'includes',
	'location',
	'couponDays',
	'swaps',
] as const

export const EDIT_SCOPES = ['market', 'detail', 'stall'] as const

export const editMarksSchema = z.object({
	fields: z.array(z.enum(EDIT_FIELDS)),
	pending: z.array(z.enum(EDIT_SCOPES)),
})

export type EditMarks = z.infer<typeof editMarksSchema>
export type EditField = (typeof EDIT_FIELDS)[number]
export type EditScope = (typeof EDIT_SCOPES)[number]
