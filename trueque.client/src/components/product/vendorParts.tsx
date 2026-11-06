import type { VendorDent } from '@/constants/vendor'
import { cn } from '@/utils/cn'

const EYE_X = [66, 94]

export function VendorBody({
	shut,
	wink,
	dents,
}: {
	shut: boolean
	wink: number | null
	dents: VendorDent[]
}) {
	return (
		<svg
			className='stall3__vendor-svg'
			viewBox='0 0 160 230'
			aria-hidden='true'>
			<g data-part='belly'>
				<path
					className='v-shirt'
					d='M22 170c0-34 26-52 58-52s58 18 58 52v60H22z'
				/>
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
				<ellipse
					data-dent
					className='v-shirt'
					cx='34'
					cy='140'
					rx='18'
					ry='14'
				/>
				<ellipse
					data-dent
					className='v-shirt'
					cx='126'
					cy='140'
					rx='18'
					ry='14'
				/>
			</g>
			<rect className='v-skin' x='70' y='100' width='20' height='22' />
			<g data-part='face'>
				<circle className='v-skin' cx='80' cy='72' r='38' />
				<path className='v-brow' d='M54 52l18 7M106 52l-18 7' />
			</g>
			<g data-part='head'>
				<path className='v-hit' d='M48 52a38 38 0 0 1 64 0z' />
				<ellipse
					className='v-shine'
					cx='68'
					cy='44'
					rx='9'
					ry='4'
					transform='rotate(-24 68 44)'
				/>
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
					{EYE_X.map((x, i) => (
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
			<rect
				className='v-shirt'
				x='14'
				y='140'
				width='26'
				height='80'
				rx='13'
				transform='rotate(8 27 140)'
			/>
			{dents.map(d => (
				<circle key={d.id} className='v-dimple' cx={d.x} cy={d.y} r='6' />
			))}
		</svg>
	)
}

export function VendorHat() {
	return (
		<svg viewBox='0 0 140 56' aria-hidden='true'>
			<ellipse className='v-hat' cx='70' cy='44' rx='68' ry='9' />
			<path className='v-hat' d='M34 45c0-27 15-41 36-41s36 14 36 41z' />
			<path className='v-band' d='M35 33h70v10H35z' />
		</svg>
	)
}

export function VendorArm() {
	return (
		<svg viewBox='0 0 40 120' aria-hidden='true'>
			<rect className='v-shirt' x='6' y='0' width='28' height='86' rx='14' />
			<circle className='v-skin' cx='20' cy='98' r='16' />
		</svg>
	)
}

export function CounterBell() {
	return (
		<svg viewBox='0 0 48 48' aria-hidden='true'>
			<path className='v-bell' d='M8 36c0-12 7-20 16-20s16 8 16 20z' />
			<path className='v-base' d='M4 36h40v6H4z' />
			<circle className='v-bell' cx='24' cy='13' r='3.5' />
		</svg>
	)
}
