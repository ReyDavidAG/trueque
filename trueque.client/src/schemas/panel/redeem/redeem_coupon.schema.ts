import { z } from 'zod'

export const redeemCouponSchema = z.object({
	code: z
		.string()
		.trim()
		.toUpperCase()
		.regex(
			/^CAC-[A-Z0-9]{4,12}$/,
			'Ese no parece un código: empieza con CAC- seguido de letras y números.'
		),
})

export type RedeemCouponForm = z.infer<typeof redeemCouponSchema>
