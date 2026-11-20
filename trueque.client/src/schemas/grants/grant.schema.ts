import { z } from 'zod'

import type { StoreConfig } from '@/types/configType'
import { isoDay } from '@/utils/dates'

const whole = (msg: string) => z.string().trim().regex(/^\d+$/, msg)

export const GIFT_STEP_FIELDS = [
	['occasion', 'name', 'reason'],
	['scope', 'scopeId', 'list'],
	['amount', 'list'],
	['deliverOn', 'lotMonths'],
	[],
] as const

export type GrantLimits = Pick<
	StoreConfig,
	'grantMaxPerPerson' | 'grantMaxPerYear' | 'grantMaxList' | 'grantMaxDaysAhead'
>

const listItem = z.object({
	employeeNumber: z
		.string()
		.trim()
		.regex(/^\d{5,}$/, 'Número de trabajador: 5 dígitos o más.'),
	amount: whole('Yemas: un número entero.'),
	note: z
		.string()
		.trim()
		.min(10, 'Motivo de al menos 10 letras.')
		.max(200, 'Máximo 200 caracteres.'),
})

export const grantSchema = (limits: GrantLimits, ownNumber: string) =>
	z
		.object({
			occasion: z.string().min(1, 'Elige la ocasión.'),
			name: z
				.string()
				.trim()
				.min(4, 'Ponle un nombre de al menos 4 letras.')
				.max(80, 'Máximo 80 caracteres.'),
			reason: z
				.string()
				.trim()
				.min(20, 'Cuenta el motivo en al menos 20 letras.')
				.max(500, 'Máximo 500 caracteres.'),
			scope: z.enum(['group', 'company', 'area', 'department', 'list']),
			scopeId: z.string(),
			amount: z.string(),
			deliverOn: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige el día de entrega.'),
			lotMonths: whole('Meses: un número entero.').refine(
				v => Number(v) >= 1 && Number(v) <= 12,
				'Entre 1 y 12 meses.'
			),
			list: z.array(listItem),
		})
		.superRefine((v, ctx) => {
			const issue = (path: (string | number)[], message: string) =>
				ctx.addIssue({ code: 'custom', path, message })
			const max = limits.grantMaxPerPerson
			if (v.scope !== 'group' && v.scope !== 'list' && !v.scopeId)
				issue(['scopeId'], 'Elige a quién va.')
			if (v.scope === 'list') {
				if (!v.list.length) issue(['list'], 'Agrega al menos una persona.')
				if (v.list.length > limits.grantMaxList)
					issue(
						['list'],
						`Una lista tiene hasta ${limits.grantMaxList} personas.`
					)
				const seen = new Set<string>()
				v.list.forEach((item, i) => {
					const n = Number(item.amount)
					if (n < 1 || n > max)
						issue(['list', i, 'amount'], `De 1 a ${max} yemas.`)
					if (item.employeeNumber.trim() === ownNumber)
						issue(['list', i, 'employeeNumber'], 'No puedes incluirte.')
					if (seen.has(item.employeeNumber.trim()))
						issue(['list', i, 'employeeNumber'], 'Ya está en la lista.')
					seen.add(item.employeeNumber.trim())
				})
			} else {
				const n = Number(v.amount)
				if (!/^\d+$/.test(v.amount.trim()) || n < 1 || n > max)
					issue(['amount'], `De 1 a ${max} yemas por persona.`)
			}
			const last = isoDay(limits.grantMaxDaysAhead)
			if (v.deliverOn && (v.deliverOn < isoDay() || v.deliverOn > last))
				issue(
					['deliverOn'],
					`Entre hoy y dentro de ${limits.grantMaxDaysAhead} días.`
				)
		})

export type GrantForm = z.infer<ReturnType<typeof grantSchema>>
