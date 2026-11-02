import { z } from 'zod'

const whole = (msg: string) => z.string().trim().regex(/^\d+$/, msg)

export const publishProductSchema = z.object({
	name: z
		.string()
		.trim()
		.min(4, 'Escribe un nombre de al menos 4 letras.')
		.max(80, 'Máximo 80 caracteres.'),
	blurb: z
		.string()
		.trim()
		.min(4, 'Cuenta en una frase qué es.')
		.max(140, 'Máximo 140 caracteres.'),
	detail: z.string().trim().max(600, 'Máximo 600 caracteres.'),
	kind: z.enum(['service', 'item']),
	art: z.enum([
		'plate',
		'thermos',
		'apple',
		'chat',
		'glasses',
		'wrench',
		'diploma',
		'laptop',
		'cap',
	]),
	price: whole('Pon el precio en cacaos, sólo números.').refine(
		v => Number(v) > 0,
		'El precio va de 1 cacao en adelante.'
	),
	stock: z.union([
		z.literal(''),
		whole('Sólo números, o vacío si no tiene límite.'),
	]),
	couponDays: z.enum(['15', '30', '60', '90']),
	locationId: z.string().min(1, 'Elige dónde se canjea.'),
})

export type PublishProductForm = z.infer<typeof publishProductSchema>
