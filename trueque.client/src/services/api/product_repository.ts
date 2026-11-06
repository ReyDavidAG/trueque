import type {
	CategoryInfo,
	ExchangeLocation,
	Product,
	ProductImage,
	ProductInput,
	ProductStatus,
} from '@/types/product_type'

import { supabase, toMessage, trueque } from '../supabase/supabase_client'
import {
	type CategoryRow,
	type LocationRow,
	type ProductRow,
	toCategory,
	toLocation,
	toProduct,
	toProductRow,
} from './mappers/product_mapper'

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

const COVER_POSITION = 1

async function attendantNames(ids: string[]) {
	if (!ids.length) return new Map<string, string>()
	const { data, error } = await supabase
		.from('people')
		.select('id, full_name')
		.in('id', ids)
		.returns<{ id: string; full_name: string }[]>()
	if (error) throw new Error(toMessage(error))
	return new Map((data ?? []).map(p => [p.id, p.full_name]))
}

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
		const rows = data ?? []
		const attendantIds = [
			...new Set(rows.flatMap(l => (l.attendant_id ? [l.attendant_id] : []))),
		]
		const names = await attendantNames(attendantIds)
		return rows.map(row => toLocation(row, names))
	},

	async categories() {
		const { data, error } = await trueque
			.from('categories')
			.select('code, name, price_min, price_max')
			.order('position')
			.returns<CategoryRow[]>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(toCategory)
	},

	async save(input, personId) {
		if (input.id) {
			const { error } = await trueque
				.from('products')
				.update(toProductRow(input))
				.eq('id', input.id)
			if (error) throw new Error(toMessage(error))
			return input.id
		}
		const { data, error } = await trueque
			.from('products')
			.insert({ ...toProductRow(input), status: 'pending', created_by: personId })
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
			.eq('position', COVER_POSITION)
			.in('product_id', ids)
			.returns<{ product_id: string; data: string }[]>()
		if (error) throw new Error(toMessage(error))
		return new Map((data ?? []).map(i => [i.product_id, i.data]))
	},

	async setImages(id, images) {
		const removal = await trueque
			.from('product_images')
			.delete()
			.eq('product_id', id)
		if (removal.error) throw new Error(toMessage(removal.error))
		if (!images.length) return
		const { error } = await trueque.from('product_images').insert(
			images.map((image, index) => ({
				product_id: id,
				position: index + COVER_POSITION,
				data: image.data,
				bytes: image.bytes,
			}))
		)
		if (error) throw new Error(toMessage(error))
	},
}
