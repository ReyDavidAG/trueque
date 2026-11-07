import type { ArtEntry } from './artTypes'

export const EXTRA_WORK_ART: ArtEntry[] = [
	{
		id: 'shiftswap',
		group: 'work',
		label: 'Cambio de turno',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="70" ry="7"/>
    <circle class="a-estraza ln" cx="120" cy="90" r="48"/>
    <circle class="a-amate2 ln" cx="120" cy="90" r="38"/>
    <path class="ln-thick" d="M120 90V64M120 90l18 10"/>
    <circle class="a-ink" cx="120" cy="90" r="5"/>
    <path class="ln-thick" d="M58 72a66 66 0 0 1 100-36"/>
    <path class="a-nopal ln" d="M154 24l14 14-18 4z"/>
    <path class="ln-thick" d="M182 108a66 66 0 0 1-100 36"/>
    <path class="a-grana ln" d="M86 156l-14-14 18-4z"/>`,
	},
	{
		id: 'earlyout',
		group: 'work',
		label: 'Salida temprano',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="84" ry="7"/>
    <rect class="a-cacao ln" x="56" y="28" width="76" height="124" rx="4"/>
    <path class="a-estraza ln" d="M64 36h60v116H64z"/>
    <circle class="a-maiz ln" cx="114" cy="96" r="5"/>
    <path class="a-nopal ln" d="M138 82h34V68l30 28-30 28v-14h-34z"/>
    <path class="a-maiz ln" d="M184 26l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>`,
	},
	{
		id: 'halfday',
		group: 'work',
		label: 'Medio día libre',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="90" ry="6"/>
    <path class="ln-thick" d="M120 44V26M74 62L62 50M166 62l12-12M50 104H32M190 104h18"/>
    <path class="a-maiz ln" d="M62 122a58 58 0 0 1 116 0z"/>
    <path class="a-anil-soft ln" d="M28 122h184v14H28z"/>
    <path class="a-anil ln" d="M28 136h184v14H28z"/>
    <text class="art-word a-estraza" x="120" y="112" text-anchor="middle">½</text>`,
	},
	{
		id: 'homeoffice',
		group: 'work',
		label: 'Home office',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="90" ry="6"/>
    <path class="a-grana ln" d="M38 84l82-58 82 58z"/>
    <rect class="a-estraza ln" x="52" y="82" width="136" height="72" rx="4"/>
    <rect class="a-anil ln" x="86" y="96" width="68" height="42" rx="4"/>
    <rect class="a-anil-soft ln" x="92" y="102" width="56" height="30" rx="2"/>
    <path class="a-cacao ln" d="M76 138h88l8 10H68z"/>`,
	},
	{
		id: 'parking',
		group: 'work',
		label: 'Lugar de estacionamiento',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="60" ry="6"/>
    <path class="a-cacao ln" d="M114 104h12v52h-12z"/>
    <rect class="a-anil ln" x="72" y="22" width="96" height="88" rx="14"/>
    <path class="a-estraza ln" fill-rule="evenodd" d="M102 40h22a19 19 0 0 1 0 38h-10v18h-12zM114 52v14h10a7 7 0 0 0 0-14z"/>`,
	},
	{
		id: 'bus',
		group: 'work',
		label: 'Transporte',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="98" ry="7"/>
    <rect class="a-maiz ln" x="28" y="48" width="184" height="90" rx="16"/>
    <rect class="a-anil-soft ln" x="42" y="60" width="42" height="32" rx="4"/>
    <rect class="a-anil-soft ln" x="92" y="60" width="42" height="32" rx="4"/>
    <rect class="a-anil-soft ln" x="142" y="60" width="56" height="32" rx="4"/>
    <path class="a-grana" d="M30 106h180v8H30z"/>
    <circle class="a-ink" cx="72" cy="140" r="16"/><circle class="a-amate2 ln" cx="72" cy="140" r="6"/>
    <circle class="a-ink" cx="172" cy="140" r="16"/><circle class="a-amate2 ln" cx="172" cy="140" r="6"/>`,
	},
	{
		id: 'gas',
		group: 'work',
		label: 'Vale de gasolina',
		draw: `
    <ellipse class="a-shadow" cx="114" cy="158" rx="72" ry="6"/>
    <rect class="a-grana ln" x="58" y="34" width="82" height="116" rx="10"/>
    <rect class="a-estraza ln" x="70" y="48" width="58" height="34" rx="4"/>
    <path class="ln-thick" d="M140 70h20c8 0 12 4 12 12v44c0 8 10 8 10 0V72l-14-16"/>
    <path class="a-cacao ln" d="M50 144h98v12H50z"/>`,
	},
	{
		id: 'vest',
		group: 'work',
		label: 'Equipo de seguridad',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="70" ry="6"/>
    <path class="a-achiote ln" d="M84 28l20 10h32l20-10 26 18-8 104H66l-8-104z"/>
    <path class="a-maiz" d="M66 104h108v10H66zM68 126h104v10H68z"/>
    <path class="a-estraza ln" d="M104 38l16 40 16-40z"/>
    <path class="ln" d="M120 78v72"/>`,
	},
	{
		id: 'laundry',
		group: 'service',
		label: 'Lavandería',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="70" ry="6"/>
    <rect class="a-estraza ln" x="62" y="24" width="116" height="128" rx="12"/>
    <path class="ln" d="M62 50h116"/>
    <circle class="a-grana ln" cx="82" cy="37" r="5"/><circle class="a-nopal ln" cx="98" cy="37" r="5"/>
    <circle class="a-cacao ln" cx="120" cy="100" r="36"/>
    <circle class="a-anil-soft ln" cx="120" cy="100" r="26"/>
    <path class="a-anil" d="M95 104c10-8 20 8 30 0s16-4 20 0a25 25 0 0 1-50 0z"/>`,
	},
	{
		id: 'pet',
		group: 'service',
		label: 'Veterinaria',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="62" ry="6"/>
    <path class="a-cacao ln" d="M120 92c22 0 44 24 44 44 0 14-12 18-22 16-8-2-14-6-22-6s-14 4-22 6c-10 2-22-2-22-16 0-20 22-44 44-44z"/>
    <ellipse class="a-cacao ln" cx="74" cy="86" rx="12" ry="16"/>
    <ellipse class="a-cacao ln" cx="102" cy="58" rx="12" ry="17"/>
    <ellipse class="a-cacao ln" cx="138" cy="58" rx="12" ry="17"/>
    <ellipse class="a-cacao ln" cx="166" cy="86" rx="12" ry="16"/>`,
	},
]
