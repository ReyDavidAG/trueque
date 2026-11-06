import { cn } from '@/utils/cn'

export function MiniVendor({ className }: { className?: string }) {
	return (
		<svg
			className={cn('mini-vendor', className)}
			viewBox='0 0 64 72'
			aria-hidden='true'>
			<path className='mv-shirt' d='M8 72c0-14 8-22 18-22s18 8 18 22z' />
			<circle className='mv-skin' cx='26' cy='34' r='14' />
			<circle className='mv-ink' cx='21' cy='32' r='1.8' />
			<circle className='mv-ink' cx='31' cy='32' r='1.8' />
			<path
				className='mv-stache'
				d='M18 40c3-3 6-3 8-1 2-2 5-2 8 1-3 3-5 2-8 1-2 1-5 2-8-1z'
			/>
			<ellipse className='mv-hat' cx='26' cy='21' rx='24' ry='5' />
			<path className='mv-hat' d='M13 21c0-11 6-17 13-17s13 6 13 17z' />
			<path className='mv-band' d='M14 15h24v5H14z' />
			<g className='mv-arm'>
				<path className='mv-sleeve' d='M38 60l14-10' />
				<rect
					className='mv-chalk'
					x='54'
					y='38'
					width='5'
					height='10'
					rx='1.5'
					transform='rotate(30 56 43)'
				/>
				<circle className='mv-skin' cx='54' cy='48' r='5' />
			</g>
		</svg>
	)
}
