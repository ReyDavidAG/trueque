import type {
	Grant,
	GrantEvent,
	GrantFund,
	GrantInput,
	GrantOccasion,
	GrantRecipient,
	GrantScope,
	GrantScopes,
} from '@/types/grantType'

import { supabase, toMessage, trueque } from '../supabase/supabaseClient'

import {
	type EventRow,
	type FundRow,
	type GrantRow,
	type PersonName,
	type RecipientRow,
	toEvent,
	toFund,
	toGrant,
	toRecipient,
	toSaveArgs,
} from './mappers/grantMapper'

export interface GrantRepository {
	list(): Promise<Grant[]>
	get(id: string): Promise<Grant | null>
	recipients(id: string): Promise<GrantRecipient[]>
	events(id: string): Promise<GrantEvent[]>
	occasions(): Promise<GrantOccasion[]>
	fund(year: number): Promise<GrantFund | null>
	scopes(): Promise<GrantScopes>
	preview(scope: GrantScope, scopeId: string | null): Promise<number>
	save(input: GrantInput): Promise<string>
	submit(id: string): Promise<void>
	decide(id: string, approve: boolean, note: string | null): Promise<string>
	cancel(id: string, note: string | null): Promise<void>
	setFund(year: number, amount: number): Promise<void>
}

const check = (error: { message: string } | null) => {
	if (error) throw new Error(toMessage(error))
}

async function peopleNames(ids: string[]) {
	if (!ids.length) return new Map<string, PersonName>()
	const { data, error } = await supabase
		.from('people')
		.select('id, full_name, employee_number')
		.in('id', ids)
		.returns<({ id: string } & PersonName)[]>()
	check(error)
	return new Map((data ?? []).map(p => [p.id, p]))
}

const unique = (ids: (string | null)[]) => [
	...new Set(ids.flatMap(id => (id ? [id] : []))),
]

export const grantRepository: GrantRepository = {
	async list() {
		const { data, error } = await trueque
			.from('grant_cards')
			.select('*')
			.order('created_at', { ascending: false })
			.returns<GrantRow[]>()
		check(error)
		return (data ?? []).map(toGrant)
	},

	async get(id) {
		const { data, error } = await trueque
			.from('grant_cards')
			.select('*')
			.eq('id', id)
			.maybeSingle<GrantRow>()
		check(error)
		return data ? toGrant(data) : null
	},

	async recipients(id) {
		const { data, error } = await trueque
			.from('grant_recipients')
			.select('person_id, amount, note, ledger_id, skipped_reason')
			.eq('grant_id', id)
			.returns<RecipientRow[]>()
		check(error)
		const rows = data ?? []
		const names = await peopleNames(unique(rows.map(r => r.person_id)))
		return rows
			.map(r => toRecipient(r, names))
			.sort((a, b) => a.fullName.localeCompare(b.fullName))
	},

	async events(id) {
		const { data, error } = await trueque
			.from('grant_events')
			.select('id, kind, actor_id, note, created_at')
			.eq('grant_id', id)
			.order('id')
			.returns<EventRow[]>()
		check(error)
		const rows = data ?? []
		const names = await peopleNames(unique(rows.map(r => r.actor_id)))
		return rows.map(r => toEvent(r, names))
	},

	async occasions() {
		const { data, error } = await trueque
			.from('grant_occasions')
			.select('code, name, once_per_year')
			.eq('is_active', true)
			.order('position')
			.returns<{ code: string; name: string; once_per_year: boolean }[]>()
		check(error)
		return (data ?? []).map(o => ({
			code: o.code,
			name: o.name,
			oncePerYear: o.once_per_year,
		}))
	},

	async fund(year) {
		const { data, error } = await trueque
			.from('grant_fund_usage')
			.select('*')
			.eq('period', year)
			.maybeSingle<FundRow>()
		check(error)
		return data ? toFund(data) : null
	},

	async scopes() {
		const [companies, areas, departments] = await Promise.all([
			supabase
				.from('companies')
				.select('id, name')
				.order('name')
				.returns<{ id: string; name: string }[]>(),
			supabase
				.from('areas')
				.select('id, name, company_id')
				.order('name')
				.returns<{ id: string; name: string; company_id: string }[]>(),
			supabase
				.from('departments')
				.select('id, name, area_id')
				.order('name')
				.returns<{ id: string; name: string; area_id: string }[]>(),
		])
		check(companies.error ?? areas.error ?? departments.error)
		return {
			companies: (companies.data ?? []).map(c => ({
				id: c.id,
				name: c.name,
				parentId: null,
			})),
			areas: (areas.data ?? []).map(a => ({
				id: a.id,
				name: a.name,
				parentId: a.company_id,
			})),
			departments: (departments.data ?? []).map(d => ({
				id: d.id,
				name: d.name,
				parentId: d.area_id,
			})),
		}
	},

	async preview(scope, scopeId) {
		const { data, error } = await trueque.rpc('grant_preview', {
			p_scope: scope,
			p_scope_id: scopeId,
		})
		check(error)
		return typeof data === 'number' ? data : 0
	},

	async save(input) {
		const { data, error } = await trueque.rpc('grant_save', toSaveArgs(input))
		check(error)
		if (typeof data !== 'string')
			throw new Error('No se pudo guardar el regalo.')
		return data
	},

	async submit(id) {
		const { error } = await trueque.rpc('grant_submit', { p_id: id })
		check(error)
	},

	async decide(id, approve, note) {
		const { data, error } = await trueque.rpc('grant_decide', {
			p_id: id,
			p_approve: approve,
			p_note: note,
		})
		check(error)
		return typeof data === 'string' ? data : ''
	},

	async cancel(id, note) {
		const { error } = await trueque.rpc('grant_cancel', {
			p_id: id,
			p_note: note,
		})
		check(error)
	},

	async setFund(year, amount) {
		const { error } = await trueque.rpc('grant_set_fund', {
			p_year: year,
			p_amount: amount,
		})
		check(error)
	},
}
