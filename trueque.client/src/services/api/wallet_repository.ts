import type {
	Balance,
	EarningRule,
	Lot,
	Movement,
	MovementKind,
} from '@/types/wallet_type'

import { toMessage, trueque } from '../supabase/supabase_client'

export interface WalletRepository {
	balance(personId: string): Promise<Balance>
	lots(personId: string): Promise<Lot[]>
	movements(personId: string): Promise<Movement[]>
	rules(): Promise<EarningRule[]>
}

interface MovementRow {
	id: number
	kind: MovementKind
	amount: number
	source: string
	source_ref: string
	note: string | null
	created_at: string
	rule: { label: string } | null
}

function labelOf(r: MovementRow) {
	if (r.kind === 'earn')
		return r.note ?? `${r.rule?.label ?? 'Abono'} · ${r.source_ref}`
	if (r.kind === 'spend') return `Trueque ${r.source_ref}`
	if (r.kind === 'expire') return `Vencieron los cacaos de ${r.source_ref}`
	if (r.kind === 'refund') return `Devolución · ${r.source_ref}`
	return r.note ?? 'Ajuste'
}

export const walletRepository: WalletRepository = {
	async balance(personId) {
		const { data, error } = await trueque
			.from('balances')
			.select('balance, expiring_60d')
			.eq('person_id', personId)
			.maybeSingle<{ balance: number; expiring_60d: number }>()
		if (error) throw new Error(toMessage(error))
		return { balance: data?.balance ?? 0, expiring60d: data?.expiring_60d ?? 0 }
	},

	async lots(personId) {
		const { data, error } = await trueque
			.from('lots')
			.select(
				'id, source, source_ref, amount, remaining, expires_on, created_at'
			)
			.eq('person_id', personId)
			.order('expires_on')
			.returns<
				{
					id: number
					source: string
					source_ref: string
					amount: number
					remaining: number
					expires_on: string
					created_at: string
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(l => ({
			id: l.id,
			source: l.source,
			sourceRef: l.source_ref,
			amount: l.amount,
			remaining: l.remaining,
			expiresOn: l.expires_on,
			createdAt: l.created_at,
		}))
	},

	async movements(personId) {
		const { data, error } = await trueque
			.from('ledger')
			.select(
				'id, kind, amount, source, source_ref, note, created_at, rule:earning_rules(label)'
			)
			.eq('person_id', personId)
			.order('created_at', { ascending: false })
			.order('id', { ascending: false })
			.limit(100)
			.returns<MovementRow[]>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(r => ({
			id: r.id,
			kind: r.kind,
			amount: r.amount,
			sourceRef: r.source_ref,
			label: labelOf(r),
			createdAt: r.created_at,
		}))
	},

	async rules() {
		const { data, error } = await trueque
			.from('earning_rules')
			.select('code, label, cacaos, monthly_cap')
			.eq('is_active', true)
			.order('position')
			.returns<
				{
					code: string
					label: string
					cacaos: number
					monthly_cap: number | null
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(r => ({
			code: r.code,
			label: r.label,
			cacaos: r.cacaos,
			monthlyCap: r.monthly_cap,
		}))
	},
}
