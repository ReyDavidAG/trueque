export const STALL_LOOKS = [
	{
		kind: 'Huevo blanco',
		unit: 'docena',
		price: 25,
		eggs: ['--color-cascara'],
	},
	{
		kind: 'Huevo rojo',
		unit: 'docena',
		price: 60,
		eggs: ['--color-cascara-roja'],
	},
	{
		kind: 'Huevo de rancho',
		unit: '30 piezas',
		price: 180,
		eggs: ['--color-cascara', '--color-cascara-roja', '--color-cascara-sombra'],
	},
] as const
