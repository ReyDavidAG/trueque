export const QUERY_KEYS = {
	session: ['session'] as const,
	products: ['products'] as const,
	locations: ['catalog', 'locations'] as const,
	categories: ['catalog', 'categories'] as const,
	companies: ['catalog', 'companies'] as const,
	rules: ['catalog', 'rules'] as const,
	balance: (personId: string) => ['wallet', personId, 'balance'] as const,
	lots: (personId: string) => ['wallet', personId, 'lots'] as const,
	movements: (personId: string) => ['wallet', personId, 'movements'] as const,
	coupons: (personId: string) => ['wallet', personId, 'coupons'] as const,
	receipt: (folio: string) => ['trades', folio] as const,
	budgets: ['panel', 'budgets'] as const,
	reviews: ['panel', 'reviews'] as const,
}

export const CATALOG_STALE_TIME = 5 * 60_000
