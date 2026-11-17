import { useRef } from 'react'

import { useSquish } from '@/hooks/ui/useSquish'

export function SquishEgg() {
	const host = useRef<HTMLButtonElement>(null)
	const squish = useSquish(host)

	return (
		<button
			ref={host}
			type='button'
			className='squish-egg'
			aria-label='Apachurrar el huevo'
			onPointerDown={e => {
				e.currentTarget.setPointerCapture(e.pointerId)
				squish.press()
			}}
			onPointerUp={squish.release}
			onPointerCancel={squish.release}
			onLostPointerCapture={squish.release}
			onKeyDown={e => {
				if (e.key !== 'Enter' && e.key !== ' ') return
				e.preventDefault()
				if (!e.repeat) squish.tap()
			}}>
			<svg
				className='mark'
				viewBox='0 0 512 512'
				aria-hidden='true'
				focusable='false'>
				<g className='squish-egg__body'>
					<path
						className='mark__egg'
						d='M256 24c-98 0-180 156-180 282 0 108 80 182 180 182s180-74 180-182C436 180 354 24 256 24z'
					/>
					<ellipse
						className='squish-egg__gloss'
						cx='184'
						cy='170'
						rx='30'
						ry='58'
						transform='rotate(24 184 170)'
					/>
					<g className='squish-egg__yolk'>
						<circle className='mark__white' cx='256' cy='318' r='118' />
						<circle className='mark__yolk' cx='256' cy='318' r='78' />
						<ellipse
							className='mark__shine'
							cx='226'
							cy='290'
							rx='24'
							ry='15'
							transform='rotate(-32 226 290)'
						/>
					</g>
				</g>
			</svg>
		</button>
	)
}
