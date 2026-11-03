import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { Product, ProductInput } from '@/types/product_type'

const DAYS = ['15', '30', '60', '90'] as const
const isDays = (v: string): v is ProductForm['couponDays'] =>
	DAYS.some(d => d === v)

export function toValues(p?: Product): ProductForm {
	const days = String(p?.couponDays ?? 30)
	return {
		name: p?.name ?? '',
		blurb: p?.blurb ?? '',
		detail: p?.detail ?? '',
		includes: (p?.includes ?? []).join('\n'),
		kind: p?.kind ?? 'service',
		category: p?.category ?? 'service',
		art: p?.art ?? 'ticket',
		stall: p?.stall ?? 'grana',
		cost: p ? String(p.cost) : '',
		price: p ? String(p.price) : '',
		stock: p?.stock == null ? '' : String(p.stock),
		swaps: String(p?.swaps ?? 1),
		couponDays: isDays(days) ? days : '30',
		availableFrom: p?.availableFrom ?? '',
		availableUntil: p?.availableUntil ?? '',
		locationId: p?.locationId ?? '',
	}
}

export const toInput = (
	v: ProductForm,
	id: string | null,
	companyId: string
): ProductInput => ({
	id,
	companyId,
	art: v.art,
	stall: v.stall,
	category: v.category,
	kind: v.kind,
	name: v.name.trim(),
	blurb: v.blurb.trim(),
	detail: v.detail.trim(),
	includes: v.includes
		.split('\n')
		.map(x => x.trim())
		.filter(Boolean),
	cost: Number(v.cost),
	price: Number(v.price),
	stock: v.stock === '' ? null : Number(v.stock),
	swaps: Number(v.swaps),
	couponDays: Number(v.couponDays),
	availableFrom: v.availableFrom || null,
	availableUntil: v.availableUntil || null,
	locationId: v.locationId,
})
