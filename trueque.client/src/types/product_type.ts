export type ProductStatus =
	| 'draft'
	| 'pending'
	| 'live'
	| 'paused'
	| 'rejected'
	| 'retired'
export type ProductKind = 'service' | 'item'
export type Category = 'service' | 'item' | 'custodia'

export interface Product {
	id: string
	folio: string
	companyId: string
	category: Category
	kind: ProductKind
	name: string
	blurb: string
	detail: string | null
	art: string
	price: number
	stock: number | null
	stockLeft: number | null
	couponDays: number
	swaps: number
	locationId: string | null
	status: ProductStatus
	origin: 'manual' | 'custodia'
	originRef: string | null
}

export interface ExchangeLocation {
	id: string
	companyId: string
	name: string
	reference: string | null
}

export interface CategoryInfo {
	code: Category
	name: string
	priceMin: number
	priceMax: number
}

export interface NewProduct {
	companyId: string
	art: string
	category: Category
	kind: ProductKind
	name: string
	blurb: string
	detail: string
	price: number
	stock: number | null
	couponDays: number
	locationId: string
}
