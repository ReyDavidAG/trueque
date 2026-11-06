export interface StoreConfig {
	cacaoValue: number
	lotMonths: number
	refundOnExpiry: boolean
}

export type NotificationKind =
	| 'earn'
	| 'expire'
	| 'coupon'
	| 'review'
	| 'rejected'
	| 'budget'
	| 'custodia'

export interface NotificationItem {
	id: number
	kind: NotificationKind
	body: string
	link: string | null
	read: boolean
	createdAt: string
}

export interface DashboardData {
	totals: {
		earned: number
		spent: number
		outstanding: number
		expiringThisMonth: number
		activePeople: number
		totalPeople: number
	}
	months: { month: string; earned: number; spent: number }[]
	areas: { area: string; people: number }[]
	sources: { label: string; earned: number }[]
	top: { productId: string; trades: number }[]
}

export interface CouponLookup {
	code: string
	folio: string
	state: 'valid' | 'expired' | 'disabled' | 'used'
	validUntil: string
	swapsLeft: number
	productId: string
	productName: string
	productArt: string
	productStall: string
	productCost: number
	productCompany: string
	personName: string
	employeeNumber: string
	canRedeem: boolean
}

export interface LocationInput {
	id: string | null
	companyId: string
	name: string
	address: string
	reference: string
}
