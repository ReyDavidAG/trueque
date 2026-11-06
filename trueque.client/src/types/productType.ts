export type ProductStatus =
	| 'draft'
	| 'pending'
	| 'live'
	| 'paused'
	| 'rejected'
	| 'retired'
export type ProductKind = 'service' | 'item'
export type Category = 'service' | 'item' | 'custodia'
export type Stall = 'grana' | 'anil' | 'nopal' | 'achiote' | 'maiz' | 'cacao'

export interface Product {
	id: string
	folio: string
	companyId: string
	category: Category
	kind: ProductKind
	name: string
	blurb: string
	detail: string | null
	includes: string[]
	art: string
	stall: Stall
	price: number
	cost: number
	stock: number | null
	stockLeft: number | null
	couponDays: number
	swaps: number
	locationId: string | null
	availableFrom: string | null
	availableUntil: string | null
	status: ProductStatus
	origin: 'manual' | 'custodia'
	originRef: string | null
	hasImages: boolean
	reviewNote: string | null
}

export interface ExchangeLocation {
	id: string
	companyId: string
	name: string
	address: string | null
	reference: string | null
	attendantId: string | null
	attendantName: string | null
}

export interface CategoryInfo {
	code: Category
	name: string
	priceMin: number
	priceMax: number
}

export interface ProductInput {
	id: string | null
	companyId: string
	art: string
	stall: Stall
	category: Category
	kind: ProductKind
	name: string
	blurb: string
	detail: string
	includes: string[]
	cost: number
	price: number
	stock: number | null
	swaps: number
	couponDays: number
	availableFrom: string | null
	availableUntil: string | null
	locationId: string
}

export interface ProductImage {
	position: number
	data: string
	bytes: number
}
