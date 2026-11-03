import type { CouponLookup } from '@/types/config_type'
import type {
	CouponCard,
	CouponState,
	OrderStatus,
	Receipt,
	TradeResult,
} from '@/types/trade_type'

import { toMessage, trueque } from '../supabase/supabase_client'

interface LookupRow {
	code: string
	folio: string
	state: CouponLookup['state']
	valid_until: string
	swaps_left: number
	product_id: string
	product_name: string
	product_art: string | null
	product_stall: string
	product_cost: number | string
	product_company: string
	person_name: string
	employee_number: string
	can_redeem: boolean
}

const isLookupRow = (v: unknown): v is LookupRow =>
	typeof v === 'object' &&
	v !== null &&
	'code' in v &&
	'product_id' in v &&
	'state' in v

export interface TradeRepository {
	trade(productId: string): Promise<TradeResult>
	coupons(personId: string): Promise<CouponCard[]>
	receipt(folio: string): Promise<Receipt | null>
	redeem(code: string, locationId: string | null): Promise<CouponState>
	lookup(code: string): Promise<CouponLookup | null>
}

const ORDER_FIELDS =
	'folio, price, status, created_at, company_id, spend_id, product:products(id, name, art, stall, location_id), coupon:coupons(code, code_type, state, valid_until, swaps_budget, swaps_used)'

interface OrderRow {
	folio: number
	price: number
	status: OrderStatus
	created_at: string
	company_id: string
	spend_id: number
	product: {
		id: string
		name: string
		art: string | null
		stall: string | null
		location_id: string | null
	} | null
	coupon: {
		code: string
		code_type: CouponCard['codeType']
		state: CouponState
		valid_until: string
		swaps_budget: number
		swaps_used: number
	} | null
}

const isTradeResult = (v: unknown): v is TradeResult =>
	typeof v === 'object' &&
	v !== null &&
	'folio' in v &&
	'code' in v &&
	'balance' in v

export const orderFolio = (n: number) => `TRQ-${String(n).padStart(4, '0')}`

const toCard = (r: OrderRow): CouponCard => ({
	orderFolio: orderFolio(r.folio),
	price: r.price,
	status: r.status,
	createdAt: r.created_at,
	productId: r.product?.id ?? '',
	productName: r.product?.name ?? 'Producto',
	art: r.product?.art ?? 'ticket',
	stall: r.product?.stall ?? 'grana',
	locationId: r.product?.location_id ?? null,
	code: r.coupon?.code ?? '',
	codeType: r.coupon?.code_type ?? 'qr',
	state: r.coupon?.state ?? 'disabled',
	validUntil: r.coupon?.valid_until ?? r.created_at,
	swapsBudget: r.coupon?.swaps_budget ?? 1,
	swapsUsed: r.coupon?.swaps_used ?? 0,
})

export const tradeRepository: TradeRepository = {
	async trade(productId) {
		const { data, error } = await trueque.rpc('trade', { p_product: productId })
		if (error) throw new Error(toMessage(error))
		const row: unknown = Array.isArray(data) ? data[0] : null
		if (!isTradeResult(row)) throw new Error('No se pudo completar el trueque.')
		return row
	},

	async coupons(personId) {
		const { data, error } = await trueque
			.from('orders')
			.select(ORDER_FIELDS)
			.eq('person_id', personId)
			.order('created_at', { ascending: false })
			.returns<OrderRow[]>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(toCard)
	},

	async receipt(folio) {
		const n = Number(folio.replace(/\D/g, ''))
		if (!n) return null
		const { data, error } = await trueque
			.from('orders')
			.select(ORDER_FIELDS)
			.eq('folio', n)
			.maybeSingle<OrderRow>()
		if (error) throw new Error(toMessage(error))
		if (!data) return null
		const alloc = await trueque
			.from('lot_allocations')
			.select(
				'amount, lot:ledger!lot_allocations_lot_id_fkey(source_ref, expires_on)'
			)
			.eq('spend_id', data.spend_id)
			.returns<
				{
					amount: number
					lot: { source_ref: string; expires_on: string } | null
				}[]
			>()
		if (alloc.error) throw new Error(toMessage(alloc.error))
		return {
			...toCard(data),
			companyId: data.company_id,
			balanceAfter: 0,
			used: (alloc.data ?? []).map(a => ({
				sourceRef: a.lot?.source_ref ?? '',
				amount: a.amount,
				expiresOn: a.lot?.expires_on ?? '',
			})),
		}
	},

	async redeem(code, locationId) {
		const { data, error } = await trueque.rpc('redeem', {
			p_code: code.trim().toUpperCase(),
			p_location: locationId,
		})
		if (error) throw new Error(toMessage(error))
		if (data !== 'used' && data !== 'valid')
			throw new Error('No se pudo canjear.')
		return data
	},

	async lookup(code) {
		const { data, error } = await trueque.rpc('coupon_lookup', {
			p_code: code,
		})
		if (error) throw new Error(toMessage(error))
		const r: unknown = Array.isArray(data) ? data[0] : null
		if (!isLookupRow(r)) return null
		return {
			code: r.code,
			folio: r.folio,
			state: r.state,
			validUntil: r.valid_until,
			swapsLeft: r.swaps_left,
			productId: r.product_id,
			productName: r.product_name,
			productArt: r.product_art ?? 'ticket',
			productStall: r.product_stall,
			productCost: Number(r.product_cost),
			productCompany: r.product_company,
			personName: r.person_name,
			employeeNumber: r.employee_number,
			canRedeem: r.can_redeem,
		}
	},
}
