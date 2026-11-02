export interface Budget {
	companyId: string
	period: number
	assigned: number
	redeemed: number
	committed: number
	available: number
}

export interface PriceReview {
	productId: string
	decision: 'approved' | 'adjusted' | 'rejected'
	finalPrice: number | null
	note: string | null
	createdAt: string
}

export interface Company {
	id: string
	code: string
	name: string
}
