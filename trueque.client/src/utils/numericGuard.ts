const RULES: Record<string, RegExp> = {
	numeric: /^\d*$/,
	decimal: /^\d*(\.\d{0,2})?$/,
}

const ruleFor = (target: EventTarget | null) => {
	if (!(target instanceof HTMLInputElement)) return null
	return RULES[target.inputMode] ?? null
}

const clean = (text: string, decimal: boolean) =>
	decimal
		? text.replace(',', '.').replace(/[^\d.]/g, '')
		: text.replace(/\D/g, '')

export function installNumericGuard() {
	document.addEventListener(
		'beforeinput',
		e => {
			const el = e.target
			const rule = ruleFor(el)
			if (!rule || !(el instanceof HTMLInputElement)) return
			if (!e.inputType.startsWith('insert') || e.data === null) return
			const decimal = el.inputMode === 'decimal'
			const start = el.selectionStart ?? el.value.length
			const end = el.selectionEnd ?? start
			const typed = clean(e.data, decimal)
			const next = el.value.slice(0, start) + typed + el.value.slice(end)
			if (typed === e.data && rule.test(next)) return
			e.preventDefault()
			if (!typed || !rule.test(next)) return
			el.setRangeText(typed, start, end, 'end')
			el.dispatchEvent(new Event('input', { bubbles: true }))
		},
		true
	)
	document.addEventListener(
		'paste',
		e => {
			const el = e.target
			const rule = ruleFor(el)
			if (!rule || !(el instanceof HTMLInputElement)) return
			e.preventDefault()
			const decimal = el.inputMode === 'decimal'
			const typed = clean(e.clipboardData?.getData('text') ?? '', decimal)
			const start = el.selectionStart ?? el.value.length
			const end = el.selectionEnd ?? start
			if (
				!typed ||
				!rule.test(el.value.slice(0, start) + typed + el.value.slice(end))
			)
				return
			el.setRangeText(typed, start, end, 'end')
			el.dispatchEvent(new Event('input', { bubbles: true }))
		},
		true
	)
}
