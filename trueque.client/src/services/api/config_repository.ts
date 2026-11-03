import type { LocationInput, StoreConfig } from '@/types/config_type'

import { toMessage, trueque } from '../supabase/supabase_client'

export interface ConfigRepository {
	get(): Promise<StoreConfig>
	set(patch: Partial<StoreConfig>): Promise<void>
	setRule(
		code: string,
		patch: { cacaos?: number; monthlyCap: number | null; isActive: boolean }
	): Promise<void>
	setCategory(code: string, priceMin: number, priceMax: number): Promise<void>
	setBudget(companyId: string, period: number, assigned: number): Promise<void>
	saveLocation(input: LocationInput): Promise<void>
}

const check = (error: { message: string } | null) => {
	if (error) throw new Error(toMessage(error))
}

export const configRepository: ConfigRepository = {
	async get() {
		const { data, error } = await trueque
			.from('config')
			.select('cacao_value, lot_months, refund_on_expiry')
			.single<{
				cacao_value: number | string
				lot_months: number
				refund_on_expiry: boolean
			}>()
		check(error)
		return {
			cacaoValue: Number(data?.cacao_value ?? 5),
			lotMonths: data?.lot_months ?? 12,
			refundOnExpiry: data?.refund_on_expiry ?? false,
		}
	},

	async set(patch) {
		const row: Record<string, unknown> = {}
		if (patch.cacaoValue !== undefined) row.cacao_value = patch.cacaoValue
		if (patch.lotMonths !== undefined) row.lot_months = patch.lotMonths
		if (patch.refundOnExpiry !== undefined)
			row.refund_on_expiry = patch.refundOnExpiry
		const { error } = await trueque.from('config').update(row).eq('id', true)
		check(error)
	},

	async setRule(code, patch) {
		const { error } = await trueque
			.from('earning_rules')
			.update({
				...(patch.cacaos !== undefined ? { cacaos: patch.cacaos } : {}),
				monthly_cap: patch.monthlyCap,
				is_active: patch.isActive,
			})
			.eq('code', code)
		check(error)
	},

	async setCategory(code, priceMin, priceMax) {
		const { error } = await trueque
			.from('categories')
			.update({ price_min: priceMin, price_max: priceMax })
			.eq('code', code)
		check(error)
	},

	async setBudget(companyId, period, assigned) {
		const { error } = await trueque
			.from('company_budgets')
			.upsert({ company_id: companyId, period, assigned })
		check(error)
	},

	async saveLocation(input) {
		const row = {
			company_id: input.companyId,
			name: input.name,
			address: input.address || null,
			reference: input.reference || null,
		}
		const { error } = input.id
			? await trueque.from('exchange_locations').update(row).eq('id', input.id)
			: await trueque.from('exchange_locations').insert(row)
		check(error)
	},
}
