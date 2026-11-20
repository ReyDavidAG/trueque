import { z } from 'zod'

export const redeemCouponSchema = z.object({
	code: z
		.string()
		.trim()
		.toUpperCase()
		.regex(
			/^[A-Z]{2,5}-[A-Z0-9]{4,12}$/,
			'Ese no parece un código: letras, un guion y luego letras y números (YEM-…).'
		),
})

export type RedeemCouponForm = z.infer<typeof redeemCouponSchema>
