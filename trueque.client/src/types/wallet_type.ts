export interface Lot {
	id: number
	source: string
	sourceRef: string
	amount: number
	remaining: number
	expiresOn: string
	createdAt: string
}

export interface Balance {
	balance: number
	expiring60d: number
}

export type MovementKind = 'earn' | 'spend' | 'expire' | 'refund' | 'adjust'

export interface Movement {
	id: number
	kind: MovementKind
	amount: number
	sourceRef: string
	label: string
	createdAt: string
}

export interface EarningRule {
	code: string
	label: string
	cacaos: number
	monthlyCap: number | null
}
