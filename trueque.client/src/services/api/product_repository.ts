import type {
	Category,
	CategoryInfo,
	ExchangeLocation,
	NewProduct,
	Product,
	ProductStatus,
} from '@/types/product_type'

import { toMessage, trueque } from '../supabase/supabase_client'

export interface ProductRepository {
	list(): Promise<Product[]>
	locations(): Promise<ExchangeLocation[]>
	categories(): Promise<CategoryInfo[]>
	create(input: NewProduct, personId: string): Promise<void>
	setStatus(id: string, status: ProductStatus): Promise<void>
}

interface ProductRow {
	id: string
	folio: string
	company_id: string
	category_code: Category
	kind: Product['kind']
	name: string
	blurb: string
	detail: string | null
	art: string | null
	price: number
	stock: number | null
	stock_left: number | null
	coupon_days: number
	swaps: number
	location_id: string | null
	status: ProductStatus
	origin: Product['origin']
	origin_ref: string | null
}

const toProduct = (r: ProductRow): Product => ({
	id: r.id,
	folio: r.folio,
	companyId: r.company_id,
	category: r.category_code,
	kind: r.kind,
	name: r.name,
	blurb: r.blurb,
	detail: r.detail,
	art: r.art ?? (r.origin === 'custodia' ? 'laptop' : 'cap'),
	price: r.price,
	stock: r.stock,
	stockLeft: r.stock_left,
	couponDays: r.coupon_days,
	swaps: r.swaps,
	locationId: r.location_id,
	status: r.status,
	origin: r.origin,
	originRef: r.origin_ref,
})

export const productRepository: ProductRepository = {
	async list() {
		const { data, error } = await trueque
			.from('product_cards')
			.select('*')
			.order('price')
			.returns<ProductRow[]>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(toProduct)
	},

	async locations() {
		const { data, error } = await trueque
			.from('exchange_locations')
			.select('id, company_id, name, reference')
			.eq('is_active', true)
			.order('name')
			.returns<
				{
					id: string
					company_id: string
					name: string
					reference: string | null
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(l => ({
			id: l.id,
			companyId: l.company_id,
			name: l.name,
			reference: l.reference,
		}))
	},

	async categories() {
		const { data, error } = await trueque
			.from('categories')
			.select('code, name, price_min, price_max')
			.order('position')
			.returns<
				{ code: Category; name: string; price_min: number; price_max: number }[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(c => ({
			code: c.code,
			name: c.name,
			priceMin: c.price_min,
			priceMax: c.price_max,
		}))
	},

	async create(input, personId) {
		const { error } = await trueque.from('products').insert({
			company_id: input.companyId,
			category_code: input.category,
			kind: input.kind,
			name: input.name,
			blurb: input.blurb,
			detail: input.detail || null,
			art: input.art,
			price: input.price,
			stock: input.stock,
			coupon_days: input.couponDays,
			location_id: input.locationId,
			status: 'pending',
			created_by: personId,
		})
		if (error) throw new Error(toMessage(error))
	},

	async setStatus(id, status) {
		const { error } = await trueque
			.from('products')
			.update({ status })
			.eq('id', id)
		if (error) throw new Error(toMessage(error))
	},
}
