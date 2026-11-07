import type { ArtEntry } from './artTypes'

export const EXTRA_MERCH_ART: ArtEntry[] = [
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
