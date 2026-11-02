export const ROUTES = {
	signIn: '/sign-in',
	market: '/',
	product: (id: string) => `/products/${id}`,
	trade: (id: string) => `/trade/${id}`,
	receipt: (folio: string) => `/trades/${folio}`,
	wallet: '/wallet',
	coupons: '/coupons',
	earn: '/earn',
	panel: '/panel',
} as const
