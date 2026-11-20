export const STALLS = [
	['grana', 'Grana'],
	['anil', 'Añil'],
	['nopal', 'Nopal'],
	['achiote', 'Achiote'],
	['maiz', 'Maíz'],
	['cacao', 'Cacao'],
] as const

export const CHISPA_URL = 'https://chispa-phi.vercel.app/'

export const PRODUCT_STATUS = {
	draft: ['Borrador', 'is-paused'],
	pending: ['Esperando a RH', 'is-pending'],
	live: ['Publicado', 'is-live'],
	paused: ['Pausado', 'is-paused'],
	rejected: ['Rechazado', 'is-rejected'],
	retired: ['Retirado', 'is-used'],
} as const

export const ALL_CATEGORIES = 'all'

export const ROLE_NAMES = {
	member: 'Colaborador',
	company: 'Encargado de tienda',
	hr: 'RH corporativo',
} as const
