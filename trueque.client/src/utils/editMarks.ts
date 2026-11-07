import {
	EDIT_SCOPES,
	type EditField,
	type EditMarks,
	editMarksSchema,
	type EditScope,
} from '@/schemas/panel/product/editMarks.schema'
import type { Product, ProductInput } from '@/types/productType'

export type { EditField, EditScope }

const keyFor = (id: string) => `trueque.edited.${id}`

const read = (id: string): EditMarks | null => {
	try {
		const raw = localStorage.getItem(keyFor(id))
		if (!raw) return null
		const parsed = editMarksSchema.safeParse(JSON.parse(raw))
		return parsed.success ? parsed.data : null
	} catch {
		return null
	}
}

const write = (id: string, marks: EditMarks | null) => {
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
	if (before.name.trim() !== after.name) changed.push('name')
	if (before.blurb.trim() !== after.blurb) changed.push('blurb')
	if (before.price !== after.price) changed.push('price')
	if (before.art !== after.art || imagesChanged) changed.push('look')
	if ((before.detail ?? '').trim() !== after.detail) changed.push('lede')
	if (
		before.includes
			.map(x => x.trim())
			.filter(Boolean)
			.join('|') !== after.includes.join('|')
	)
		changed.push('includes')
	if ((before.locationId ?? '') !== after.locationId) changed.push('location')
	if (before.couponDays !== after.couponDays) changed.push('couponDays')
	if (before.swaps !== after.swaps) changed.push('swaps')
	return changed
}

export function markEdited(id: string, fields: EditField[]) {
	if (fields.length) write(id, { fields, pending: [...EDIT_SCOPES] })
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
