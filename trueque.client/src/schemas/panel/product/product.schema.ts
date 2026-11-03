import { z } from 'zod'

import { ART_IDS } from '@/constants/art/art_catalog'
import type { CategoryInfo } from '@/types/product_type'

const whole = (msg: string) => z.string().trim().regex(/^\d+$/, msg)
const money = z
	.string()
	.trim()
	.regex(/^\d+(\.\d{1,2})?$/, 'Pon el costo en pesos, sólo números.')
	.refine(v => Number(v) > 0, 'El costo debe ser mayor a cero.')

export const STEP_FIELDS = [
	['name', 'blurb', 'kind', 'category', 'includes', 'detail'],
	['art', 'stall'],
	['cost', 'price'],
	[
		'stock',
		'swaps',
		'couponDays',
		'availableFrom',
		'availableUntil',
		'locationId',
	],
	[],
] as const

export const productSchema = (categories: CategoryInfo[]) =>
	z
		.object({
			name: z
				.string()
				.trim()
				.min(4, 'Escribe un nombre de al menos 4 letras.')
				.max(80, 'Máximo 80 caracteres.'),
			blurb: z
				.string()
				.trim()
				.min(4, 'Cuéntalo en una frase de al menos 4 letras.')
				.max(140, 'Máximo 140 caracteres.'),
			detail: z.string().trim().max(600, 'Máximo 600 caracteres.'),
			includes: z
				.string()
				.refine(
					v => v.split('\n').filter(x => x.trim()).length <= 8,
					'Hasta 8 renglones.'
				),
			kind: z.enum(['service', 'item']),
			category: z.enum(['service', 'item', 'custodia']),
			art: z
				.string()
				.refine(v => ART_IDS.includes(v), 'Elige una ilustración.'),
			stall: z.enum(['grana', 'anil', 'nopal', 'achiote', 'maiz', 'cacao']),
			cost: money,
			price: whole('Pon un precio en cacaos, sólo números enteros.'),
			stock: z.union([
				z.literal(''),
				whole('Existencias: un número entero o vacío.'),
			]),
			swaps: whole('Usos: un número entero.').refine(
				v => Number(v) >= 1,
				'Al menos 1 uso.'
			),
			couponDays: z.enum(['15', '30', '60', '90']),
			availableFrom: z.string(),
			availableUntil: z.string(),
			locationId: z.string().min(1, 'Elige dónde se canjea.'),
		})
		.superRefine((v, ctx) => {
			const cat = categories.find(c => c.code === v.category)
			const price = Number(v.price)
			if (cat && (price < cat.priceMin || price > cat.priceMax))
				ctx.addIssue({
					code: 'custom',
					path: ['price'],
					message: `Debe quedar entre ${cat.priceMin} y ${cat.priceMax} cacaos.`,
				})
			if (
				v.availableFrom &&
				v.availableUntil &&
				v.availableUntil < v.availableFrom
			)
				ctx.addIssue({
					code: 'custom',
					path: ['availableUntil'],
					message: 'La fecha final debe ser después de la inicial.',
				})
		})

export type ProductForm = z.infer<ReturnType<typeof productSchema>>
