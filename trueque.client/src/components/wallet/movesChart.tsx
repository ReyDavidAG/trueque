import { useState } from 'react'

export type MonthBar = {
	key: string
	label: string
	earned: number
	spent: number
}

const W = 600
const H = 250
const MID = 122
const REACH = 86
const BAR = 26
const R = 4

const bar = (x: number, h: number, up: boolean) => {
	if (h <= 0) return ''
	const r = Math.min(R, h)
	const y = up ? MID - h : MID + h
	return up
		? `M${x} ${MID}V${y + r}q0 ${-r} ${r} ${-r}h${BAR - 2 * r}q${r} 0 ${r} ${r}V${MID}z`
		: `M${x} ${MID}V${y - r}q0 ${r} ${r} ${r}h${BAR - 2 * r}q${r} 0 ${r} ${-r}V${MID}z`
}

export function MovesChart({ months }: { months: MonthBar[] }) {
	const [hover, setHover] = useState<number | null>(null)
	const top = Math.max(1, ...months.flatMap(m => [m.earned, m.spent]))
	const col = W / months.length
	const scale = (v: number) => (v / top) * REACH
	const tip = hover === null ? null : months[hover]

	return (
		<div className='mchart' onPointerLeave={() => setHover(null)}>
			<svg
				className='mchart__svg'
				viewBox={`0 0 ${W} ${H}`}
				role='img'
				aria-label='Cacaos ganados y cambiados por mes'>
				<line className='mchart__base' x1='0' x2={W} y1={MID} y2={MID} />
				{months.map((m, i) => {
					const cx = col * i + col / 2
					const eh = scale(m.earned)
					const sh = scale(m.spent)
					return (
						<g
							key={m.key}
							className={hover === i ? 'mchart__col is-hover' : 'mchart__col'}
							style={{ '--i': i }}>
							<rect
								className='mchart__hit'
								x={col * i}
								y='0'
								width={col}
								height={H}
								onPointerEnter={() => setHover(i)}
							/>
							<path
								className='mchart__bar is-earn'
								d={bar(cx - BAR - 1, eh, true)}
							/>
							<path
								className='mchart__bar is-spend'
								d={bar(cx + 1, sh, false)}
							/>
							{m.earned > 0 && (
								<text
									className='mchart__val'
									x={cx - BAR / 2 - 1}
									y={MID - eh - 6}
									textAnchor='middle'>
									{m.earned}
								</text>
							)}
							{m.spent > 0 && (
								<text
									className='mchart__val'
									x={cx + BAR / 2 + 1}
									y={MID + sh + 15}
									textAnchor='middle'>
									−{m.spent}
								</text>
							)}
							<text
								className='mchart__month'
								x={cx}
								y={H - 6}
								textAnchor='middle'>
								{m.label}
							</text>
						</g>
					)
				})}
			</svg>
			{tip && hover !== null && (
				<div
					className='mchart__tip'
					style={{ left: `${((col * hover + col / 2) / W) * 100}%` }}
					role='status'>
					<b>{tip.label}</b>
					<span className='is-earn'>Ganados: {tip.earned} cacaos</span>
					<span className='is-spend'>Cambiados: {tip.spent} cacaos</span>
				</div>
			)}
		</div>
	)
}
