import { z } from 'zod'

export const redeemCouponSchema = z.object({
	code: z
		.string()
		.trim()
		.toUpperCase()
		.regex(
			/^CAC-[A-Z0-9]{6,12}$/,
			'El código empieza con CAC- y trae letras y números.'
		),
	locationId: z.string(),
})

export type RedeemCouponForm = z.infer<typeof redeemCouponSchema>
