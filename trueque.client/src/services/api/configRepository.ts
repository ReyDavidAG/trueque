import type { LocationInput, StoreConfig } from '@/types/configType'
import type { CategoryInput, CategoryPatch } from '@/types/productType'

import { toMessage, trueque } from '../supabase/supabaseClient'

import { toCategoryRow } from './mappers/productMapper'

export interface ConfigRepository {
	get(): Promise<StoreConfig>
	set(patch: Partial<StoreConfig>): Promise<void>
	setRule(
		code: string,
		patch: { cacaos?: number; monthlyCap: number | null; isActive: boolean }
	): Promise<void>
	createCategory(input: CategoryInput): Promise<void>
	updateCategory(code: string, patch: CategoryPatch): Promise<void>
	setBudget(companyId: string, period: number, assigned: number): Promise<void>
	saveLocation(input: LocationInput): Promise<void>
}

const check = (error: { message: string } | null) => {
	if (error) throw new Error(toMessage(error))
}

const CONFIG_COLUMNS = {
	cacaoValue: 'cacao_value',
	lotMonths: 'lot_months',
	refundOnExpiry: 'refund_on_expiry',
	grantMaxPerPerson: 'grant_max_per_person',
	grantMaxPerYear: 'grant_max_per_year',
	grantMaxList: 'grant_max_list',
	grantMaxDaysAhead: 'grant_max_days_ahead',
} as const satisfies Record<keyof StoreConfig, string>

interface ConfigRow {
	cacao_value: number | string
	lot_months: number
	refund_on_expiry: boolean
	grant_max_per_person: number
	grant_max_per_year: number
	grant_max_list: number
	grant_max_days_ahead: number
}

export const configRepository: ConfigRepository = {
	async get() {
		const { data, error } = await trueque
			.from('config')
			.select(Object.values(CONFIG_COLUMNS).join(', '))
			.single<ConfigRow>()
		check(error)
		return {
			cacaoValue: Number(data?.cacao_value ?? 5),
			lotMonths: data?.lot_months ?? 12,
			refundOnExpiry: data?.refund_on_expiry ?? false,
			grantMaxPerPerson: data?.grant_max_per_person ?? 100,
			grantMaxPerYear: data?.grant_max_per_year ?? 300,
			grantMaxList: data?.grant_max_list ?? 50,
			grantMaxDaysAhead: data?.grant_max_days_ahead ?? 60,
		}
	},

	async set(patch) {
		const row = Object.fromEntries(
			Object.entries(CONFIG_COLUMNS).flatMap(([key, column]) => {
				const value = patch[key as keyof StoreConfig]
				return value === undefined ? [] : [[column, value]]
			})
		)
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

	async createCategory(input) {
		const { error } = await trueque
			.from('categories')
			.insert({ code: input.code, ...toCategoryRow(input) })
		check(error)
	},

	async updateCategory(code, patch) {
		const { error } = await trueque
			.from('categories')
			.update(toCategoryRow(patch))
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
