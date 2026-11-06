import type { ArtEntry } from './artTypes'

export const EVERYDAY_ART: ArtEntry[] = [
	{
		id: 'plate',
		group: 'food',
		label: 'Comida corrida',
		draw: `
    <ellipse class="a-shadow" cx="114" cy="152" rx="88" ry="9"/>
    <path class="a-grana ln" d="M14 112l12-22h40l12 22z"/>
    <ellipse class="a-maiz ln" cx="46" cy="94" rx="24" ry="7"/>
    <ellipse class="a-maiz ln" cx="46" cy="86" rx="24" ry="7"/>
    <ellipse class="a-maiz ln" cx="46" cy="78" rx="24" ry="7"/>
    <ellipse class="a-estraza ln" cx="112" cy="122" rx="66" ry="28"/>
    <ellipse class="a-amate2 ln" cx="112" cy="118" rx="48" ry="18"/>
    <path class="a-achiote ln" d="M70 120c0-14 14-20 26-18 10 2 14 10 10 16-8 8-36 8-36 2z"/>
    <path class="ln" d="M80 112h4M90 108h4M86 116h4"/>
    <path class="a-grana ln" d="M108 112c8-12 34-12 42 0 4 8-6 14-21 14s-25-6-21-14z"/>
    <ellipse class="a-cacao ln" cx="98" cy="126" rx="12" ry="5"/>
    <path class="a-nopal ln" d="M128 104c4-8 12-10 16-6-2 6-8 9-16 6z"/>
    <path class="a-anil-soft ln" d="M180 62h34l-5 76a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6z"/>
    <path class="a-grana" d="M183 86h28l-3 50a4 4 0 0 1-4 4h-14a4 4 0 0 1-4-4z"/>
    <path class="ln" d="M180 62h34l-5 76a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6z"/>
    <path class="ln" d="M202 46l-6 30"/>`,
	},
	{
		id: 'coffee',
		group: 'food',
		label: 'Café y pan dulce',
		draw: `
    <ellipse class="a-shadow" cx="122" cy="154" rx="92" ry="8"/>
    <ellipse class="a-estraza ln" cx="96" cy="142" rx="54" ry="10"/>
    <path class="ln-thick" d="M128 96h10a13 13 0 0 1 0 26h-12"/>
    <path class="a-grana ln" d="M60 88h72v28a30 30 0 0 1-30 30h-12a30 30 0 0 1-30-30z"/>
    <path class="a-estraza" d="M62 104h68v7H62z" opacity=".85"/>
    <ellipse class="a-cacao ln" cx="96" cy="88" rx="36" ry="8"/>
    <path class="ln a-steam" d="M82 72c-6-8 6-12 0-20M98 70c-6-8 6-12 0-20M114 72c-6-8 6-12 0-20"/>
    <path class="a-maiz ln" d="M160 144c0-28 18-40 32-40s32 12 32 40z"/>
    <path class="a-achiote-soft" d="M166 126c6-14 46-14 52 0-4-18-48-18-52 0z" opacity=".9"/>
    <path class="ln" d="M166 130c10-12 42-12 52 0M174 118c8-8 28-8 36 0M192 104v40"/>`,
	},
	{
		id: 'groceries',
		group: 'food',
		label: 'Despensa',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="70" ry="8"/>
    <path class="a-nopal ln" d="M92 80c-10-22 0-38 12-42 8 16 4 32-12 42z"/>
    <path class="a-maiz ln" d="M114 82l14-44c3-7 13-5 13 2l-8 44z"/>
    <circle class="a-grana ln" cx="152" cy="74" r="14"/>
    <path class="ln" d="M152 60c0-6 4-10 8-12"/>
    <path class="ln-thick" d="M90 78c0-30 60-30 60 0"/>
    <path class="a-achiote ln" d="M66 78h108l-9 74H75z"/>
    <path class="a-anil" d="M69 96h102v10H69zM71 122h98v10H71z" opacity=".9"/>
    <path class="ln" d="M69 96h102M69 106h102M71 122h98M71 132h98"/>`,
	},
	{
		id: 'apple',
		group: 'health',
		label: 'Nutrición',
		draw: `
    <ellipse class="a-shadow" cx="116" cy="152" rx="90" ry="8"/>
    <g transform="translate(-18 0)">
      <path class="a-grana ln" d="M112 62c-14-12-48-8-50 28-2 34 22 60 38 60 6 0 8-4 12-4s6 4 12 4c16 0 40-26 38-60-2-36-36-40-50-28z"/>
      <path class="a-estraza" d="M78 82c4-8 12-12 20-12" opacity=".6"/>
      <path class="ln" d="M112 62c0-10 2-18 8-24"/>
      <path class="a-nopal ln" d="M120 44c10-12 28-12 34-4-8 10-24 12-34 4z"/>
    </g>
    <path class="a-estraza ln" d="M168 140H118v10h50z"/>
    <path class="ln" d="M126 140v5M136 140v5M146 140v5M156 140v5"/>
    <rect class="a-maiz ln" x="164" y="102" width="46" height="48" rx="13"/>
    <circle class="a-estraza ln" cx="187" cy="126" r="9"/>`,
	},
	{
		id: 'chat',
		group: 'health',
		label: 'Apoyo psicológico',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="70" ry="8"/>
    <path class="a-anil ln" d="M40 44h104a16 16 0 0 1 16 16v38a16 16 0 0 1-16 16H82l-24 20v-20H40a16 16 0 0 1-16-16V60a16 16 0 0 1 16-16z"/>
    <path class="a-estraza ln" d="M120 82h76a14 14 0 0 1 14 14v30a14 14 0 0 1-14 14h-8v18l-20-18h-48a14 14 0 0 1-14-14V96a14 14 0 0 1 14-14z"/>
    <path class="a-grana ln" d="M158 102c6-8 18-4 16 6-1 8-16 18-16 18s-15-10-16-18c-2-10 10-14 16-6z"/>
    <g class="a-estraza"><circle cx="58" cy="80" r="5"/><circle cx="78" cy="80" r="5"/><circle cx="98" cy="80" r="5"/></g>`,
	},
	{
		id: 'glasses',
		group: 'health',
		label: 'Óptica',
		draw: `
    <rect class="a-estraza ln" x="66" y="18" width="108" height="72" rx="6"/>
    <g class="a-ink chart"><text x="120" y="44" text-anchor="middle" style="font-size:19px;letter-spacing:3px">REY</text><text x="120" y="63" text-anchor="middle" style="font-size:13px;letter-spacing:2px">DAVID</text><text x="120" y="79" text-anchor="middle" style="font-size:8px;letter-spacing:1px">¿LO VES?</text></g>
    <ellipse class="a-shadow" cx="120" cy="156" rx="80" ry="8"/>
    <circle class="a-anil-soft ln-thick" cx="80" cy="120" r="30"/>
    <circle class="a-anil-soft ln-thick" cx="160" cy="120" r="30"/>
    <path class="ln-thick" d="M110 116c6-6 14-6 20 0M50 114l-24-10M190 114l24-10"/>
    <path class="a-estraza" d="M64 106c4-6 10-8 16-8M144 106c4-6 10-8 16-8" opacity=".8"/>`,
	},
	{
		id: 'doctor',
		group: 'health',
		label: 'Consulta médica',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="86" ry="8"/>
    <rect class="a-estraza ln" x="150" y="34" width="62" height="62" rx="12"/>
    <path class="a-grana ln" d="M174 46h14v14h14v14h-14v14h-14V74h-14V60h14z"/>
    <path class="ln-thick" d="M52 36v30c0 30 56 30 56 0V36"/>
    <circle class="a-ink" cx="52" cy="34" r="6"/>
    <circle class="a-ink" cx="108" cy="34" r="6"/>
    <path class="ln-thick" d="M80 94v24c0 22 30 26 44 12"/>
    <circle class="a-anil ln" cx="136" cy="124" r="18"/>
    <circle class="a-anil-soft ln" cx="136" cy="124" r="8"/>`,
	},
	{
		id: 'gym',
		group: 'health',
		label: 'Deporte y gimnasio',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="96" ry="8"/>
    <rect class="a-anil-soft ln" x="190" y="74" width="30" height="80" rx="9"/>
    <rect class="a-anil" x="192" y="98" width="26" height="22"/>
    <rect class="ln" x="190" y="74" width="30" height="80" rx="9" fill="none"/>
    <rect class="a-ink" x="196" y="60" width="18" height="16" rx="4"/>
    <rect class="a-ink" x="58" y="118" width="100" height="10" rx="4"/>
    <rect class="a-grana ln" x="42" y="94" width="18" height="58" rx="5"/>
    <rect class="a-grana ln" x="26" y="104" width="16" height="38" rx="4"/>
    <rect class="a-grana ln" x="156" y="94" width="18" height="58" rx="5"/>
    <rect class="a-grana ln" x="174" y="104" width="14" height="38" rx="4"/>`,
	},
	{
		id: 'diploma',
		group: 'learn',
		label: 'Certificación',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="80" ry="8"/>
    <path class="a-estraza ln" d="M48 42h140v96H48z"/>
    <path class="a-amate2 ln" d="M40 36a10 10 0 0 1 0 20h8V36zM196 124a10 10 0 0 1 0 20h-8v-20z"/>
    <path class="ln" d="M70 66h96M70 82h80M70 98h88"/>
    <path class="a-grana ln" d="M142 112l-8 34 14-8 12 10 4-36z"/>
    <circle class="a-maiz ln" cx="152" cy="112" r="16"/>
    <path class="ln" d="M144 112l6 6 10-12"/>`,
	},
	{
		id: 'book',
		group: 'learn',
		label: 'Curso o capacitación',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="88" ry="8"/>
    <path class="a-anil ln" d="M36 76v76c30-6 60-4 84 8 24-12 54-14 84-8V76"/>
    <path class="a-estraza ln" d="M120 80c-20-12-52-14-78-8v74c26-6 58-4 78 8z"/>
    <path class="a-estraza ln" d="M120 80c20-12 52-14 78-8v74c-26-6-58-4-78 8z"/>
    <path class="ln" d="M56 90c16-3 32-2 48 4M56 104c16-3 32-2 48 4M56 118c16-3 32-2 48 4M136 94c16-6 32-7 48-4M136 108c16-6 32-7 48-4M136 122c16-6 32-7 48-4"/>
    <path class="a-ink" d="M120 20l46 16-46 16-46-16z"/>
    <path class="a-ink" d="M96 44v14c14 8 34 8 48 0V44l-24 8z"/>
    <path class="ln" d="M166 36v22"/>
    <circle class="a-maiz ln" cx="166" cy="62" r="5"/>`,
	},
]
