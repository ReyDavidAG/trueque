import type { IconName } from '@/components/ui/icon'

export const THEME_KEY = 'trueque.theme'

export const THEMES = [
	{ id: 'light', label: 'Claro', icon: 'sun', meta: '#dbe9f6' },
	{ id: 'dark', label: 'Oscuro', icon: 'moon', meta: '#1a2233' },
	{ id: 'neutral', label: 'Neutro', icon: 'contrast', meta: '#f2f1ef' },
] as const satisfies readonly {
	id: string
	label: string
	icon: IconName
	meta: string
}[]

export type ThemeId = (typeof THEMES)[number]['id']
