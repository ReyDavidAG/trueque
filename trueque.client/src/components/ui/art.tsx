import { ART, SYSTEM_ART } from '@/constants/art/art_catalog'
import { qrPaths } from '@/utils/qr'

const DRAWINGS = new Map(ART.map(a => [a.id, a.draw]))

const POD = `<path class="pod__body" d="M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z"/><path class="pod__rib" d="M207 92c-24 52-30 108-30 166s6 116 30 166c-24-14-65-80-65-166s41-148 65-166zM305 92c24 52 30 108 30 166s-6 116-30 166c24-14 65-80 65-166s-41-148-65-166zM256 70c-14 56-18 120-18 188s4 132 18 188c14-56 18-120 18-188s-4-132-18-188z"/><path class="pod__line" d="M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z"/><path class="pod__stem" d="M256 62c2-20 10-34 24-42"/>`

export function Art({ id, label = '' }: { id: string; label?: string }) {
	const body = DRAWINGS.get(id) ?? SYSTEM_ART[id] ?? DRAWINGS.get('ticket')
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

export function Wordmark() {
	return (
		<span className='wordmark' role='img' aria-label='El Trueque'>
			<Mark />
			<span aria-hidden='true'>
				<small>El</small>Trueque
			</span>
		</span>
	)
}

const SCENE = `<svg class="scene" viewBox="0 0 480 300" role="img" aria-label="Tres puestos de mercado con sus precios en cacaos" focusable="false">
  <ellipse class="a-shadow" cx="240" cy="284" rx="230" ry="12"/>
  ${(
		[
			['grana', 20],
			['anil', 170],
			['achiote', 320],
		] as const
	)
		.map(
			([c, x], i) => `
  <g class="scene__stall" data-stall="${c}" style="--i:${i}">
    <path class="a-cacao ln" d="M${x + 12} 120v160M${x + 128} 120v160"/>
    <path class="scene__awning ln" d="M${x} 70h140v42c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12z"/>
    <path class="a-estraza" d="M${x + 28} 72h28v40h-28zM${x + 84} 72h28v40h-28z" opacity=".85"/>
    <rect class="a-estraza ln" x="${x + 6}" y="200" width="128" height="80" rx="4"/>
    <path class="ln" d="M${x + 6} 220h128"/>
    <g transform="rotate(${i === 1 ? 5 : -5} ${x + 70} 150)">
      <path class="ln" d="M${x + 50} 140l20-18 20 18"/>
      <rect class="scene__sign ln" x="${x + 34}" y="138" width="72" height="40" rx="6"/>
      <text class="sign-text sign-text--light" x="${x + 70}" y="166" text-anchor="middle">${[25, 60, 180][i]}</text>
    </g>
  </g>`
		)
		.join('')}
  <g class="a-maiz ln"><circle cx="96" cy="236" r="12"/><circle cx="118" cy="244" r="12"/><circle cx="252" cy="240" r="12"/><circle cx="398" cy="238" r="12"/><circle cx="420" cy="246" r="12"/></g>
</svg>`

export function MarketScene() {
	return (
		<div className='scene-wrap' dangerouslySetInnerHTML={{ __html: SCENE }} />
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
