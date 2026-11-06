import type { Product, ProductInput } from '@/types/productType'

export type EditField =
	| 'name'
	| 'blurb'
	| 'price'
	| 'look'
	| 'lede'
	| 'includes'
	| 'location'
	| 'couponDays'
	| 'swaps'

export type EditScope = 'market' | 'detail' | 'stall'

type Marks = { fields: EditField[]; pending: EditScope[] }

const SCOPES: EditScope[] = ['market', 'detail', 'stall']
const keyFor = (id: string) => `trueque.edited.${id}`

const read = (id: string): Marks | null => {
	try {
		const raw = localStorage.getItem(keyFor(id))
		return raw ? (JSON.parse(raw) as Marks) : null
	} catch {
		return null
	}
}

const write = (id: string, marks: Marks | null) => {
	try {
		if (marks) localStorage.setItem(keyFor(id), JSON.stringify(marks))
		else localStorage.removeItem(keyFor(id))
	} catch {
		return
	}
}

export function editedFields(
	before: Product,
	after: ProductInput,
	imagesChanged: boolean
) {
	const changed: EditField[] = []
	if (before.name !== after.name) changed.push('name')
	if (before.blurb !== after.blurb) changed.push('blurb')
	if (before.price !== after.price) changed.push('price')
	if (before.art !== after.art || imagesChanged) changed.push('look')
	if ((before.detail ?? '') !== after.detail) changed.push('lede')
	if (before.includes.join('|') !== after.includes.join('|'))
		changed.push('includes')
	if ((before.locationId ?? '') !== after.locationId) changed.push('location')
	if (before.couponDays !== after.couponDays) changed.push('couponDays')
	if (before.swaps !== after.swaps) changed.push('swaps')
	return changed
}

export function markEdited(id: string, fields: EditField[]) {
	if (fields.length) write(id, { fields, pending: SCOPES })
}

export function readEdits(id: string, scope: EditScope) {
	const marks = read(id)
	return new Set(marks?.pending.includes(scope) ? marks.fields : [])
}

export function clearEdits(id: string, scope: EditScope) {
	const marks = read(id)
	if (!marks?.pending.includes(scope)) return
	const pending = marks.pending.filter(s => s !== scope)
	write(id, pending.length ? { ...marks, pending } : null)
}
