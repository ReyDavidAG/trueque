import type { DashboardData } from '@/types/config_type'

import { toMessage, trueque } from '../supabase/supabase_client'

export interface DashboardRepository {
	load(): Promise<DashboardData>
}

export const dashboardRepository: DashboardRepository = {
	async load() {
		const [totals, months, areas, sources, top] = await Promise.all([
			trueque.from('dashboard_totals').select('*').single<{
				earned: number
				spent: number
				outstanding: number
				expiring_this_month: number
				active_people: number
				total_people: number
			}>(),
			trueque
				.from('dashboard_months')
				.select('month, earned, spent')
				.order('month')
				.returns<{ month: string; earned: number; spent: number }[]>(),
			trueque
				.from('dashboard_areas')
				.select('area, people')
				.order('people', { ascending: false })
				.returns<{ area: string; people: number }[]>(),
			trueque
				.from('dashboard_sources')
				.select('label, earned')
				.order('earned', { ascending: false })
				.returns<{ label: string; earned: number }[]>(),
			trueque
				.from('dashboard_top')
				.select('product_id, trades')
				.order('trades', { ascending: false })
				.limit(5)
				.returns<{ product_id: string; trades: number }[]>(),
		])
		const error =
			totals.error ?? months.error ?? areas.error ?? sources.error ?? top.error
		if (error) throw new Error(toMessage(error))
		const t = totals.data
		return {
			totals: {
				earned: t?.earned ?? 0,
				spent: t?.spent ?? 0,
				outstanding: t?.outstanding ?? 0,
				expiringThisMonth: t?.expiring_this_month ?? 0,
				activePeople: t?.active_people ?? 0,
				totalPeople: t?.total_people ?? 0,
			},
			months: months.data ?? [],
			areas: areas.data ?? [],
			sources: sources.data ?? [],
			top: (top.data ?? []).map(x => ({
				productId: x.product_id,
				trades: x.trades,
			})),
		}
	},
}
