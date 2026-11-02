import { qrPaths } from '@/utils/qr'

const DRAWINGS: Record<string, string> = {
	plate: `
    <ellipse class="a-shadow" cx="120" cy="150" rx="78" ry="10"/>
    <ellipse class="a-estraza ln" cx="112" cy="112" rx="74" ry="36"/>
    <ellipse class="a-amate2 ln" cx="112" cy="108" rx="56" ry="25"/>
    <path class="a-maiz ln" d="M70 106c6-14 30-16 38-4 4 7-2 14-14 15-14 1-27-2-24-11z"/>
    <g class="a-cacao"><circle cx="122" cy="102" r="5"/><circle cx="133" cy="98" r="5"/><circle cx="131" cy="109" r="5"/><circle cx="142" cy="105" r="5"/><circle cx="120" cy="112" r="4.5"/></g>
    <path class="a-nopal ln" d="M146 112c4-12 16-14 22-8-2 9-12 14-22 8z"/>
    <path class="a-nopal ln" d="M150 96c8-8 18-6 20 0-6 7-14 7-20 0z"/>
    <rect class="a-grana ln" x="184" y="62" width="30" height="62" rx="6"/>
    <path class="a-estraza" d="M188 70h22v8h-22z" opacity=".55"/>
    <path class="ln" d="M196 50l6 14"/>
    <g class="a-achiote ln"><ellipse cx="44" cy="70" rx="24" ry="8"/><ellipse cx="44" cy="62" rx="24" ry="8"/><ellipse cx="44" cy="54" rx="24" ry="8"/></g>`,
	thermos: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="46" ry="8"/>
    <rect class="a-anil ln" x="92" y="52" width="56" height="102" rx="16"/>
    <rect class="a-ink" x="96" y="36" width="48" height="22" rx="7"/>
    <rect class="a-estraza ln" x="104" y="80" width="32" height="44" rx="8"/>
    <path class="a-cacao ln" d="M120 88c9 4 9 24 0 28-9-4-9-24 0-28z"/>
    <path class="ln" d="M120 90v24"/>
    <path class="ln a-steam" d="M108 28c-6-8 6-12 0-20M124 30c-6-8 6-12 0-20M140 28c-6-8 6-12 0-20"/>
    <path class="a-maiz ln" d="M150 70h12a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-12"/>`,
	apple: `
    <ellipse class="a-shadow" cx="112" cy="152" rx="56" ry="8"/>
    <path class="a-grana ln" d="M112 62c-14-12-48-8-50 28-2 34 22 60 38 60 6 0 8-4 12-4s6 4 12 4c16 0 40-26 38-60-2-36-36-40-50-28z"/>
    <path class="a-estraza" d="M78 82c4-8 12-12 20-12" opacity=".6"/>
    <path class="ln" d="M112 62c0-10 2-18 8-24"/>
    <path class="a-nopal ln" d="M120 44c10-12 28-12 34-4-8 10-24 12-34 4z"/>
    <path class="a-maiz ln" d="M164 150c20 0 30-14 22-26-8-12-28-6-26 8 1 8 12 10 16 2"/>
    <path class="ln a-ticks" d="M170 148v-6M178 146v-6M186 142l-4-5"/>`,
	chat: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="70" ry="8"/>
    <path class="a-anil ln" d="M40 44h104a16 16 0 0 1 16 16v38a16 16 0 0 1-16 16H82l-24 20v-20H40a16 16 0 0 1-16-16V60a16 16 0 0 1 16-16z"/>
    <path class="a-estraza ln" d="M120 82h76a14 14 0 0 1 14 14v30a14 14 0 0 1-14 14h-8v18l-20-18h-48a14 14 0 0 1-14-14V96a14 14 0 0 1 14-14z"/>
    <path class="a-grana ln" d="M158 102c6-8 18-4 16 6-1 8-16 18-16 18s-15-10-16-18c-2-10 10-14 16-6z"/>
    <g class="a-estraza"><circle cx="58" cy="80" r="5"/><circle cx="78" cy="80" r="5"/><circle cx="98" cy="80" r="5"/></g>`,
	glasses: `
    <rect class="a-estraza ln" x="66" y="18" width="108" height="72" rx="6"/>
    <g class="a-ink chart"><text x="120" y="44" text-anchor="middle">E</text><text x="120" y="62" text-anchor="middle" font-size="12">F P</text><text x="120" y="78" text-anchor="middle" font-size="8">T O Z</text></g>
    <ellipse class="a-shadow" cx="120" cy="156" rx="80" ry="8"/>
    <circle class="a-anil-soft ln-thick" cx="80" cy="120" r="30"/>
    <circle class="a-anil-soft ln-thick" cx="160" cy="120" r="30"/>
    <path class="ln-thick" d="M110 116c6-6 14-6 20 0M50 114l-24-10M190 114l24-10"/>
    <path class="a-estraza" d="M64 106c4-6 10-8 16-8M144 106c4-6 10-8 16-8" opacity=".8"/>`,
	wrench: `
    <ellipse class="a-shadow" cx="120" cy="154" rx="92" ry="8"/>
    <path class="a-maiz ln" d="M30 124v-18c0-8 6-12 14-14l26-6 22-22c4-4 10-6 16-6h44c8 0 14 4 18 10l16 22 22 4c8 2 12 8 12 16v14z"/>
    <path class="a-anil-soft ln" d="M96 82l14-14c2-2 4-2 6-2h20v16zM146 66h14c4 0 6 2 8 4l9 12h-31z"/>
    <path class="ln" d="M30 112h180"/>
    <circle class="a-ink" cx="74" cy="128" r="18"/><circle class="a-amate2" cx="74" cy="128" r="7"/>
    <circle class="a-ink" cx="172" cy="128" r="18"/><circle class="a-amate2" cx="172" cy="128" r="7"/>
    <g transform="translate(-74 -14) rotate(-14 150 44)">
      <path class="a-cacao ln" d="M104 38h60l6-6h10a12 12 0 0 1 0 24h-10l-6-6h-60a6 6 0 0 1 0-12z"/>
      <path class="a-amate2 ln" d="M184 38h4a6 6 0 0 1 0 12h-4z"/>
    </g>
    <path class="ln a-spark" d="M124 30l8-10M130 42l12-2M114 20v-12"/>`,
	diploma: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="80" ry="8"/>
    <path class="a-estraza ln" d="M48 42h140v96H48z"/>
    <path class="a-amate2 ln" d="M40 36a10 10 0 0 1 0 20h8V36zM196 124a10 10 0 0 1 0 20h-8v-20z"/>
    <path class="ln" d="M70 66h96M70 82h80M70 98h88"/>
    <path class="a-grana ln" d="M142 112l-8 34 14-8 12 10 4-36z"/>
    <circle class="a-maiz ln" cx="152" cy="112" r="16"/>
    <path class="ln" d="M144 112l6 6 10-12"/>`,
	laptop: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="92" ry="8"/>
    <rect class="a-ink" x="58" y="40" width="124" height="82" rx="8"/>
    <rect class="a-anil" x="66" y="48" width="108" height="66" rx="3"/>
    <path class="a-anil-soft" d="M72 56h44v6H72zM72 68h70v4H72zM72 78h56v4H72z" opacity=".75"/>
    <path class="a-amate2 ln" d="M36 124h168l-12 22H48z"/>
    <path class="ln" d="M104 132h32"/>
    <path class="ln" d="M182 50c14 2 22 10 24 22"/>
    <g transform="rotate(14 206 92)">
      <path class="a-cacao ln" d="M190 74h30l10 14-10 14h-30z"/>
      <circle class="a-amate2" cx="222" cy="88" r="3.5"/>
      <path class="a-on-dark" d="M196 86h18v4h-18z" opacity=".8"/>
    </g>`,
	closed: `
    <ellipse class="a-shadow" cx="120" cy="160" rx="96" ry="8"/>
    <path class="a-cacao ln" d="M34 70h172v88H34z"/>
    <path class="a-amate2 ln" d="M44 80h152v78H44z"/>
    <path class="ln" d="M44 92h152M44 104h152M44 116h152M44 128h152M44 140h152"/>
    <path class="a-grana ln" d="M26 34h188v30c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12z"/>
    <path class="a-estraza" d="M58 36h24v28H58zM114 36h24v28h-24zM170 36h24v28h-24z" opacity=".9"/>
    <path class="ln" d="M100 78l20-16 20 16"/>
    <g transform="rotate(-8 120 104)"><rect class="a-estraza ln" x="78" y="80" width="84" height="40" rx="6"/><text class="sign-text" x="120" y="107" text-anchor="middle">Cerrado</text></g>`,
	ticket: `
    <ellipse class="a-shadow" cx="120" cy="150" rx="88" ry="8"/>
    <g transform="rotate(-6 120 96)">
      <path class="a-estraza ln" d="M36 52h168v28a12 12 0 0 0 0 24v28H36v-28a12 12 0 0 0 0-24z"/>
      <path class="ln" d="M150 56v72" stroke-dasharray="6 7"/>
      <path class="ln" d="M56 78h70M56 96h52M56 114h62"/>
      <circle class="a-cacao ln" cx="178" cy="92" r="14"/>
    </g>`,
	cap: `
    <ellipse class="a-shadow" cx="120" cy="154" rx="80" ry="8"/>
    <path class="a-grana ln" d="M54 118c0-44 28-70 66-70s66 26 66 70z"/>
    <path class="a-ink ln" d="M40 118h168c6 0 6 14-4 16-40 8-120 8-160 0-10-2-10-16-4-16z"/>
    <path class="ln" d="M120 48v70M86 56c-8 20-10 42-10 62M154 56c8 20 10 42 10 62"/>
    <circle class="a-maiz ln" cx="120" cy="48" r="6"/>
    <path class="a-cacao ln" d="M120 82c8 4 8 20 0 24-8-4-8-20 0-24z"/>`,
}

const POD = `<path class="pod__body" d="M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z"/><path class="pod__rib" d="M207 92c-24 52-30 108-30 166s6 116 30 166c-24-14-65-80-65-166s41-148 65-166zM305 92c24 52 30 108 30 166s-6 116-30 166c24-14 65-80 65-166s-41-148-65-166zM256 70c-14 56-18 120-18 188s4 132 18 188c14-56 18-120 18-188s-4-132-18-188z"/><path class="pod__line" d="M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z"/><path class="pod__stem" d="M256 62c2-20 10-34 24-42"/>`

export function Art({ id, label = '' }: { id: string; label?: string }) {
	const body = DRAWINGS[id] ?? DRAWINGS.cap
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
