import { z } from 'zod'

const whole = (msg: string) => z.string().trim().regex(/^\d+$/, msg)

export const valueSchema = z.object({
	cacaoValue: z
		.string()
		.trim()
		.regex(/^\d+(\.\d{1,2})?$/, 'Un número con hasta dos decimales.')
		.refine(v => Number(v) > 0, 'Debe ser mayor a cero.'),
})
export type ValueForm = z.infer<typeof valueSchema>

export const expirySchema = z.object({
	lotMonths: whole('Sólo números enteros.').refine(
		v => Number(v) >= 1 && Number(v) <= 60,
		'Entre 1 y 60 meses.'
	),
	refundOnExpiry: z.boolean(),
})
export type ExpiryForm = z.infer<typeof expirySchema>

export const rulesSchema = z.object({
	rules: z.array(
		z.object({
			code: z.string(),
			cacaos: whole('Cacaos: entero desde 0.'),
			monthlyCap: z.union([
				z.literal(''),
				whole('Tope: entero mayor a 0 o vacío.').refine(
					v => Number(v) > 0,
					'Tope: mayor a 0 o vacío.'
				),
			]),
			isActive: z.boolean(),
		})
	),
})
export type RulesForm = z.infer<typeof rulesSchema>

const categoryName = z
	.string()
	.trim()
	.min(2, 'De 2 a 40 letras.')
	.max(40, 'De 2 a 40 letras.')
const priceMin = whole('Entero mayor a 0.').refine(
	v => Number(v) > 0,
	'Entero mayor a 0.'
)
const priceMax = whole('Entero mayor a 0.')
const rangeOk = (c: { min: string; max: string }) =>
	Number(c.max) >= Number(c.min)
const RANGE_ISSUE = {
	path: ['max'],
	message: 'Debe ser mayor o igual al mínimo.',
}

export const categoriesSchema = z.object({
	categories: z.array(
		z
			.object({
				code: z.string(),
				name: categoryName,
				min: priceMin,
				max: priceMax,
				isActive: z.boolean(),
				selfService: z.boolean(),
			})
			.refine(rangeOk, RANGE_ISSUE)
	),
})
export type CategoriesForm = z.infer<typeof categoriesSchema>

export const newCategorySchema = z
	.object({
		code: z
			.string()
			.trim()
			.regex(
				/^[a-z_]{2,30}$/,
				'De 2 a 30 letras minúsculas sin acentos o guion bajo. No se cambia después.'
			),
		name: categoryName,
		min: priceMin,
		max: priceMax,
		description: z.string().trim().max(160, 'Máximo 160 caracteres.'),
		selfService: z.boolean(),
		art: z.string(),
	})
	.refine(rangeOk, RANGE_ISSUE)
export type NewCategoryForm = z.infer<typeof newCategorySchema>

const limit = (min: number, max: number) =>
	whole('Sólo números enteros.').refine(
		v => Number(v) >= min && Number(v) <= max,
		`Entre ${min} y ${max}.`
	)

export const grantLimitsSchema = z.object({
	grantMaxPerPerson: limit(1, 1000),
	grantMaxPerYear: limit(1, 5000),
	grantMaxList: limit(1, 500),
	grantMaxDaysAhead: limit(0, 365),
})
export type GrantLimitsForm = z.infer<typeof grantLimitsSchema>

export const budgetsSchema = z.object({
	budgets: z.array(
		z
			.object({
				companyId: z.string(),
				used: z.number(),
				assigned: whole('En pesos enteros.'),
			})
			.refine(b => Number(b.assigned) >= b.used, {
				path: ['assigned'],
				message: 'No puede ser menor a lo ya usado.',
			})
	),
})
export type BudgetsForm = z.infer<typeof budgetsSchema>

export const locationSchema = z.object({
	companyId: z.string().min(1, 'Elige la empresa.'),
	name: z
		.string()
		.trim()
		.min(3, 'Escribe el nombre del lugar.')
		.max(80, 'Máximo 80 caracteres.'),
	address: z.string().trim().max(90, 'Máximo 90 caracteres.'),
	reference: z.string().trim().max(90, 'Máximo 90 caracteres.'),
})
export type LocationForm = z.infer<typeof locationSchema>
