import type {
	Grant,
	GrantEvent,
	GrantEventKind,
	GrantFund,
	GrantInput,
	GrantRecipient,
	GrantScope,
	GrantStatus,
} from '@/types/grantType'

export type GrantRow = {
	id: string
	folio_code: string
	occasion_code: string
	occasion_name: string
	name: string
	reason: string
	scope: GrantScope
	scope_id: string | null
	scope_name: string | null
	amount: number | null
	deliver_on: string
	lot_months: number
	status: GrantStatus
	created_by: string
	created_by_name: string | null
	created_at: string
	submitted_at: string | null
	decided_by: string | null
	decided_by_name: string | null
	decided_at: string | null
	decision_note: string | null
	delivered_at: string | null
	cancel_note: string | null
	people: number
	total: number
	skipped: number
}

export type RecipientRow = {
	person_id: string
	amount: number
	note: string | null
	ledger_id: number | null
	skipped_reason: string | null
}

export type EventRow = {
	id: number
	kind: GrantEventKind
	actor_id: string | null
	note: string | null
	created_at: string
}

export type FundRow = {
	period: number
	fund: number
	scheduled: number
	delivered: number
	pending: number
	available: number
}

export type PersonName = { full_name: string; employee_number: string }

export const toGrant = (r: GrantRow): Grant => ({
	id: r.id,
	folio: r.folio_code,
	occasionCode: r.occasion_code,
	occasionName: r.occasion_name,
	name: r.name,
	reason: r.reason,
	scope: r.scope,
	scopeId: r.scope_id,
	scopeName: r.scope_name ?? '',
	amount: r.amount,
	deliverOn: r.deliver_on,
	lotMonths: r.lot_months,
	status: r.status,
	createdBy: r.created_by,
	createdByName: r.created_by_name ?? '',
	createdAt: r.created_at,
	submittedAt: r.submitted_at,
	decidedBy: r.decided_by,
	decidedByName: r.decided_by_name,
	decidedAt: r.decided_at,
	decisionNote: r.decision_note,
	deliveredAt: r.delivered_at,
	cancelNote: r.cancel_note,
	people: r.people,
	total: r.total,
	skipped: r.skipped,
})

export const toRecipient = (
	r: RecipientRow,
	names: Map<string, PersonName>
): GrantRecipient => ({
	personId: r.person_id,
	fullName: names.get(r.person_id)?.full_name ?? 'Persona',
	employeeNumber: names.get(r.person_id)?.employee_number ?? '',
	amount: r.amount,
	note: r.note,
	delivered: r.ledger_id !== null,
	skippedReason: r.skipped_reason,
})

export const toEvent = (
	r: EventRow,
	names: Map<string, PersonName>
): GrantEvent => ({
	id: r.id,
	kind: r.kind,
	actorName: r.actor_id ? (names.get(r.actor_id)?.full_name ?? null) : null,
	note: r.note,
	createdAt: r.created_at,
})

export const toFund = (r: FundRow): GrantFund => ({
	period: r.period,
	fund: r.fund,
	scheduled: r.scheduled,
	delivered: r.delivered,
	pending: r.pending,
	available: r.available,
})

export const toSaveArgs = (input: GrantInput) => ({
	p_id: input.id,
	p_occasion: input.occasion,
	p_name: input.name,
	p_reason: input.reason,
	p_scope: input.scope,
	p_scope_id:
		input.scope === 'group' || input.scope === 'list' ? null : input.scopeId,
	p_amount: input.scope === 'list' ? null : input.amount,
	p_deliver_on: input.deliverOn,
	p_lot_months: input.lotMonths,
	p_list:
		input.scope === 'list'
			? input.list.map(i => ({
					employee_number: i.employeeNumber,
					amount: i.amount,
					note: i.note,
				}))
			: [],
})
