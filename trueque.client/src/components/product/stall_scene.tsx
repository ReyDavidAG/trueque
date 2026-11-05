import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { Art } from '@/components/ui/art'
import { PriceSign } from '@/components/ui/price_sign'
import { ROUTES } from '@/constants/routes'
import { useProductImages } from '@/hooks/market/use_images'
import type { Product } from '@/types/product_type'
import { cn } from '@/utils/cn'

type Part =
	| 'face'
	| 'eye'
	| 'stache'
	| 'pull'
	| 'shoulder'
	| 'belly'
	| 'arm'
	| 'hat'
	| 'goods'
	| 'throw'
	| 'bonk'
	| 'hatBack'
	| 'nose'
	| 'five'
	| 'tip'
	| 'sign'
	| 'bell'
	| 'idle'
	| 'arrive'
	| 'cheek'
	| 'pit'
	| 'head'
type Dent = { id: number; x: number; y: number }
type Act = 'shrug' | 'laugh' | 'bonk' | 'wince' | 'honk' | 'swing' | 'ring'

const LINES: Record<Part, string[]> = {
	face: [
		'¿Qué tengo en la cara? ¿Polvo de cacao?',
		'Sí, así de guapo amanecí.',
		'No me apachurre los cachetes, que no soy tamal.',
		'¿Me vio cara de vendedor honrado? Pues sí lo soy.',
		'Mi mamá dice que salí igualito a mi abuelo.',
	],
	eye: [
		'¡Ay, mi ojo!',
		'¡Me picaste el ojo, joven!',
		'¡Ahora veo doble! Dos termos por el precio de uno… no, mentira.',
		'¡Con los ojos no, que con esos cuido la mercancía!',
	],
	stache: [
		'El bigote no se toca, joven.',
		'Tres años cultivándolo.',
		'Es bigote de concurso, ¿eh?',
		'Lo peino diario con cera de abeja.',
	],
	pull: [
		'¡Mi bigote no es resorte!',
		'¡Ay, ay, ay, suéltelo!',
		'¡Que no es de los que se despegan!',
		'¡Me va a dejar pelón del labio!',
	],
	shoulder: [
		'¿Mande?',
		'¿Sí, dígame? ¿Se le ofrece algo?',
		'¿Me buscaba? Aquí ando, a sus órdenes.',
		'Ah, es usted. ¿Ya se decidió?',
		'¿Qué pasó, marchante?',
	],
	belly: [
		'¡Jajaja, cosquillas no!',
		'Es pura tortilla, no se burle.',
		'¡Jijiji! ¡Ya, ya, me rindo!',
		'Este es mi almacén de tamales.',
	],
	arm: [
		'¡Ay, mi brazo!',
		'¿Me está saludando o qué?',
		'¡Que no es palanca de tragamonedas!',
		'Con ese brazo cargo las cajas, cuídemelo.',
	],
	hat: [
		'¡Oiga, mi sombrero!',
		'¡Devuélvame el sombrero!',
		'¡Se me va a asolear la calva!',
		'Ese sombrero era de mi papá, ¿eh?',
	],
	hatBack: [
		'Gracias, joven. Así me gusta.',
		'Ahora sí, bien presentable.',
		'Ya decía yo que usted era buena gente.',
	],
	goods: [
		'Ándele, chéquelo sin pena.',
		'Está bien bonito, ¿verdad?',
		'Calidad del grupo, nada de imitaciones.',
		'Agárrelo, siéntalo, enamórese.',
		'Ese es de los que más se llevan.',
	],
	throw: [
		'¡Cuidado con la mercancía!',
		'¡No me la avientes!',
		'¡Es para llevar, no para lanzar!',
		'¡Si se rompe, se lo cobro en cacaos!',
	],
	bonk: [
		'¡Auch! ¡Me dio en la cabeza!',
		'¡Oiga, eso no se avienta!',
		'¡Veo estrellitas… y cacaos!',
		'¡Buena puntería, pero mala educación!',
	],
	nose: [
		'¡Pip! ¿A poco soy claxon?',
		'Mi nariz no es timbre, joven.',
		'¡Ya me la dejó como jitomate!',
		'¡Pip pip! ¡Ya, que no soy camión!',
	],
	five: [
		'¡Chócala!',
		'¡Eso! ¡Buena onda!',
		'¡Así se saluda, marchante!',
		'¡Uy, qué mano tan firme!',
	],
	tip: [
		'¡Buenas! A sus órdenes.',
		'Pásele, está en su casa.',
		'Muy buenas tardes, ¿qué le damos?',
		'Un gusto atenderle.',
	],
	sign: [
		'Precio justo, aprobado por RH.',
		'No le hago descuento, ¿eh?',
		'Ni un cacao más, ni un cacao menos.',
		'Ese letrero lo pinté yo solito.',
	],
	bell: [
		'¡Ya voy, ya voy!',
		'¿Quién toca? ¡Ah, es usted!',
		'¡Aquí estoy, no se me desespere!',
		'Ya lo oí, ya lo oí.',
	],
	idle: [
		'¿Ya vio la pizarra? Ahí viene todo.',
		'Los cacaos se ganan en Chispa, ¿eh? Proponga ideas.',
		'Se usan primero los cacaos que vencen más pronto.',
		'Con el cupón pasa a recogerlo, así de fácil.',
		'Hoy está bonito el día para un trueque.',
		'Aquí no se regatea, pero sí se platica.',
		'¿Le cuento un chiste? Mejor otro día.',
		'Si tiene dudas, pregúnteme sin pena.',
	],
	cheek: [
		'¡Mis cachetes!',
		'No soy masa de tortilla, joven.',
		'¿Me está midiendo lo cachetón?',
		'¡Ay! Mi abuela me los pellizcaba igual.',
	],
	pit: [
		'¡Jajaja! ¡Ahí no, ahí no!',
		'¡Las axilas no, que soy bien cosquilludo!',
		'¡Jijiji! ¡Pare, que se me cae la mercancía!',
		'¡Uy! Ahí ni mi señora me toca.',
	],
	head: [
		'¡No se me quede viendo la calva!',
		'Por eso uso sombrero, ¿ve?',
		'Es que me peino con toalla.',
		'Antes tenía rizos, se lo juro.',
		'¡Brilla, pero no es para que la toque!',
	],
	arrive: [
		'¡Ya voy, ya voy! ¿Quién toca?',
		'¡Uy, perdón, estaba acomodando cajas!',
	],
}
const short = (n: number) => [
	`Le faltan ${n} cacaos, marchante. Pero ahí se lo aparto con la mirada.`,
	`Nomás ${n} cacaos más y es suyo.`,
	`Échele ganas en Chispa, le faltan ${n} cacaos.`,
	'Todavía no le alcanza, pero no se me desanime.',
]
const ACT: Partial<Record<Part, Act>> = {
	shoulder: 'shrug',
	belly: 'laugh',
	pit: 'laugh',
	bonk: 'bonk',
	pull: 'wince',
	nose: 'honk',
	sign: 'swing',
	bell: 'ring',
	five: 'laugh',
}
const ANNOYING: Part[] = [
	'face',
	'eye',
	'stache',
	'pull',
	'belly',
	'arm',
	'hat',
	'throw',
	'bonk',
	'nose',
	'cheek',
	'pit',
	'head',
]
const TIP_MS = 700
const ARRIVE_MS = 700
const IDLE_MS = 11000
const BRIM = 44 / 56
const LOOK = 3.5
const ACT_MS = 650
const BONK_SPEED = 500
const ARM_REST = -2.3
const WARN = ['Ya, ya… me estás desesperando.', 'Una más y te saco del puesto, ¿eh?']
const ANGRY = '¡Ya me hiciste enojar! ¡Fuera de mi puesto!'
const WARN_AT = 6
const ANGRY_AT = 9
const CALM_MS = 5000
const QUIP_MS = 3000
const KICK_MS = 2200
const GRAVITY = 2400
const BOUNCE = 0.35
const THROW_SPEED = 1100
const MAX_SPEED = 1800
const HAT_SNAP = 60
const ARM_K = 60
const ARM_DAMP = 7
const TAP_PX = 6

interface Body {
	x: number
	y: number
	vx: number
	vy: number
	a: number
	va: number
	w: number
	h: number
	held: boolean
	attached: boolean
	px: number
	py: number
	pt: number
}

const body = (): Body => ({
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	a: 0,
	va: 0,
	w: 0,
	h: 0,
	held: false,
	attached: false,
	px: 0,
	py: 0,
	pt: 0,
})

function VendorBody({
	shut,
	wink,
	dents,
}: {
	shut: boolean
	wink: number | null
	dents: Dent[]
}) {
	return (
		<svg className='stall3__vendor-svg' viewBox='0 0 160 230' aria-hidden='true'>
			<g data-part='belly'>
				<path className='v-shirt' d='M22 170c0-34 26-52 58-52s58 18 58 52v60H22z' />
				<g data-dent>
					<path className='v-apron' d='M48 140h64v90H48z' />
					<path className='v-pocket' d='M64 176h32v20H64z' />
				</g>
			</g>
			<g data-part='pit'>
				<circle className='v-hit' cx='46' cy='160' r='11' />
				<circle className='v-hit' cx='114' cy='160' r='11' />
			</g>
			<g data-part='shoulder'>
				<ellipse data-dent className='v-shirt' cx='34' cy='140' rx='18' ry='14' />
				<ellipse data-dent className='v-shirt' cx='126' cy='140' rx='18' ry='14' />
			</g>
			<rect className='v-skin' x='70' y='100' width='20' height='22' />
			<g data-part='face'>
				<circle className='v-skin' cx='80' cy='72' r='38' />
				<path className='v-brow' d='M54 52l18 7M106 52l-18 7' />
			</g>
			<g data-part='head'>
				<path className='v-hit' d='M48 52a38 38 0 0 1 64 0z' />
				<ellipse className='v-shine' cx='68' cy='44' rx='9' ry='4' transform='rotate(-24 68 44)' />
			</g>
			<g data-part='cheek'>
				<circle data-dent className='v-cheek' cx='56' cy='84' r='7' />
				<circle data-dent className='v-cheek' cx='104' cy='84' r='7' />
				<circle className='v-hit' cx='56' cy='84' r='10' />
				<circle className='v-hit' cx='104' cy='84' r='10' />
			</g>
			<g data-part='eye'>
				<circle className='v-white' cx='66' cy='66' r='8' />
				<circle className='v-white' cx='94' cy='66' r='8' />
				<g className='v-pupils'>
					{[66, 94].map((x, i) => (
						<circle
							key={x}
							className={cn('v-eye', (shut || wink === i) && 'is-shut')}
							cx={x}
							cy='66'
							r='4.5'
						/>
					))}
				</g>
				<circle data-eye='0' className='v-hit' cx='66' cy='66' r='11' />
				<circle data-eye='1' className='v-hit' cx='94' cy='66' r='11' />
			</g>
			<g data-part='nose'>
				<ellipse className='v-nose' cx='80' cy='79' rx='7' ry='6' />
			</g>
			<g data-part='stache' className='v-stache-g'>
				<path
					className='v-stache'
					d='M58 88c9-9 15-9 22-3 7-6 13-6 22 3-9 8-15 5-22 2-7 3-13 6-22-2z'
				/>
			</g>
			<rect className='v-shirt' x='14' y='140' width='26' height='80' rx='13' transform='rotate(8 27 140)' />
			{dents.map(d => (
				<circle key={d.id} className='v-dimple' cx={d.x} cy={d.y} r='6' />
			))}
		</svg>
	)
}

function Hat() {
	return (
		<svg viewBox='0 0 140 56' aria-hidden='true'>
			<ellipse className='v-hat' cx='70' cy='44' rx='68' ry='9' />
			<path className='v-hat' d='M34 45c0-27 15-41 36-41s36 14 36 41z' />
			<path className='v-band' d='M35 33h70v10H35z' />
		</svg>
	)
}

function Arm() {
	return (
		<svg viewBox='0 0 40 120' aria-hidden='true'>
			<rect className='v-shirt' x='6' y='0' width='28' height='86' rx='14' />
			<circle className='v-skin' cx='20' cy='98' r='16' />
		</svg>
	)
}

export function StallScene({
	product,
	greeting,
	label,
	missing,
}: {
	product: Product
	greeting: string
	label: ReactNode
	missing: number
}) {
	const navigate = useNavigate()
	const images = useProductImages(product.id, product.hasImages)
	const photo = images.data?.[0]?.data
	const room = useRef<HTMLDivElement>(null)
	const vendorEl = useRef<HTMLDivElement>(null)
	const armEl = useRef<HTMLDivElement>(null)
	const hatEl = useRef<HTMLDivElement>(null)
	const goodsEl = useRef<HTMLDivElement>(null)
	const [quip, setQuip] = useState<string | null>(null)
	const [angry, setAngry] = useState(false)
	const [act, setAct] = useState<Act | null>(null)
	const say = useRef<(part: Part) => void>(() => undefined)
	const timers = useRef<number[]>([])
	const pokes = useRef({ n: 0, at: 0, turn: 0 })
	const pulled = useRef(false)
	const [here, setHere] = useState(false)
	const arrived = useRef<number | null>(null)
	const lastTalk = useRef(0)
	const [wink, setWink] = useState<number | null>(null)
	const [dents, setDents] = useState<Dent[]>([])
	const dentId = useRef(0)

	useEffect(() => {
		say.current = part => {
			if (angry) return
			const p = pokes.current
			const now = Date.now()
			lastTalk.current = now
			p.turn += 1
			const move = ACT[part]
			if (move) {
				setAct(move)
				timers.current.push(
					window.setTimeout(() => setAct(a => (a === move ? null : a)), ACT_MS)
				)
			}
			if (ANNOYING.includes(part)) {
				p.n = now - p.at > CALM_MS ? 1 : p.n + 1
				p.at = now
			}
			if (p.n >= ANGRY_AT) {
				setAngry(true)
				setQuip(ANGRY)
				timers.current.push(window.setTimeout(() => navigate(ROUTES.market), KICK_MS))
				return
			}
			const lines =
				p.n >= WARN_AT && ANNOYING.includes(part)
					? WARN
					: missing > 0 && (part === 'goods' || part === 'sign' || part === 'idle')
						? short(missing)
						: LINES[part]
			const line =
				part === 'idle'
					? lines[Math.floor(Math.random() * lines.length)]
					: lines[p.turn % lines.length]
			setQuip(line)
			timers.current.push(
				window.setTimeout(() => setQuip(q => (q === line ? null : q)), QUIP_MS)
			)
		}
	}, [angry, navigate, missing])

	useEffect(() => {
		const list = timers.current
		return () => list.forEach(clearTimeout)
	}, [])

	useEffect(() => {
		if (!here || angry) return
		const id = window.setInterval(() => {
			if (Date.now() - lastTalk.current > IDLE_MS) say.current('idle')
		}, 3000)
		return () => clearInterval(id)
	}, [here, angry])

	const ring = () => {
		if (here) return say.current('bell')
		arrived.current = performance.now()
		setHere(true)
		say.current('arrive')
	}

	useEffect(() => {
		const el = room.current
		const vendor = vendorEl.current
		const armNode = armEl.current
		const hatNode = hatEl.current
		const goodsNode = goodsEl.current
		if (!el || !vendor || !armNode || !hatNode || !goodsNode) return
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
		const goods = body()
		const hat = body()
		hat.attached = true
		const arm = { a: ARM_REST, va: 0, held: false, target: ARM_REST }
		const stache = { a: 0, va: 0, s: 1, vs: 0, held: false, x: 0, y: 0, moved: false }
		const stacheNode = el.querySelector<SVGGElement>('.v-stache-g')
		const size = {
			w: 0,
			h: 0,
			head: { x: 0, y: 0 },
			face: { x: 0, y: 0, r: 0 },
			shoulder: { x: 0, y: 0 },
		}
		const lift = { y: 0 }
		let placed = false
		let lastBonk = 0
		let tipAt = -1e9
		const look = { x: 0, y: 0, at: -1e9, px: 0, py: 0 }
		const pupils = el.querySelector<SVGGElement>('.v-pupils')
		const watch = (e: PointerEvent) => {
			const p = local(e)
			look.x = p.x
			look.y = p.y
			look.at = performance.now()
		}
		el.addEventListener('pointermove', watch)

		const measure = () => {
			const v = {
				left: vendor.offsetLeft,
				top: vendor.offsetTop,
				width: vendor.offsetWidth,
				height: vendor.offsetHeight,
			}
			size.w = el.clientWidth
			size.h = el.clientHeight
			size.head = { x: v.left + v.width * 0.5, y: v.top + v.height * 0.183 }
			size.face = { x: v.left + v.width * 0.5, y: v.top + v.height * 0.31, r: v.width * 0.24 }
			size.shoulder = { x: v.left + v.width * 0.79, y: v.top + v.height * 0.614 }
			goods.w = goods.h = Math.min(size.w * 0.34, size.h * 0.42, 220)
			hat.w = v.width * 0.95
			hat.h = hat.w * (56 / 140)
			goodsNode.style.width = `${goods.w}px`
			goodsNode.style.height = `${goods.h}px`
			hatNode.style.width = `${hat.w}px`
			hatNode.style.height = `${hat.h}px`
			if (!placed) {
				goods.x = size.w * 0.4
				goods.y = size.h - goods.h
				placed = true
			}
		}
		const resize = new ResizeObserver(measure)
		resize.observe(el)
		measure()

		const local = (e: PointerEvent) => {
			const r = el.getBoundingClientRect()
			return { x: e.clientX - r.left - el.clientLeft, y: e.clientY - r.top - el.clientTop }
		}
		const grab = (b: Body, node: HTMLElement, part: Part) => {
			let start = { x: 0, y: 0 }
			let off = { x: 0, y: 0 }
			let moved = false
			const down = (e: PointerEvent) => {
				e.preventDefault()
				node.setPointerCapture(e.pointerId)
				const p = local(e)
				start = p
				moved = false
				off = { x: p.x - b.x, y: p.y - b.y }
				b.held = true
				b.px = p.x
				b.py = p.y
				b.pt = performance.now()
				b.vx = b.vy = 0
			}
			const move = (e: PointerEvent) => {
				if (!b.held) return
				const p = local(e)
				if (!moved && Math.hypot(p.x - start.x, p.y - start.y) > TAP_PX) {
					moved = true
					if (b === hat && hat.attached) {
						hat.attached = false
						say.current('hat')
					}
				}
				if (b === hat && hat.attached) return
				const now = performance.now()
				const dt = Math.max(1, now - b.pt) / 1000
				b.vx = (p.x - b.px) / dt
				b.vy = (p.y - b.py) / dt
				b.px = p.x
				b.py = p.y
				b.pt = now
				b.x = p.x - off.x
				b.y = p.y - off.y
			}
			const up = () => {
				if (!b.held) return
				b.held = false
				if (performance.now() - b.pt > 80) b.vx = b.vy = 0
				const speed = Math.hypot(b.vx, b.vy)
				if (speed > MAX_SPEED) {
					b.vx *= MAX_SPEED / speed
					b.vy *= MAX_SPEED / speed
				}
				b.va = b.vx * 0.01
				if (!moved && b === hat && hat.attached) {
					tipAt = performance.now()
					say.current('tip')
				} else if (!moved) say.current(part)
				else if (b === goods && speed > THROW_SPEED) say.current('throw')
				if (b === hat && !hat.attached) {
					const d = Math.hypot(
						hat.x - size.head.x,
						hat.y + hat.h * BRIM - size.head.y - lift.y
					)
					if (d < Math.max(HAT_SNAP, hat.w * 0.35)) {
						hat.attached = true
						say.current('hatBack')
					}
				}
			}
			node.addEventListener('pointerdown', down)
			node.addEventListener('pointermove', move)
			node.addEventListener('pointerup', up)
			node.addEventListener('pointercancel', up)
			node.addEventListener('lostpointercapture', up)
			return () => {
				node.removeEventListener('pointerdown', down)
				node.removeEventListener('pointermove', move)
				node.removeEventListener('pointerup', up)
				node.removeEventListener('pointercancel', up)
				node.removeEventListener('lostpointercapture', up)
			}
		}
		const offGoods = grab(goods, goodsNode, 'goods')
		const offHat = grab(hat, hatNode, 'hat')

		let armStart = { x: 0, y: 0 }
		let armMoved = false
		const armDown = (e: PointerEvent) => {
			e.preventDefault()
			armNode.setPointerCapture(e.pointerId)
			armStart = local(e)
			armMoved = false
			arm.held = true
		}
		const armMove = (e: PointerEvent) => {
			if (!arm.held) return
			const p = local(e)
			if (Math.hypot(p.x - armStart.x, p.y - armStart.y) > TAP_PX) armMoved = true
			arm.target = Math.atan2(-(p.x - size.shoulder.x), p.y - size.shoulder.y - lift.y)
		}
		const armUp = () => {
			if (!arm.held) return
			arm.held = false
			if (!armMoved) arm.va += 14
			say.current(armMoved ? 'arm' : 'five')
		}
		armNode.addEventListener('pointerdown', armDown)
		armNode.addEventListener('pointermove', armMove)
		armNode.addEventListener('pointerup', armUp)
		armNode.addEventListener('pointercancel', armUp)

		const stacheDown = (e: PointerEvent) => {
			if (!stacheNode) return
			stacheNode.setPointerCapture(e.pointerId)
			const p = local(e)
			stache.held = true
			stache.moved = false
			stache.x = p.x
			stache.y = p.y
			pulled.current = false
		}
		const stacheMove = (e: PointerEvent) => {
			if (!stache.held) return
			const p = local(e)
			const dx = p.x - stache.x
			const dy = p.y - stache.y
			if (Math.hypot(dx, dy) > TAP_PX) {
				stache.moved = true
				pulled.current = true
			}
			stache.a = Math.max(-0.6, Math.min(0.6, dx * 0.012))
			stache.s = 1 + Math.min(0.7, Math.hypot(dx, dy) * 0.006)
		}
		const stacheUp = () => {
			if (!stache.held) return
			stache.held = false
			if (stache.moved) say.current('pull')
		}
		stacheNode?.addEventListener('pointerdown', stacheDown)
		stacheNode?.addEventListener('pointermove', stacheMove)
		stacheNode?.addEventListener('pointerup', stacheUp)
		stacheNode?.addEventListener('pointercancel', stacheUp)

		const step = (b: Body, dt: number) => {
			if (b.held || b.attached) return
			b.vy += GRAVITY * dt
			b.x += b.vx * dt
			b.y += b.vy * dt
			b.a += b.va * dt
			const floor = size.h - b.h
			if (b.y > floor) {
				b.y = floor
				b.vy = Math.abs(b.vy) < 120 ? 0 : -b.vy * BOUNCE
				b.vx *= 0.82
				b.va *= 0.6
				b.a *= 0.85
			}
			if (b.y < -size.h * 0.4) {
				b.y = -size.h * 0.4
				b.vy = Math.abs(b.vy) * BOUNCE
			}
			if (b.x < b.w / 2) {
				b.x = b.w / 2
				b.vx = Math.abs(b.vx) * 0.5
			}
			if (b.x > size.w - b.w / 2) {
				b.x = size.w - b.w / 2
				b.vx = -Math.abs(b.vx) * 0.5
			}
		}

		let frame = 0
		let prev = performance.now()
		const tick = (now: number) => {
			const dt = Math.min((now - prev) / 1000, 1 / 30)
			prev = now
			const since = arrived.current == null ? 0 : reduced ? 1 : (now - arrived.current) / ARRIVE_MS
			const t = Math.min(1, since)
			const rise = 1 - (1 - t) ** 3
			const bob = (reduced ? 0 : Math.sin(now / 700) * 3) + (1 - rise) * size.h * 0.75
			vendor.style.transform = `translateY(${bob}px)`
			lift.y = bob
			step(goods, dt)
			step(hat, dt)
			if (hat.attached) {
				hat.x = size.head.x
				const tip = (now - tipAt) / TIP_MS
				const raise = tip < 1 ? Math.sin(Math.PI * tip) : 0
				hat.y = size.head.y - hat.h * BRIM + bob - raise * hat.h * 0.7
				hat.a = -raise * 0.3
				hat.vx = hat.vy = hat.va = 0
			}
			if (pupils) {
				const active = now - look.at < 2500
				const tx = (active ? look.x : goods.x) - size.face.x
				const ty = (active ? look.y : goods.y + goods.h / 2) - size.face.y - bob
				const d = Math.hypot(tx, ty) || 1
				const k = Math.min(1, d / 120) * LOOK
				look.px += ((tx / d) * k - look.px) * Math.min(1, dt * 10)
				look.py += ((ty / d) * k - look.py) * Math.min(1, dt * 10)
				pupils.style.transform = `translate(${look.px}px, ${look.py}px)`
			}
			const rest = ARM_REST + (reduced ? 0 : Math.sin(now / 420) * 0.22)
			if (arm.held) arm.a += (arm.target - arm.a) * Math.min(1, dt * 18)
			else {
				arm.va += (-(arm.a - rest) * ARM_K - arm.va * ARM_DAMP) * dt
				arm.a += arm.va * dt
			}
			armNode.style.transform = `rotate(${arm.a}rad)`
			if (!stache.held) {
				stache.va += (-stache.a * 120 - stache.va * 6) * dt
				stache.a += stache.va * dt
				stache.vs += (-(stache.s - 1) * 160 - stache.vs * 7) * dt
				stache.s += stache.vs * dt
			}
			if (stacheNode)
				stacheNode.style.transform = `rotate(${stache.a}rad) scaleX(${stache.s})`
			const speed = Math.hypot(goods.vx, goods.vy)
			const gx = goods.x - size.face.x
			const gy = goods.y + goods.h / 2 - size.face.y - bob
			if (
				!goods.held &&
				rise === 1 &&
				speed > BONK_SPEED &&
				now - lastBonk > 900 &&
				Math.hypot(gx, gy) < size.face.r + goods.w * 0.35
			) {
				lastBonk = now
				goods.vx = -goods.vx * 0.5
				goods.vy = -Math.abs(goods.vy) * 0.4
				say.current('bonk')
			}
			goodsNode.style.transform = `translate(${goods.x - goods.w / 2}px, ${goods.y}px) rotate(${goods.a}rad)`
			hatNode.style.transform = `translate(${hat.x - hat.w / 2}px, ${hat.y}px) rotate(${hat.a}rad)`
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)

		return () => {
			cancelAnimationFrame(frame)
			resize.disconnect()
			el.removeEventListener('pointermove', watch)
			offGoods()
			offHat()
			armNode.removeEventListener('pointerdown', armDown)
			armNode.removeEventListener('pointermove', armMove)
			armNode.removeEventListener('pointerup', armUp)
			armNode.removeEventListener('pointercancel', armUp)
			stacheNode?.removeEventListener('pointerdown', stacheDown)
			stacheNode?.removeEventListener('pointermove', stacheMove)
			stacheNode?.removeEventListener('pointerup', stacheUp)
			stacheNode?.removeEventListener('pointercancel', stacheUp)
		}
	}, [])

	const talk = (e: MouseEvent<HTMLButtonElement>) => {
		if (pulled.current) {
			pulled.current = false
			return
		}
		const target = e.target as Element
		const group = target.closest('[data-part]')
		const ctm = target.closest('svg')?.getScreenCTM()
		if (group && ctm && e.detail > 0) {
			const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
			const id = ++dentId.current
			setDents(d => [...d.slice(-3), { id, x: pt.x, y: pt.y }])
			timers.current.push(window.setTimeout(() => setDents(d => d.filter(x => x.id !== id)), 600))
			const dent = [...group.querySelectorAll<SVGGraphicsElement>('[data-dent]')]
				.map(el => {
					const b = el.getBBox()
					return { el, d: Math.hypot(b.x + b.width / 2 - pt.x, b.y + b.height / 2 - pt.y) }
				})
				.sort((a, b) => a.d - b.d)[0]?.el
			if (dent) {
				dent.classList.remove('is-dent')
				dent.getBoundingClientRect()
				dent.classList.add('is-dent')
			}
		}
		const eye = target.getAttribute('data-eye')
		if (eye) {
			const i = Number(eye)
			setWink(i)
			timers.current.push(window.setTimeout(() => setWink(w => (w === i ? null : w)), ACT_MS))
		}
		const part = target.closest('[data-part]')?.getAttribute('data-part')
		say.current((part as Part | null) ?? 'belly')
	}

	return (
		<section
			className={cn('stall3', angry && 'is-angry', !here && 'is-away', act && `do-${act}`)}
			data-stall={product.stall}>
			<div className='stall3__roof' aria-hidden='true' />
			<div className='stall__awning stall3__awning' aria-hidden='true' />
			<div ref={room} className='stall3__room'>
				<button
					type='button'
					className='stall3__sign-btn'
					aria-label={`Precio: ${product.price} cacaos`}
					onClick={() => say.current('sign')}>
					<PriceSign price={product.price} className='stall3__sign' />
				</button>
				<button
					type='button'
					className='stall3__bell'
					aria-label='Tocar la campana'
					onClick={ring}>
					<svg viewBox='0 0 48 48' aria-hidden='true'>
						<path className='v-bell' d='M8 36c0-12 7-20 16-20s16 8 16 20z' />
						<path className='v-base' d='M4 36h40v6H4z' />
						<circle className='v-bell' cx='24' cy='13' r='3.5' />
					</svg>
				</button>
				<div ref={vendorEl} className='stall3__vendor'>
					<button
						type='button'
						className='stall3__talk'
						aria-label='Platicar con el vendedor'
						onClick={talk}>
						<VendorBody shut={act === 'wince'} wink={wink} dents={dents} />
					</button>
					<div ref={armEl} className='stall3__arm'>
						<Arm />
					</div>
				</div>
				{here ? (
					<p className='stall3__bubble' aria-live='polite' key={quip ?? greeting}>
						{quip ?? greeting}
					</p>
				) : (
					<p className='stall3__note'>Toca la campana para que te atiendan</p>
				)}
				<div ref={hatEl} className='stall3__hat' aria-hidden='true'>
					<Hat />
				</div>
				<div ref={goodsEl} className='stall3__goods'>
					{photo ? (
						<img src={photo} alt={product.name} draggable={false} />
					) : (
						<Art id={product.art} label={product.name} />
					)}
				</div>
			</div>
			<div className='stall3__counter'>{label}</div>
			<p className='stall3__tips'>
				{here
					? 'Arrastra el producto, quítale el sombrero, jálale el bigote o chócala.'
					: 'El vendedor salió un momento.'}
			</p>
		</section>
	)
}
