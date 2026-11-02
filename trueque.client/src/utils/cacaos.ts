import type { Lot } from '@/types/wallet_type'

export const cacaos = (n: number) =>
	`${n.toLocaleString('es-MX')} ${n === 1 ? 'cacao' : 'cacaos'}`

export function paymentPlan(lots: Lot[], price: number) {
	let need = price
	const plan: { lot: Lot; amount: number }[] = []
	const today = new Date().toISOString().slice(0, 10)
	for (const lot of [...lots]
		.filter(l => l.remaining > 0 && l.expiresOn > today)
		.sort((a, b) => a.expiresOn.localeCompare(b.expiresOn) || a.id - b.id)) {
		if (need <= 0) break
		const amount = Math.min(lot.remaining, need)
		plan.push({ lot, amount })
		need -= amount
	}
	return need > 0 ? null : plan
}
