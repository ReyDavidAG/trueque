import type { ArtEntry } from './artTypes'

export const EXTRA_GOODS_ART: ArtEntry[] = [
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
]
