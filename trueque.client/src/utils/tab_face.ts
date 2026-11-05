import { ROUTES } from '@/constants/routes'

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

export function installTabFace(subscribe: (fn: (path: string) => void) => void, path: string) {
	document.title = pageTitle(path)
	subscribe(next => {
		document.title = pageTitle(next)
	})

	const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
	if (!link || matchMedia('(prefers-reduced-motion: reduce)').matches) return
	void fetch(link.href)
		.then(r => r.text())
		.then(svg => {
			const sign = 'transform="rotate(-6 256 330)"'
			const string = '<g id="string">'
			if (!svg.includes(sign) || !svg.includes(string)) return
			const start = performance.now()
			setInterval(() => {
				if (document.hidden) return
				const t = (performance.now() - start) / PERIOD_MS
				const turn = `transform="rotate(${(Math.sin(t * Math.PI * 2) * SWING_DEG).toFixed(1)} 256 60)"`
				const frame = svg
					.replace(sign, turn)
					.replace(string, `<g id="string" ${turn}>`)
				link.href = `data:image/svg+xml,${encodeURIComponent(frame)}`
			}, FRAME_MS)
		})
		.catch(() => undefined)
}
