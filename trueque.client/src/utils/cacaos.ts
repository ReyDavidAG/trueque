export const cacaos = (n: number) =>
	`${n.toLocaleString('es-MX')} ${n === 1 ? 'cacao' : 'cacaos'}`

export const formatMoney = (n: number) =>
	n.toLocaleString('es-MX', {
		style: 'currency',
		currency: 'MXN',
		maximumFractionDigits: n % 1 ? 2 : 0,
	})
