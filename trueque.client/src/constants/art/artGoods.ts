import {
	ballPatches,
	ballSeams,
	calendarGrid,
	custodiaTag,
	gear,
	pentagon,
} from './artHelpers'
import type { ArtEntry } from './artTypes'

export const GOODS_ART: ArtEntry[] = [
	{
		id: 'wrench',
		group: 'service',
		label: 'Taller mecánico',
		draw: `
    <ellipse class="a-shadow" cx="122" cy="154" rx="100" ry="8"/>
    <path class="a-achiote ln" d="${gear(188, 42, 15, 8, 6)}"/>
    <circle class="a-estraza ln" cx="188" cy="42" r="6"/>
    <path class="a-maiz ln" d="M22 128v-12c0-10 6-16 16-18l30-6 26-24c6-5 12-8 20-8h42c9 0 16 3 22 9l20 22 24 4c10 2 16 9 16 18v15c0 4-2 6-6 6H28c-4 0-6-2-6-6z"/>
    <path class="a-anil-soft ln" d="M80 92l20-18c4-3 7-4 11-4h17v22z"/>
    <path class="a-anil-soft ln" d="M138 70h18c5 0 9 2 12 6l13 16h-43z"/>
    <path class="ln" d="M134 70v62M116 104h10M150 104h10"/>
    <ellipse class="a-estraza ln" cx="216" cy="110" rx="6" ry="5"/>
    <rect class="a-grana ln" x="22" y="104" width="8" height="10" rx="2"/>
    <path class="a-maiz-2" d="M30 122h190v6H30z" opacity=".55"/>
    <circle class="a-ink" cx="70" cy="132" r="20"/><circle class="a-amate2 ln" cx="70" cy="132" r="8"/>
    <circle class="a-ink" cx="176" cy="132" r="20"/><circle class="a-amate2 ln" cx="176" cy="132" r="8"/>`,
	},

	{
		id: 'scissors',
		group: 'service',
		label: 'Estética y barbería',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="84" ry="8"/>
    <path class="a-estraza ln" d="M98 112L150 36c4-5 11-1 9 4l-46 78z"/>
    <path class="a-estraza ln" d="M122 112L70 36c-4-5-11-1-9 4l46 78z"/>
    <circle class="a-grana ln" cx="90" cy="128" r="17"/><circle class="a-amate2 ln" cx="90" cy="128" r="7"/>
    <circle class="a-grana ln" cx="130" cy="128" r="17"/><circle class="a-amate2 ln" cx="130" cy="128" r="7"/>
    <circle class="a-ink" cx="110" cy="96" r="4.5"/>
    <path class="ln" d="M180 60h-12M180 68h-12M180 76h-12M180 84h-12M180 92h-12M180 100h-12M180 108h-12M180 116h-12M180 124h-12M180 132h-12"/>
    <rect class="a-maiz ln" x="178" y="50" width="22" height="98" rx="6"/>`,
	},
	{
		id: 'thermos',
		group: 'merch',
		label: 'Termo',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="46" ry="8"/>
    <rect class="a-anil ln" x="92" y="52" width="56" height="102" rx="16"/>
    <rect class="a-ink" x="96" y="36" width="48" height="22" rx="7"/>
    <rect class="a-estraza ln" x="104" y="80" width="32" height="44" rx="8"/>
    <path class="a-cacao ln" d="M120 88c9 4 9 24 0 28-9-4-9-24 0-28z"/>
    <path class="ln" d="M120 90v24"/>
    <path class="ln a-steam" d="M108 28c-6-8 6-12 0-20M124 30c-6-8 6-12 0-20M140 28c-6-8 6-12 0-20"/>
    <path class="a-maiz ln" d="M150 70h12a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-12"/>`,
	},
	{
		id: 'cap',
		group: 'merch',
		label: 'Gorra',
		draw: `
    <ellipse class="a-shadow" cx="126" cy="150" rx="92" ry="8"/>
    <path class="a-grana ln" d="M150 122c34-8 68-4 72 8 2 7-12 11-34 11-16 0-32-4-46-9z"/>
    <path class="ln" d="M160 128c18-3 38-2 52 2"/>
    <path class="a-grana ln" d="M44 130c0-50 32-80 74-80 38 0 60 28 62 70z"/>
    <path class="ln" d="M118 50c-8 22-10 50-10 80M86 60c-12 20-16 44-16 70M150 60c8 16 12 36 12 60"/>
    <path class="ln" d="M44 130h136"/>
    <circle class="a-maiz ln" cx="118" cy="50" r="6"/>
    <path class="a-maiz ln" d="M90 84c9 5 9 25 0 30-9-5-9-25 0-30z"/>`,
	},
	{
		id: 'tshirt',
		group: 'merch',
		label: 'Playera',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="72" ry="8"/>
    <path class="a-anil ln" d="M86 34L44 52l14 32 20-8v74h84V76l20 8 14-32-42-18c-4 10-14 16-34 16s-30-6-34-16z"/>
    <path class="ln" d="M86 34c4 10 14 16 34 16s30-6 34-16"/>
    <path class="a-maiz ln" d="M120 82c11 5 11 28 0 33-11-5-11-28 0-33z"/>
    <path class="ln" d="M120 84v29"/>`,
	},
	{
		id: 'ticket',
		group: 'leisure',
		label: 'Boletos y eventos',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="150" rx="88" ry="8"/>
    <g transform="rotate(-6 120 96)">
      <path class="a-estraza ln" d="M36 52h168v28a12 12 0 0 0 0 24v28H36v-28a12 12 0 0 0 0-24z"/>
      <path class="ln" d="M150 56v72" stroke-dasharray="6 7"/>
      <path class="ln" d="M56 78h70M56 96h52M56 114h62"/>
      <circle class="a-cacao ln" cx="178" cy="92" r="14"/>
    </g>`,
	},
	{
		id: 'dayoff',
		group: 'leisure',
		label: 'Día libre',
		draw: `
    <ellipse class="a-shadow" cx="114" cy="156" rx="80" ry="8"/>
    <rect class="a-estraza ln" x="48" y="44" width="124" height="106" rx="10"/>
    <path class="a-grana ln" d="M48 72V54a10 10 0 0 1 10-10h104a10 10 0 0 1 10 10v18z"/>
    <path class="ln-thick" d="M78 32v22M142 32v22"/>
    <g class="a-amate2">${calendarGrid()}</g>
    <circle class="a-maiz ln" cx="132" cy="108" r="11"/>
    <path class="ln" d="M127 108l4 4 7-8"/>
    <circle class="a-maiz ln" cx="200" cy="54" r="15"/>
    <path class="ln" d="M200 28v-8M200 88v-8M226 54h8M174 54h-8M218 36l6-6M218 72l6 6M182 36l-6-6"/>`,
	},
	{
		id: 'ball',
		group: 'leisure',
		label: 'Torneo deportivo',
		draw: `
    <ellipse class="a-shadow" cx="130" cy="156" rx="58" ry="8"/>
    <path class="ln" d="M62 78H34M58 98H22M62 118H40"/>
    <clipPath id="ball-clip"><circle cx="130" cy="100" r="48"/></clipPath>
    <circle class="a-estraza" cx="130" cy="100" r="48"/>
    <g clip-path="url(#ball-clip)">
      <path class="a-ink" d="${ballPatches(130, 100)}"/>
      <path class="ln" d="${ballSeams(130, 100)}"/>
    </g>
    <path class="a-ink" d="${pentagon(130, 100, 17)}"/>
    <circle class="ln" cx="130" cy="100" r="48" fill="none"/>
    <path class="a-estraza" d="M104 72c6-8 16-12 24-12" opacity=".7"/>`,
	},

	{
		id: 'laptop',
		group: 'custodia',
		label: 'Laptop',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="92" ry="8"/>
    <rect class="a-ink" x="58" y="40" width="124" height="82" rx="8"/>
    <rect class="a-anil" x="66" y="48" width="108" height="66" rx="3"/>
    <path class="a-anil-soft" d="M72 56h44v6H72zM72 68h70v4H72zM72 78h56v4H72z" opacity=".75"/>
    <path class="a-amate2 ln" d="M36 124h168l-12 22H48z"/>
    <path class="ln" d="M104 132h32"/>
    ${custodiaTag(208, 88, 14)}`,
	},
	{
		id: 'monitor',
		group: 'custodia',
		label: 'Monitor',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="84" ry="8"/>
    <rect class="a-ink" x="46" y="32" width="142" height="94" rx="8"/>
    <rect class="a-anil" x="54" y="40" width="126" height="76" rx="3"/>
    <path class="a-anil-soft" d="M62 50h50v7H62zM62 64h80v4H62zM62 74h64v4H62z" opacity=".75"/>
    <path class="a-amate2 ln" d="M106 126l-6 20h34l-6-20z"/>
    <path class="ln-thick" d="M84 148h66"/>
    ${custodiaTag(210, 96, 12)}`,
	},
	{
		id: 'phone',
		group: 'custodia',
		label: 'Celular',
		draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="60" ry="8"/>
    <rect class="a-ink" x="86" y="22" width="68" height="132" rx="13"/>
    <rect class="a-anil" x="93" y="34" width="54" height="104" rx="5"/>
    <path class="a-anil-soft" d="M100 46h30v6h-30zM100 58h40v4h-40zM100 68h34v4h-34z" opacity=".75"/>
    <path class="a-on-dark" d="M110 144h20v3h-20z"/>
    ${custodiaTag(180, 96, 12)}`,
	},
	{
		id: 'tablet',
		group: 'custodia',
		label: 'Tableta',
		draw: `
    <ellipse class="a-shadow" cx="118" cy="156" rx="84" ry="8"/>
    <rect class="a-ink" x="44" y="40" width="148" height="104" rx="13"/>
    <rect class="a-anil" x="54" y="50" width="128" height="84" rx="4"/>
    <path class="a-anil-soft" d="M64 62h44v7H64zM64 76h72v4H64zM64 86h58v4H64zM64 96h66v4H64z" opacity=".75"/>
    <circle class="a-on-dark" cx="187" cy="92" r="2.5"/>
    ${custodiaTag(212, 104, 12)}`,
	},
]
