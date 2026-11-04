const points = (n: number, outer: number, inner: number) =>
	Array.from({ length: n * 2 }, (_, i) => {
		const r = i % 2 ? inner : outer
		const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
		return `${(120 + Math.cos(a) * r).toFixed(1)},${(90 + Math.sin(a) * r).toFixed(1)}`
	}).join(' ')

const polygon = (n: number, r: number) =>
	Array.from({ length: n }, (_, i) => {
		const a = (i / n) * Math.PI * 2 - Math.PI / 2
		return `${(120 + Math.cos(a) * r).toFixed(1)},${(90 + Math.sin(a) * r).toFixed(1)}`
	}).join(' ')

export const SHAPES = [
	{ id: 'circle', label: 'Círculo', draw: '<circle class="a-grana ln" cx="120" cy="90" r="46"/>' },
	{
		id: 'square',
		label: 'Cuadro',
		draw: '<rect class="a-anil ln" x="76" y="46" width="88" height="88" rx="14"/>',
	},
	{ id: 'triangle', label: 'Triángulo', draw: '<path class="a-maiz ln" d="M120 40l54 94H66z"/>' },
	{
		id: 'star',
		label: 'Estrella',
		draw: `<polygon class="a-maiz ln" points="${points(5, 52, 22)}"/>`,
	},
	{
		id: 'heart',
		label: 'Corazón',
		draw: '<path class="a-grana ln" d="M120 138c-40-26-62-48-62-72 0-16 12-28 28-28 14 0 26 8 34 20 8-12 20-20 34-20 16 0 28 12 28 28 0 24-22 46-62 72z"/>',
	},
	{
		id: 'drop',
		label: 'Gota',
		draw: '<path class="a-anil ln" d="M120 34c24 32 42 54 42 76a42 42 0 0 1-84 0c0-22 18-44 42-76z"/>',
	},
	{
		id: 'hexagon',
		label: 'Hexágono',
		draw: `<polygon class="a-nopal ln" points="${polygon(6, 48)}"/>`,
	},
	{
		id: 'burst',
		label: 'Sello',
		draw: `<polygon class="a-achiote ln" points="${points(12, 52, 42)}"/><circle class="a-estraza ln" cx="120" cy="90" r="28"/>`,
	},
	{
		id: 'leaf',
		label: 'Hoja',
		draw: '<path class="a-nopal ln" d="M70 128c0-54 42-86 100-86 0 58-32 98-84 98-7 0-12-4-16-12z"/><path class="ln" d="M78 130c22-26 46-48 80-78"/>',
	},
	{
		id: 'tag',
		label: 'Etiqueta',
		draw: '<path class="a-cacao ln" d="M64 62h82l34 28-34 28H64z"/><circle class="a-estraza ln" cx="148" cy="90" r="7"/>',
	},
	{
		id: 'ribbon',
		label: 'Listón',
		draw: '<path class="a-grana ln" d="M52 70h136l-14 20 14 20H52l14-20z"/>',
	},
	{
		id: 'ring',
		label: 'Aro',
		draw: '<circle class="a-achiote ln" cx="120" cy="90" r="46"/><circle class="a-estraza ln" cx="120" cy="90" r="24"/>',
	},
	{ id: 'oval', label: 'Óvalo', draw: '<ellipse class="a-achiote ln" cx="120" cy="90" rx="62" ry="40"/>' },
	{ id: 'diamond', label: 'Rombo', draw: '<path class="a-anil ln" d="M120 34l50 56-50 56-50-56z"/>' },
	{
		id: 'pentagon',
		label: 'Pentágono',
		draw: `<polygon class="a-grana ln" points="${polygon(5, 50)}"/>`,
	},
	{
		id: 'octagon',
		label: 'Octágono',
		draw: `<polygon class="a-grana ln" points="${polygon(8, 48)}"/>`,
	},
	{
		id: 'cross',
		label: 'Cruz',
		draw: '<path class="a-grana ln" d="M104 42h32v32h32v32h-32v32h-32v-32H72V74h32z"/>',
	},
	{ id: 'arrow', label: 'Flecha', draw: '<path class="a-nopal ln" d="M54 74h72V48l60 42-60 42v-26H54z"/>' },
	{
		id: 'moon',
		label: 'Luna',
		draw: '<path class="a-maiz ln" d="M136 36a56 56 0 1 0 32 96 46 46 0 1 1-32-96z"/>',
	},
	{
		id: 'cloud',
		label: 'Nube',
		draw: '<path class="a-estraza ln" d="M80 128a26 26 0 0 1-2-52 34 34 0 0 1 64-12 28 28 0 0 1 22 64z"/>',
	},
	{ id: 'bolt', label: 'Rayo', draw: '<path class="a-maiz ln" d="M134 28L80 102h34l-12 52 56-76h-34z"/>' },
	{ id: 'half', label: 'Medio círculo', draw: '<path class="a-anil ln" d="M62 118a58 58 0 0 1 116 0z"/>' },
	{ id: 'trapezoid', label: 'Trapecio', draw: '<path class="a-cacao ln" d="M90 54h60l32 72H58z"/>' },
	{
		id: 'parallelogram',
		label: 'Romboide',
		draw: '<path class="a-achiote ln" d="M90 54h98l-38 72H52z"/>',
	},
	{
		id: 'bubble',
		label: 'Globo de diálogo',
		draw: '<path class="a-estraza ln" d="M66 42h108a14 14 0 0 1 14 14v50a14 14 0 0 1-14 14h-60l-28 22v-22H66a14 14 0 0 1-14-14V56a14 14 0 0 1 14-14z"/>',
	},
	{
		id: 'shield',
		label: 'Escudo',
		draw: '<path class="a-anil ln" d="M120 32l52 18v36c0 30-22 50-52 62-30-12-52-32-52-62V50z"/>',
	},
	{
		id: 'sun',
		label: 'Sol',
		draw: `<polygon class="a-achiote ln" points="${points(12, 58, 38)}"/><circle class="a-maiz ln" cx="120" cy="90" r="30"/>`,
	},
	{
		id: 'check',
		label: 'Palomita',
		draw: '<circle class="a-nopal ln" cx="120" cy="90" r="46"/><path class="ln-thick" d="M96 92l16 16 32-34"/>',
	},
	{
		id: 'flower',
		label: 'Flor',
		draw: `${[0, 72, 144, 216, 288]
			.map(a => {
				const r = (a * Math.PI) / 180
				return `<circle class="a-grana ln" cx="${(120 + Math.sin(r) * 28).toFixed(1)}" cy="${(90 - Math.cos(r) * 28).toFixed(1)}" r="22"/>`
			})
			.join('')}<circle class="a-maiz ln" cx="120" cy="90" r="16"/>`,
	},
	{
		id: 'frame',
		label: 'Marco',
		draw: '<rect class="a-cacao ln" x="58" y="38" width="124" height="104" rx="6"/><rect class="a-estraza ln" x="72" y="52" width="96" height="76" rx="2"/>',
	},
] as const

export const SHAPE_IDS: string[] = SHAPES.map(s => s.id)
