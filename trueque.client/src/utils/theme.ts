import { THEME_KEY, type ThemeId, THEMES } from '@/constants/theme'

const isTheme = (value: unknown): value is ThemeId =>
	THEMES.some(t => t.id === value)

export function storedTheme(): ThemeId {
	try {
		const saved = localStorage.getItem(THEME_KEY)
		if (isTheme(saved)) return saved
	} catch {
		return 'light'
	}
	return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: ThemeId) {
	document.documentElement.dataset.palette = theme
	const meta = THEMES.find(t => t.id === theme)?.meta
	if (meta)
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', meta)
}

export function saveTheme(theme: ThemeId) {
	applyTheme(theme)
	try {
		localStorage.setItem(THEME_KEY, theme)
	} catch {
		return
	}
}
