import { ROUTES } from '@/constants/routes'
import { prefersReducedMotion } from '@/utils/reducedMotion'

const BRAND = 'El Trueque'
const FRAME_MS = 90
const SWING_DEG = 10
const PERIOD_MS = 2400

const PAGES: [RegExp, string][] = [
	[/^\/$/, 'El mercado'],
	[/^\/products\//, 'Puesto'],
	[/^\/trade\//, 'Hacer trueque'],
	[/^\/trades\//, 'Recibo'],
	[new RegExp(`^${ROUTES.wallet}`), 'Mi jícara'],
	[new RegExp(`^${ROUTES.coupons}`), 'Mis cupones'],
	[new RegExp(`^${ROUTES.earn}`), 'Cómo gano'],
	[new RegExp(`^${ROUTES.newProduct}`), 'Publicar producto'],
	[/^\/panel\/edit\//, 'Editar producto'],
	[new RegExp(`^${ROUTES.panel}`), 'Mi puesto'],
	[new RegExp(`^${ROUTES.redeem}`), 'Canjear cupón'],
	[new RegExp(`^${ROUTES.dashboard}`), 'Tablero'],
	[new RegExp(`^${ROUTES.settings}`), 'Ajustes'],
	[new RegExp(`^${ROUTES.signIn}`), 'Entrar'],
]

export const pageTitle = (path: string) => {
	const page = PAGES.find(([re]) => re.test(path))?.[1]
	return page ? `${BRAND} · ${page}` : BRAND
}

export function installTabFace(
	subscribe: (fn: (path: string) => void) => () => void,
	path: string
) {
	document.title = pageTitle(path)
	const unsubscribe = subscribe(next => {
		document.title = pageTitle(next)
	})
	let interval = 0
	const stopSwing = () => window.clearInterval(interval)
	let onVisibility: () => void = () => {}

	const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
	if (link && !prefersReducedMotion()) {
		const start = performance.now()
		const drawFrame = () => {
			const frame = eggFrame((performance.now() - start) / PERIOD_MS)
			link.href = `data:image/svg+xml,${encodeURIComponent(frame)}`
		}
		const startSwing = () => {
			stopSwing()
			interval = window.setInterval(drawFrame, FRAME_MS)
		}
		onVisibility = () => (document.hidden ? stopSwing() : startSwing())
		document.addEventListener('visibilitychange', onVisibility)
		if (!document.hidden) startSwing()
	}

	return () => {
		stopSwing()
		document.removeEventListener('visibilitychange', onVisibility)
		unsubscribe()
	}
}
