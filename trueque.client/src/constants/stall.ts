export const STALL_BY_ART: Record<string, string> = {
	plate: 'achiote',
	thermos: 'anil',
	apple: 'nopal',
	chat: 'anil',
	glasses: 'grana',
	wrench: 'maiz',
	diploma: 'cacao',
	laptop: 'cacao',
	cap: 'grana',
}

export const stallOf = (art: string) => STALL_BY_ART[art] ?? 'grana'

export const CATEGORY_LABELS = {
	all: 'Todo',
	service: 'Servicios',
	item: 'Artículos',
	custodia: 'De Custodia',
} as const

export const ROLE_NAMES = {
	member: 'Colaborador',
	company: 'Empresa',
	hr: 'RH corporativo',
} as const
