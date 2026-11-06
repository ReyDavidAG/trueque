import type { ReactNode } from 'react'

import { artBody, POD } from '@/utils/artDrawing'
import { qrPaths } from '@/utils/qr'

export function Art({ id, label = '' }: { id: string; label?: string }) {
	const body = artBody(id)
	return (
		<svg
			className='art'
			viewBox='0 0 240 180'
			role={label ? 'img' : undefined}
			aria-label={label || undefined}
			aria-hidden={label ? undefined : true}
			focusable='false'
			dangerouslySetInnerHTML={{
				__html: `<ellipse class="a-halo" cx="120" cy="96" rx="92" ry="70"/><g class="a-shift">${body}</g><g>${body}</g>`,
			}}
		/>
	)
}

export function Coin({ className = '' }: { className?: string }) {
	return (
		<svg
			className={`coin ${className}`}
			viewBox='0 0 512 512'
			aria-hidden='true'
			focusable='false'
			dangerouslySetInnerHTML={{
				__html: `<circle class="coin__rim" cx="256" cy="256" r="246"/><circle class="coin__face" cx="256" cy="256" r="224"/><circle class="coin__ring" cx="256" cy="256" r="200"/><g transform="translate(256 262) rotate(-32) scale(.84) translate(-256 -256)">${POD}</g>`,
			}}
		/>
	)
}

export function Mark({ className = '' }: { className?: string }) {
	return (
		<svg
			className={`mark ${className}`}
			viewBox='0 0 512 512'
			aria-hidden='true'
			focusable='false'
			dangerouslySetInnerHTML={{
				__html: `<path class="mark__string" d="M146 190L256 66l110 124"/><circle class="mark__nail" cx="256" cy="60" r="26"/><g transform="rotate(-6 256 330)"><rect class="mark__board" x="44" y="186" width="424" height="290" rx="46"/><g transform="translate(256 331) rotate(-58) scale(.58) translate(-256 -256)">${POD}</g></g>`,
			}}
		/>
	)
}

export function Wordmark({ mark = <Mark /> }: { mark?: ReactNode }) {
	return (
		<span className='wordmark' role='img' aria-label='El Trueque'>
			{mark}
			<span aria-hidden='true'>
				<small>El</small>Trueque
			</span>
		</span>
	)
}

export function Qr({ code }: { code: string }) {
	const { eyes, cells } = qrPaths(code)
	return (
		<svg
			className='qr'
			viewBox='-1 -1 23 23'
			role='img'
			aria-label={`Código ${code}`}>
			<rect x='-1' y='-1' width='23' height='23' className='qr__bg' />
			<path d={eyes} fillRule='evenodd' />
			<path d={cells} />
		</svg>
	)
}
