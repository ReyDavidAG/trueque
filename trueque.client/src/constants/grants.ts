import type { GrantEventKind, GrantScope, GrantStatus } from '@/types/grantType'

export const GIFT_STEPS = [
	'Motivo',
	'A quién',
	'Cuánto',
	'Cuándo',
	'Revisar',
] as const

export const GRANT_STATUS: Record<GrantStatus, readonly [string, string]> = {
	draft: ['Borrador', 'is-paused'],
	pending: ['Por autorizar', 'is-pending'],
	rejected: ['Rechazado', 'is-rejected'],
	scheduled: ['Programado', 'is-live'],
	delivered: ['Entregado', 'is-used'],
	cancelled: ['Cancelado', 'is-used'],
}

export const GRANT_STATUS_ORDER: GrantStatus[] = [
	'pending',
	'rejected',
	'draft',
	'scheduled',
	'delivered',
	'cancelled',
]

export const GRANT_SCOPES: readonly (readonly [GrantScope, string])[] = [
	['group', 'Todo el grupo'],
	['company', 'Una empresa'],
	['area', 'Un área'],
	['department', 'Un departamento'],
	['list', 'Una lista de personas'],
]

export const GRANT_EVENTS: Record<GrantEventKind, string> = {
	created: 'Lo armó',
	edited: 'Lo editó',
	submitted: 'Lo mandó a autorizar',
	approved: 'Lo autorizó',
	rejected: 'Lo rechazó',
	cancelled: 'Lo canceló',
	delivered: 'Se entregó',
}

export const LOT_MONTH_OPTIONS = ['1', '3', '6', '12'] as const
