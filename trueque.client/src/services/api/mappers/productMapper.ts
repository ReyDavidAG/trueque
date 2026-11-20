import type {
	Category,
	CategoryInfo,
	CategoryPatch,
	ExchangeLocation,
	Product,
	ProductInput,
	ProductStatus,
} from '@/types/productType'

export type ProductRow = {
	id: string
	folio: string
	company_id: string
	category_code: Category
	kind: Product['kind']
	name: string
	blurb: string
	detail: string | null
	includes: string[] | null
	art: string | null
	stall: Product['stall']
	price: number
	cost: number | string
	stock: number | null
	stock_left: number | null
	coupon_days: number
	swaps: number
	location_id: string | null
	available_from: string | null
	available_until: string | null
	status: ProductStatus
	origin: Product['origin']
	origin_ref: string | null
	has_images: boolean
	review_note: string | null
}

export type LocationRow = {
	id: string
	company_id: string
	name: string
	address: string | null
	reference: string | null
	attendant_id: string | null
}

export type CategoryRow = {
	code: Category
	name: string
	price_min: number
	price_max: number
	position: number
	description: string | null
	is_active: boolean
	self_service: boolean
	art: string | null
}

const defaultArt = (origin: Product['origin']) =>
	origin === 'custodia' ? 'laptop' : 'ticket'

export const toProduct = (row: ProductRow): Product => ({
	id: row.id,
	folio: row.folio,
	companyId: row.company_id,
	category: row.category_code,
	kind: row.kind,
	name: row.name,
	blurb: row.blurb,
	detail: row.detail,
	includes: row.includes ?? [],
	art: row.art ?? defaultArt(row.origin),
	stall: row.stall,
	price: row.price,
	cost: Number(row.cost),
	stock: row.stock,
	stockLeft: row.stock_left,
	couponDays: row.coupon_days,
	swaps: row.swaps,
	locationId: row.location_id,
	availableFrom: row.available_from,
	availableUntil: row.available_until,
	status: row.status,
	origin: row.origin,
	originRef: row.origin_ref,
	hasImages: row.has_images,
	reviewNote: row.review_note,
})

export const toProductRow = (input: ProductInput) => ({
	company_id: input.companyId,
	category_code: input.category,
	kind: input.kind,
	name: input.name,
	blurb: input.blurb,
	detail: input.detail || null,
	includes: input.includes,
	art: input.art,
	stall: input.stall,
	cost: input.cost,
	price: input.price,
	stock: input.stock,
	swaps: input.swaps,
	coupon_days: input.couponDays,
	available_from: input.availableFrom,
	available_until: input.availableUntil,
	location_id: input.locationId,
})

export const toLocation = (
	row: LocationRow,
	attendantNames: Map<string, string>
): ExchangeLocation => ({
	id: row.id,
	companyId: row.company_id,
	name: row.name,
	address: row.address,
	reference: row.reference,
	attendantId: row.attendant_id,
	attendantName: row.attendant_id
		? (attendantNames.get(row.attendant_id) ?? null)
		: null,
})

export const toCategory = (row: CategoryRow): CategoryInfo => ({
	code: row.code,
	name: row.name,
	priceMin: row.price_min,
	priceMax: row.price_max,
	position: row.position,
	description: row.description,
	isActive: row.is_active,
	selfService: row.self_service,
	art: row.art,
})

export const toCategoryRow = (input: CategoryPatch) => {
	const row: Record<string, unknown> = {}
	if (input.name !== undefined) row.name = input.name
	if (input.priceMin !== undefined) row.price_min = input.priceMin
	if (input.priceMax !== undefined) row.price_max = input.priceMax
	if (input.position !== undefined) row.position = input.position
	if (input.description !== undefined) row.description = input.description
	if (input.selfService !== undefined) row.self_service = input.selfService
	if (input.art !== undefined) row.art = input.art
	if (input.isActive !== undefined) row.is_active = input.isActive
	return row
}
