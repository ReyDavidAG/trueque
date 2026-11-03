import type {
	Category,
	CategoryInfo,
	ExchangeLocation,
	Product,
	ProductImage,
	ProductInput,
	ProductStatus,
} from '@/types/product_type'

import { supabase, toMessage, trueque } from '../supabase/supabase_client'

export interface ProductRepository {
	list(): Promise<Product[]>
	locations(): Promise<ExchangeLocation[]>
	categories(): Promise<CategoryInfo[]>
	save(input: ProductInput, personId: string): Promise<string>
	setStatus(id: string, status: ProductStatus): Promise<void>
	images(id: string): Promise<ProductImage[]>
	covers(ids: string[]): Promise<Map<string, string>>
	setImages(id: string, images: ProductImage[]): Promise<void>
}

type ProductRow = {
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

const toProduct = (r: ProductRow): Product => ({
	id: r.id,
	folio: r.folio,
	companyId: r.company_id,
	category: r.category_code,
	kind: r.kind,
	name: r.name,
	blurb: r.blurb,
	detail: r.detail,
	includes: r.includes ?? [],
	art: r.art ?? (r.origin === 'custodia' ? 'laptop' : 'ticket'),
	stall: r.stall,
	price: r.price,
	cost: Number(r.cost),
	stock: r.stock,
	stockLeft: r.stock_left,
	couponDays: r.coupon_days,
	swaps: r.swaps,
	locationId: r.location_id,
	availableFrom: r.available_from,
	availableUntil: r.available_until,
	status: r.status,
	origin: r.origin,
	originRef: r.origin_ref,
	hasImages: r.has_images,
	reviewNote: r.review_note,
})

type LocationRow = {
	id: string
	company_id: string
	name: string
	address: string | null
	reference: string | null
	attendant_id: string | null
}

const toRow = (input: ProductInput) => ({
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
			.select('id, company_id, name, address, reference, attendant_id')
			.eq('is_active', true)
			.order('name')
			.returns<LocationRow[]>()
		if (error) throw new Error(toMessage(error))
		const ids = [
			...new Set(
				(data ?? []).flatMap(l => (l.attendant_id ? [l.attendant_id] : []))
			),
		]
		const people = ids.length
			? await supabase
					.from('people')
					.select('id, full_name')
					.in('id', ids)
					.returns<{ id: string; full_name: string }[]>()
			: { data: [], error: null }
		if (people.error) throw new Error(toMessage(people.error))
		const names = new Map((people.data ?? []).map(p => [p.id, p.full_name]))
		return (data ?? []).map(l => ({
			id: l.id,
			companyId: l.company_id,
			name: l.name,
			address: l.address,
			reference: l.reference,
			attendantId: l.attendant_id,
			attendantName: l.attendant_id
				? (names.get(l.attendant_id) ?? null)
				: null,
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

	async save(input, personId) {
		if (input.id) {
			const { error } = await trueque
				.from('products')
				.update(toRow(input))
				.eq('id', input.id)
			if (error) throw new Error(toMessage(error))
			return input.id
		}
		const { data, error } = await trueque
			.from('products')
			.insert({ ...toRow(input), status: 'pending', created_by: personId })
			.select('id')
			.single<{ id: string }>()
		if (error) throw new Error(toMessage(error))
		return data.id
	},

	async setStatus(id, status) {
		const { error } = await trueque
			.from('products')
			.update({ status })
			.eq('id', id)
		if (error) throw new Error(toMessage(error))
	},

	async images(id) {
		const { data, error } = await trueque
			.from('product_images')
			.select('position, data, bytes')
			.eq('product_id', id)
			.order('position')
			.returns<ProductImage[]>()
		if (error) throw new Error(toMessage(error))
		return data ?? []
	},

	async covers(ids) {
		if (!ids.length) return new Map()
		const { data, error } = await trueque
			.from('product_images')
			.select('product_id, data')
			.eq('position', 1)
			.in('product_id', ids)
			.returns<{ product_id: string; data: string }[]>()
		if (error) throw new Error(toMessage(error))
		return new Map((data ?? []).map(i => [i.product_id, i.data]))
	},

	async setImages(id, images) {
		const del = await trueque
			.from('product_images')
			.delete()
			.eq('product_id', id)
		if (del.error) throw new Error(toMessage(del.error))
		if (!images.length) return
		const { error } = await trueque.from('product_images').insert(
			images.map((img, i) => ({
				product_id: id,
				position: i + 1,
				data: img.data,
				bytes: img.bytes,
			}))
		)
		if (error) throw new Error(toMessage(error))
	},
}
