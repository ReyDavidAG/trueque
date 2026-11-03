export type CouponState = 'valid' | 'expired' | 'disabled' | 'used'
export type OrderStatus =
	| 'issued'
	| 'used'
	| 'expired'
	| 'cancelled'
	| 'refunded'

export interface TradeResult {
	folio: string
	code: string
	balance: number
}

export interface CouponCard {
	orderFolio: string
	price: number
	status: OrderStatus
	createdAt: string
	productId: string
	productName: string
	art: string
	stall: string
	locationId: string | null
	code: string
	codeType: 'qr' | 'barcode' | 'text'
	state: CouponState
	validUntil: string
	swapsBudget: number
	swapsUsed: number
}

export interface Receipt extends CouponCard {
	companyId: string
	balanceAfter: number
	used: { sourceRef: string; amount: number; expiresOn: string }[]
}
