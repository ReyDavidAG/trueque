export type GrantStatus =
	| 'draft'
	| 'pending'
	| 'rejected'
	| 'scheduled'
	| 'delivered'
	| 'cancelled'

export type GrantScope = 'group' | 'company' | 'area' | 'department' | 'list'

export type GrantEventKind =
	| 'created'
	| 'edited'
	| 'submitted'
	| 'approved'
	| 'rejected'
	| 'cancelled'
	| 'delivered'

export interface GrantOccasion {
	code: string
	name: string
	oncePerYear: boolean
}

export interface Grant {
	id: string
	folio: string
	occasionCode: string
	occasionName: string
	name: string
	reason: string
	scope: GrantScope
	scopeId: string | null
	scopeName: string
	amount: number | null
	deliverOn: string
	lotMonths: number
	status: GrantStatus
	createdBy: string
	createdByName: string
	createdAt: string
	submittedAt: string | null
	decidedBy: string | null
	decidedByName: string | null
	decidedAt: string | null
	decisionNote: string | null
	deliveredAt: string | null
	cancelNote: string | null
	people: number
	total: number
	skipped: number
}

export interface GrantRecipient {
	personId: string
	fullName: string
	employeeNumber: string
	amount: number
	note: string | null
	delivered: boolean
	skippedReason: string | null
}

export interface GrantEvent {
	id: number
	kind: GrantEventKind
	actorName: string | null
	note: string | null
	createdAt: string
}

export interface GrantFund {
	period: number
	fund: number
	scheduled: number
	delivered: number
	pending: number
	available: number
}

export interface GrantListItem {
	employeeNumber: string
	amount: number
	note: string
}

export interface GrantInput {
	id: string | null
	occasion: string
	name: string
	reason: string
	scope: GrantScope
	scopeId: string | null
	amount: number | null
	deliverOn: string
	lotMonths: number
	list: GrantListItem[]
}

export interface ScopeOption {
	id: string
	name: string
	parentId: string | null
}

export interface GrantScopes {
	companies: ScopeOption[]
	areas: ScopeOption[]
	departments: ScopeOption[]
}
