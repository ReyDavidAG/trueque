const MONTHS = [
	'ene',
	'feb',
	'mar',
	'abr',
	'may',
	'jun',
	'jul',
	'ago',
	'sep',
	'oct',
	'nov',
	'dic',
]

const toDate = (iso: string) =>
	new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)

export function shortDate(iso: string) {
	const d = toDate(iso)
	return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function isoDay(offsetDays = 0, now = new Date()) {
	const d = new Date(now)
	d.setDate(d.getDate() + offsetDays)
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function daysUntil(iso: string, now = new Date()) {
	const end = new Date(`${iso.slice(0, 10)}T23:59:59`)
	return Math.ceil((end.getTime() - now.getTime()) / 86_400_000)
}
