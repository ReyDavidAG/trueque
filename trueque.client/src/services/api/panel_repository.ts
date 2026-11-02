import type { Budget, Company, PriceReview } from '@/types/panel_type'

import { supabase, toMessage, trueque } from '../supabase/supabase_client'

export interface PanelRepository {
	budgets(): Promise<Budget[]>
	reviews(): Promise<PriceReview[]>
	companies(): Promise<Company[]>
	reviewPrice(
		productId: string,
		decision: PriceReview['decision'],
		finalPrice: number | null,
		note: string | null
	): Promise<void>
}

export const panelRepository: PanelRepository = {
	async budgets() {
		const { data, error } = await trueque
			.from('budget_usage')
			.select('*')
			.order('period', { ascending: false })
			.returns<
				{
					company_id: string
					period: number
					assigned: number
					redeemed: number
					committed: number
					available: number
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(b => ({
			companyId: b.company_id,
			period: b.period,
			assigned: b.assigned,
			redeemed: b.redeemed,
			committed: b.committed,
			available: b.available,
		}))
	},

	async reviews() {
		const { data, error } = await trueque
			.from('price_reviews')
			.select('product_id, decision, final_price, note, created_at')
			.order('created_at', { ascending: false })
			.returns<
				{
					product_id: string
					decision: PriceReview['decision']
					final_price: number | null
					note: string | null
					created_at: string
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(r => ({
			productId: r.product_id,
			decision: r.decision,
			finalPrice: r.final_price,
			note: r.note,
			createdAt: r.created_at,
		}))
	},

	async companies() {
		const { data, error } = await supabase
			.from('companies')
			.select('id, code, name')
			.returns<Company[]>()
		if (error) throw new Error(toMessage(error))
		return data ?? []
	},

	async reviewPrice(productId, decision, finalPrice, note) {
		const { error } = await trueque.rpc('review_price', {
			p_product: productId,
			p_decision: decision,
			p_final_price: finalPrice,
			p_note: note,
		})
		if (error) throw new Error(toMessage(error))
	},
}
