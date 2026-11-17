import { cn } from '@/utils/cn'

const BREEDS = ['white', 'red', 'brown'] as const

const EGG_SPOTS = [
	[22, 92],
	[116, 92],
	[38, 98],
	[100, 98],
	[56, 102],
	[82, 102],
] as const

interface Props {
	breed: number
	eggs: number
	active: boolean
}

export function HenBird() {
	return (
		<g className='coop-hen__bird'>
			<g className='coop-hen__tail'>
				<path d='M38 64C20 50 14 30 22 16c8 10 18 24 28 34z' />
				<path d='M42 60C30 40 30 22 40 12c6 14 10 28 14 40z' />
			</g>
			<ellipse className='coop-hen__body' cx='68' cy='68' rx='40' ry='30' />
			<path
				className='coop-hen__chest'
				d='M88 52c14 4 20 16 16 30-6 8-16 12-26 12 10-12 14-26 10-42z'
			/>
			<g className='coop-hen__wing'>
				<path d='M44 62c12-12 36-12 46 2-8 16-30 20-46 8z' />
				<path
					className='coop-hen__quill'
					d='M56 70c8 2 16 1 24-3M54 64c8 1 16 0 24-4'
				/>
			</g>
			<g className='coop-hen__head'>
				<circle className='coop-hen__comb' cx='93' cy='26' r='6' />
				<circle className='coop-hen__comb' cx='101' cy='22' r='7' />
				<circle className='coop-hen__comb' cx='109' cy='26' r='6' />
				<circle className='coop-hen__skull' cx='100' cy='42' r='17' />
				<path className='coop-hen__beak' d='M114 38l14 5-14 6z' />
				<ellipse className='coop-hen__wattle' cx='113' cy='55' rx='4' ry='6' />
				<g className='coop-hen__eye'>
					<circle cx='106' cy='38' r='3.4' />
					<circle className='coop-hen__glint' cx='107.2' cy='36.8' r='1.1' />
				</g>
			</g>
		</g>
	)
}

export function CoopHen({ breed, eggs, active }: Props) {
	return (
		<svg
			className={cn(
				'coop-hen',
				`coop-hen--${BREEDS[breed % BREEDS.length]}`,
				active && 'is-active'
			)}
			viewBox='0 0 140 120'
			aria-hidden='true'
			focusable='false'>
			<ellipse className='coop-hen__shadow' cx='68' cy='108' rx='58' ry='8' />
			<HenBird />
			<path
				className='coop-hen__nest'
				d='M10 92c10-8 34-10 58-10s48 2 60 10c-4 10-28 16-60 16S14 102 10 92z'
			/>
			<path
				className='coop-hen__straw'
				d='M18 94l14-4M34 99l16-6M56 101l14-7M80 100l14-6M100 97l14-5M24 99l8 4M70 104l12-2M44 104l10-1'
			/>
			<g className='coop-hen__eggs'>
				{EGG_SPOTS.slice(0, eggs).map(([x, y], i) => (
					<ellipse
						key={i}
						className='coop-hen__egg'
						cx={x}
						cy={y}
						rx='7'
						ry='9'
						style={{ '--i': i }}
					/>
				))}
			</g>
		</svg>
	)
}
