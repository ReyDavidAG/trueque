import type { ArtEntry } from './art_types'

export const EXTRA_ART: ArtEntry[] = [
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
	{
		id: 'pizza',
		group: 'food',
		label: 'Pizza',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="80" ry="7"/>
    <path class="a-maiz ln" d="M60 52c40-14 80-14 120 0l-60 98z"/>
    <path class="a-achiote ln" d="M54 50c44-18 88-18 132 0l-8 16c-38-14-78-14-116 0z"/>
    <circle class="a-grana ln" cx="104" cy="80" r="9"/>
    <circle class="a-grana ln" cx="138" cy="86" r="8"/>
    <circle class="a-grana ln" cx="118" cy="112" r="7"/>
    <path class="a-nopal ln" d="M126 68c4-5 11-5 13 0-4 5-9 5-13 0z"/>`,
	},
	{
		id: 'tacos',
		group: 'food',
		label: 'Tacos',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="154" rx="96" ry="7"/>
    <path class="a-nopal ln" d="M40 118c10-10 20-14 30-10 10-8 22-8 30 2 8-2 16 2 20 8z"/>
    <path class="a-maiz ln" d="M28 136a52 52 0 0 1 104 0z"/>
    <path class="a-grana ln" d="M62 110h8v8h-8zM90 106h8v8h-8z"/>
    <path class="a-nopal ln" d="M120 118c10-10 20-14 30-10 10-8 22-8 30 2 8-2 16 2 20 8z"/>
    <path class="a-maiz ln" d="M108 136a52 52 0 0 1 104 0z"/>
    <path class="a-achiote ln" d="M142 110h8v8h-8zM170 106h8v8h-8z"/>`,
	},
	{
		id: 'icecream',
		group: 'food',
		label: 'Helado',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="160" rx="40" ry="5"/>
    <path class="a-maiz-2 ln" d="M92 94h56l-28 62z"/>
    <path class="ln" d="M100 104l32 20M108 118l16 10M140 104l-32 20"/>
    <circle class="a-grana ln" cx="104" cy="82" r="22"/>
    <circle class="a-nopal ln" cx="136" cy="82" r="22"/>
    <circle class="a-estraza ln" cx="120" cy="60" r="22"/>
    <circle class="a-grana ln" cx="122" cy="35" r="7"/>`,
	},
	{
		id: 'cake',
		group: 'food',
		label: 'Pastel de cumpleaños',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="88" ry="7"/>
    <rect class="a-estraza ln" x="52" y="96" width="136" height="54" rx="8"/>
    <path class="a-grana ln" d="M52 104c11 12 23 12 34 0 11 12 23 12 34 0 11 12 23 12 34 0 11 12 23 12 34 0v-2c0-4-4-8-8-8H60c-4 0-8 4-8 8z"/>
    <rect class="a-anil-soft ln" x="70" y="62" width="100" height="34" rx="6"/>
    <path class="ln" d="M70 80c10 8 22 8 33 0 11 8 22 8 33 0 11 8 22 8 34 0"/>
    <rect class="a-maiz ln" x="96" y="36" width="8" height="26" rx="2"/>
    <rect class="a-maiz ln" x="136" y="36" width="8" height="26" rx="2"/>
    <path class="a-achiote ln" d="M100 20c6 6 6 10 0 14-6-4-6-8 0-14zM140 20c6 6 6 10 0 14-6-4-6-8 0-14z"/>`,
	},
	{
		id: 'tooth',
		group: 'health',
		label: 'Dentista',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="60" ry="6"/>
    <path class="a-estraza ln" d="M80 44c14-10 28-6 40 2 12-8 26-12 40-2 16 12 12 40 2 58-6 12-6 48-18 48-12 0-10-32-24-32s-12 32-24 32c-12 0-12-36-18-48-10-18-14-46 2-58z"/>
    <path class="ln" d="M92 58c6-6 14-6 20 0"/>
    <path class="a-nopal ln" d="M172 36l6 12 12 6-12 6-6 12-6-12-12-6 12-6z"/>`,
	},
	{
		id: 'spa',
		group: 'health',
		label: 'Masaje y spa',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="82" ry="6"/>
    <ellipse class="a-cacao ln" cx="120" cy="140" rx="66" ry="14"/>
    <ellipse class="a-maiz-2 ln" cx="120" cy="114" rx="50" ry="12"/>
    <ellipse class="a-amate2 ln" cx="120" cy="92" rx="34" ry="10"/>
    <path class="a-nopal ln" d="M140 80c0-26 18-40 44-40 0 26-18 40-44 40z"/>
    <path class="ln" d="M144 76c10-10 20-18 34-30"/>
    <path class="ln a-steam" d="M84 68c-6-8 6-12 0-20M100 64c-6-8 6-12 0-20"/>`,
	},
	{
		id: 'firstaid',
		group: 'health',
		label: 'Botiquín',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="84" ry="7"/>
    <path class="ln-thick" d="M98 54V42h44v12"/>
    <rect class="a-grana ln" x="48" y="54" width="144" height="92" rx="12"/>
    <path class="a-estraza ln" d="M108 72h24v22h22v24h-22v22h-24v-22H86V94h22z"/>`,
	},
	{
		id: 'languages',
		group: 'learn',
		label: 'Idiomas',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="86" ry="6"/>
    <path class="a-anil ln" d="M40 34h96a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H78l-22 18V98H40a10 10 0 0 1-10-10V44a10 10 0 0 1 10-10z"/>
    <text class="art-word a-estraza" x="88" y="78" text-anchor="middle">ABC</text>
    <path class="a-maiz ln" d="M120 80h80a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10h-10v16l-18-16h-52a10 10 0 0 1-10-10V90a10 10 0 0 1 10-10z"/>
    <path class="ln" d="M134 100h56M134 116h40"/>`,
	},
	{
		id: 'music',
		group: 'learn',
		label: 'Clases de música',
		draw: `
    <ellipse class="a-shadow" cx="124" cy="158" rx="66" ry="6"/>
    <path class="ln-thick" d="M100 126V44l76-16v86"/>
    <path class="a-cacao ln" d="M100 44l76-16v18l-76 16z"/>
    <ellipse class="a-grana ln" cx="86" cy="128" rx="18" ry="14"/>
    <ellipse class="a-grana ln" cx="162" cy="116" rx="18" ry="14"/>`,
	},
	{
		id: 'mug',
		group: 'merch',
		label: 'Taza',
		draw: `
    <ellipse class="a-shadow" cx="114" cy="156" rx="70" ry="7"/>
    <path class="ln-thick" d="M154 74h12a18 18 0 0 1 0 36h-12"/>
    <path class="a-grana ln" d="M66 56h88v76a16 16 0 0 1-16 16H82a16 16 0 0 1-16-16z"/>
    <ellipse class="a-cacao ln" cx="110" cy="56" rx="44" ry="8"/>
    <circle class="a-maiz ln" cx="110" cy="100" r="16"/>`,
	},
	{
		id: 'backpack',
		group: 'merch',
		label: 'Mochila',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="64" ry="6"/>
    <path class="ln-thick" d="M100 44c0-20 40-20 40 0"/>
    <path class="a-anil ln" d="M70 74c0-22 18-34 50-34s50 12 50 34v66a12 12 0 0 1-12 12H82a12 12 0 0 1-12-12z"/>
    <rect class="a-maiz ln" x="88" y="96" width="64" height="40" rx="8"/>
    <path class="ln" d="M88 110h64"/>
    <rect class="a-grana ln" x="114" y="104" width="12" height="10" rx="2"/>`,
	},
	{
		id: 'umbrella',
		group: 'merch',
		label: 'Paraguas',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="60" ry="6"/>
    <path class="ln-thick" d="M120 96v44a10 10 0 0 1-20 0"/>
    <path class="a-grana ln" d="M40 96a80 70 0 0 1 160 0c-10-8-30-8-40 0-10-8-30-8-40 0-10-8-30-8-40 0-10-8-30-8-40 0z"/>
    <path class="ln" d="M120 28c-22 18-40 44-40 68M120 28c22 18 40 44 40 68M120 28v68"/>`,
	},
	{
		id: 'headphones',
		group: 'merch',
		label: 'Audífonos',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="66" ry="6"/>
    <path class="ln-thick" d="M64 110V96a56 56 0 0 1 112 0v14"/>
    <rect class="a-anil ln" x="50" y="98" width="34" height="52" rx="12"/>
    <rect class="a-anil ln" x="156" y="98" width="34" height="52" rx="12"/>
    <rect class="a-maiz ln" x="60" y="108" width="12" height="32" rx="5"/>
    <rect class="a-maiz ln" x="168" y="108" width="12" height="32" rx="5"/>`,
	},
	{
		id: 'giftcard',
		group: 'merch',
		label: 'Tarjeta de regalo',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="90" ry="6"/>
    <rect class="a-nopal ln" x="32" y="42" width="176" height="106" rx="12"/>
    <path class="a-maiz" d="M94 44h16v102H94zM34 84h172v14H34z"/>
    <path class="a-grana ln" d="M102 86c-16-24-40-10-26 2 6 4 18 2 26-2zM102 86c16-24 40-10 26 2-6 4-18 2-26-2z"/>
    <path class="ln" d="M150 126h40"/>`,
	},
	{
		id: 'plant',
		group: 'merch',
		label: 'Planta',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="56" ry="6"/>
    <path class="a-nopal ln" d="M118 98c-30 0-46-20-46-46 28 0 46 18 46 46z"/>
    <path class="a-nopal ln" d="M122 90c4-34 26-54 56-54 0 34-22 54-56 54z"/>
    <path class="ln" d="M120 104V72M116 96c-12-12-22-22-30-30M126 86c14-14 28-28 42-40"/>
    <path class="a-achiote ln" d="M84 104h72l-10 50H94z"/>
    <path class="a-achiote ln" d="M80 98h80v14H80z"/>`,
	},
	{
		id: 'popcorn',
		group: 'leisure',
		label: 'Cine',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="62" ry="6"/>
    <circle class="a-estraza ln" cx="96" cy="58" r="16"/>
    <circle class="a-estraza ln" cx="120" cy="48" r="18"/>
    <circle class="a-estraza ln" cx="144" cy="58" r="16"/>
    <circle class="a-maiz ln" cx="108" cy="70" r="12"/>
    <circle class="a-maiz ln" cx="134" cy="70" r="12"/>
    <path class="a-estraza" d="M78 72h84l-12 82H90z"/>
    <path class="a-grana" d="M88 74h14l2 78H92zM113 74h14l-1 78h-12zM138 74h14l-6 78h-11z"/>
    <path class="ln" d="M78 72h84l-12 82H90z"/>`,
	},
	{
		id: 'gamepad',
		group: 'leisure',
		label: 'Videojuegos',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="88" ry="7"/>
    <path class="a-cacao ln" d="M68 58h104c20 0 34 20 38 46 4 24-8 38-22 38-12 0-18-16-30-22H82c-12 6-18 22-30 22-14 0-26-14-22-38 4-26 18-46 38-46z"/>
    <path class="a-estraza ln" d="M72 82h10v12h12v10H82v12H72v-12H60V94h12z"/>
    <circle class="a-grana ln" cx="160" cy="86" r="7"/>
    <circle class="a-maiz ln" cx="176" cy="100" r="7"/>
    <circle class="a-nopal ln" cx="144" cy="100" r="7"/>
    <circle class="a-anil ln" cx="160" cy="114" r="7"/>`,
	},
	{
		id: 'bike',
		group: 'leisure',
		label: 'Bicicleta',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="98" ry="5"/>
    <circle class="ln-thick" cx="64" cy="118" r="34"/>
    <circle class="ln-thick" cx="176" cy="118" r="34"/>
    <path class="ln-thick" d="M64 118l36-50h52l24 50M100 68l28 50H64M128 118l24-50M146 54h18"/>
    <path class="a-grana ln" d="M86 50h28l-4 8H90z"/>
    <circle class="a-maiz ln" cx="64" cy="118" r="6"/>
    <circle class="a-maiz ln" cx="176" cy="118" r="6"/>
    <circle class="a-maiz ln" cx="128" cy="118" r="8"/>`,
	},
	{
		id: 'suitcase',
		group: 'leisure',
		label: 'Viaje',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="78" ry="6"/>
    <path class="ln-thick" d="M100 50V38a8 8 0 0 1 8-8h24a8 8 0 0 1 8 8v12"/>
    <rect class="a-achiote ln" x="56" y="50" width="128" height="94" rx="14"/>
    <path class="a-cacao" d="M84 52h12v90H84zM144 52h12v90h-12z"/>
    <path class="ln" d="M84 52v90M96 52v90M144 52v90M156 52v90"/>
    <circle class="a-ink" cx="78" cy="150" r="6"/>
    <circle class="a-ink" cx="162" cy="150" r="6"/>`,
	},
]
