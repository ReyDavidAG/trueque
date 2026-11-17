import { useEffect, useId, useRef, useState } from 'react'

import { HenBird } from '@/components/wallet/coopHen'
import { STALL_LOOKS } from '@/constants/stallLooks'
import { type EggSpot, useEggCracks } from '@/hooks/ui/useEggCracks'
import { cn } from '@/utils/cn'

const WIDTH = 960
const TOP = 70
const HEIGHT = 420
const STALL_W = 280
const STALL_GAP = 40
const LEFT = (WIDTH - 3 * STALL_W - 2 * STALL_GAP) / 2
const STRIPES = 7
const CLUCK_MS = 1100

const ORDER = [2, 0, 1] as const
const stallX = (i: number) => LEFT + i * (STALL_W + STALL_GAP)

const HEN_RANGE = 80
const HENS = [0, 1, 2].map(i => ({
	breed: i,
	y: 462,
	from: stallX(i) + STALL_W / 2 - HEN_RANGE,
	to: stallX(i) + STALL_W / 2 + HEN_RANGE,
	dur: 9,
}))

const gapX = (i: number) => stallX(i) + STALL_W + STALL_GAP / 2

const GROUND_EGGS: EggSpot[] = [0, 1].flatMap(i => [
	{ id: `g${i}a`, x: gapX(i) - 11, y: 446, tone: '--color-cascara' },
	{ id: `g${i}b`, x: gapX(i) + 11, y: 446, tone: '--color-cascara-roja' },
])

const GROUND_COINS = [0, 1, 2].flatMap(i => [
	[stallX(i) + 40, 452],
	[stallX(i) + STALL_W - 40, 452],
])

const stripePath = (x: number, k: number) => {
	const top = (t: number) => x + 12 + t * (STALL_W - 24)
	const bottom = (t: number) => x - 6 + t * (STALL_W + 12)
	const a = k / STRIPES
	const b = (k + 1) / STRIPES
	return `M${bottom(a)} 112L${top(a)} 84H${top(b)}L${bottom(b)} 112z`
}

const counterEggs = (i: number, look: (typeof STALL_LOOKS)[number]) =>
	Array.from({ length: 5 }, (_, k) => ({
		id: `s${i}-${k}`,
		x: stallX(i) + 62 + k * 39,
		y: 258,
		tone: look.eggs[k % look.eggs.length],
	}))

function Egg({
	egg,
	broken,
	onCrack,
}: {
	egg: EggSpot
	broken: boolean
	onCrack: (egg: EggSpot) => void
}) {
	if (broken) return null
	return (
		<ellipse
			className='s2d-egg'
			cx={egg.x}
			cy={egg.y}
			rx='11'
			ry='14'
			style={{ fill: `var(${egg.tone})` }}
			onClick={() => onCrack(egg)}
		/>
	)
}

function Coin({ x, y }: { x: number; y: number }) {
	return (
		<g className='s2d-coin' transform={`translate(${x} ${y})`}>
			<ellipse rx='13' ry='6' className='s2d-coin__rim' />
			<ellipse rx='9' ry='3.6' className='s2d-coin__face' />
			<ellipse rx='5' ry='2' className='s2d-coin__yolk' />
		</g>
	)
}

function Stall({
	i,
	ids,
	broken,
	onCrack,
}: {
	i: number
	ids: { vichy: string; slats: string }
	broken: Set<string>
	onCrack: (egg: EggSpot) => void
}) {
	const look = STALL_LOOKS[ORDER[i]]
	const x = stallX(i)
	return (
		<g className='s2d-stall' style={{ '--i': i }}>
			<rect
				className='s2d-post'
				x={x + 14}
				y='118'
				width='18'
				height='278'
				rx='6'
			/>
			<rect
				className='s2d-post'
				x={x + STALL_W - 32}
				y='118'
				width='18'
				height='278'
				rx='6'
			/>
			<g className='s2d-counter'>
				<rect
					className='s2d-front'
					x={x + 34}
					y='282'
					width={STALL_W - 68}
					height='108'
					fill={`url(#${ids.slats})`}
				/>
				<rect
					x={x + 34}
					y='282'
					width={STALL_W - 68}
					height='12'
					fill={`url(#${ids.vichy})`}
				/>
				<rect
					className='s2d-slab'
					x={x + 26}
					y='268'
					width={STALL_W - 52}
					height='16'
					rx='4'
				/>
				<rect
					className='s2d-line'
					x={x + 34}
					y='282'
					width={STALL_W - 68}
					height='108'
				/>
			</g>
			{counterEggs(i, look).map(egg => (
				<Egg
					key={egg.id}
					egg={egg}
					broken={broken.has(egg.id)}
					onCrack={onCrack}
				/>
			))}
			<g className='s2d-awning'>
				<path
					className='s2d-roof'
					d={`M${x - 6} 112l18-28h${STALL_W - 24}l18 28z`}
				/>
				{Array.from({ length: STRIPES }, (_, k) => k)
					.filter(k => k % 2)
					.map(k => (
						<path key={k} className='s2d-stripe' d={stripePath(x, k)} />
					))}
				<rect
					className='s2d-valance'
					x={x - 6}
					y='110'
					width={STALL_W + 12}
					height='14'
					rx='3'
				/>
				{Array.from({ length: 8 }, (_, k) => (
					<circle
						key={k}
						className={k % 2 ? 's2d-ball is-light' : 's2d-ball'}
						cx={x + 6 + k * ((STALL_W - 12) / 7)}
						cy='128'
						r='12'
					/>
				))}
			</g>
			<g className='s2d-sign' style={{ '--sx': x + 140 }}>
				<path
					className='s2d-string'
					d={`M${x + 104} 140v14M${x + 176} 140v14`}
				/>
				<rect
					className='s2d-card'
					x={x + 66}
					y='152'
					width='148'
					height='80'
					rx='6'
				/>
				<rect
					x={x + 69}
					y='155'
					width='142'
					height='10'
					fill={`url(#${ids.vichy})`}
				/>
				<text className='s2d-kind' x={x + 140} y='182' textAnchor='middle'>
					{look.kind.toUpperCase()}
				</text>
				<text className='s2d-price' x={x + 140} y='210' textAnchor='middle'>
					{look.price}
					<tspan className='s2d-unit' dx='4'>
						yemas
					</tspan>
				</text>
				<rect
					className='s2d-band'
					x={x + 66}
					y='216'
					width='148'
					height='16'
					rx='0'
				/>
				<text
					className='s2d-band__text'
					x={x + 140}
					y='228'
					textAnchor='middle'>
					{look.unit}
				</text>
			</g>
		</g>
	)
}

export function StallsScene() {
	const uid = useId().replace(/:/g, '')
	const ids = { vichy: `${uid}-vichy`, slats: `${uid}-slats` }
	const { broken, bursts, crack } = useEggCracks()
	const [cluck, setCluck] = useState<number | null>(null)
	const timer = useRef(0)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const poke = (i: number) => {
		window.clearTimeout(timer.current)
		setCluck(i)
		timer.current = window.setTimeout(() => setCluck(null), CLUCK_MS)
	}

	return (
		<svg
			className='stalls2d'
			viewBox={`0 ${TOP} ${WIDTH} ${HEIGHT}`}
			preserveAspectRatio='xMidYMin meet'
			role='img'
			aria-label='Tres puestos de huevo con sus precios en yemas y gallinas paseando'>
			<defs>
				<pattern
					id={ids.vichy}
					width='10'
					height='10'
					patternUnits='userSpaceOnUse'>
					<rect width='10' height='10' className='s2d-vichy-a' />
					<rect width='5' height='5' className='s2d-vichy-b' />
					<rect x='5' y='5' width='5' height='5' className='s2d-vichy-c' />
				</pattern>
				<pattern
					id={ids.slats}
					width='24'
					height='10'
					patternUnits='userSpaceOnUse'>
					<rect width='24' height='10' className='s2d-slat-a' />
					<rect width='12' height='10' className='s2d-slat-b' />
				</pattern>
			</defs>
			<ellipse
				className='s2d-shadow'
				cx={WIDTH / 2}
				cy='436'
				rx='470'
				ry='34'
			/>
			{[0, 1, 2].map(i => (
				<Stall key={i} i={i} ids={ids} broken={broken} onCrack={crack} />
			))}
			{GROUND_COINS.map(([x, y]) => (
				<Coin key={`${x}-${y}`} x={x} y={y} />
			))}
			{HENS.map((hen, i) => (
				<g
					key={i}
					className='s2d-walker'
					style={{
						'--from': `${hen.from}px`,
						'--to': `${hen.to}px`,
						'--dur': `${hen.dur}s`,
						'--y': `${hen.y}px`,
					}}>
					<g className='s2d-face'>
						<g
							className={cn('s2d-hen', cluck === i && 'is-clucking')}
							transform='translate(-38 -66) scale(0.55)'
							onClick={() => poke(i)}>
							<g
								className={`coop-hen coop-hen--${['white', 'red', 'brown'][hen.breed]}`}>
								<path className='s2d-leg' d='M58 92l-4 22M78 92l4 22' />
								<HenBird />
							</g>
						</g>
					</g>
					{cluck === i && (
						<g transform='translate(0 -80)'>
							<g className='s2d-cluck'>
								<rect x='-30' y='-16' width='60' height='24' rx='12' />
								<text y='1' textAnchor='middle'>
									¡Cloc!
								</text>
							</g>
						</g>
					)}
				</g>
			))}
			{GROUND_EGGS.map(egg => (
				<Egg
					key={egg.id}
					egg={egg}
					broken={broken.has(egg.id)}
					onCrack={crack}
				/>
			))}
			{bursts.map(b => (
				<g
					key={b.id}
					className='s2d-burst'
					transform={`translate(${b.x} ${b.y})`}>
					<ellipse className='s2d-splat' rx='16' ry='5' cy='12' />
					<path className='s2d-shell' d='M-14 10a12 12 0 0 1 12-12l-3 6 4 4z' />
					<path className='s2d-shell' d='M14 10a12 12 0 0 0-12-12l3 6-4 4z' />
					{b.coins.map((dx, k) => (
						<g
							key={k}
							className='s2d-fly'
							style={{ '--dx': `${dx}px`, '--k': k }}>
							<Coin x={0} y={0} />
						</g>
					))}
				</g>
			))}
		</svg>
	)
}
