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

const SIGN_TRANSFORM = 'transform="rotate(-6 256 330)"'
const STRING_GROUP = '<g id="string">'

export function installTabFace(
	subscribe: (fn: (path: string) => void) => () => void,
	path: string
) {
	document.title = pageTitle(path)
	const unsubscribe = subscribe(next => {
		document.title = pageTitle(next)
	})
	let interval = 0
	let disposed = false
	const stopSwing = () => window.clearInterval(interval)
	let onVisibility: () => void = () => {}

	const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
	if (link && !prefersReducedMotion())
		void fetch(link.href)
			.then(r => r.text())
			.then(svg => {
				if (disposed || !svg.includes(SIGN_TRANSFORM) || !svg.includes(STRING_GROUP))
					return
				const start = performance.now()
				const drawFrame = () => {
					const t = (performance.now() - start) / PERIOD_MS
					const turn = `transform="rotate(${(Math.sin(t * Math.PI * 2) * SWING_DEG).toFixed(1)} 256 60)"`
					const frame = svg
						.replace(SIGN_TRANSFORM, turn)
						.replace(STRING_GROUP, `<g id="string" ${turn}>`)
					link.href = `data:image/svg+xml,${encodeURIComponent(frame)}`
				}
				const startSwing = () => {
					stopSwing()
					interval = window.setInterval(drawFrame, FRAME_MS)
				}
				onVisibility = () => (document.hidden ? stopSwing() : startSwing())
				document.addEventListener('visibilitychange', onVisibility)
				if (!document.hidden) startSwing()
			})
			.catch(() => undefined)

	return () => {
		disposed = true
		stopSwing()
		document.removeEventListener('visibilitychange', onVisibility)
		unsubscribe()
	}
}
