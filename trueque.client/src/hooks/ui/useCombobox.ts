import {
	type KeyboardEvent,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'

import type { ComboboxOption } from '@/types/comboboxType'
import { normalizeText } from '@/utils/normalizeText'

type ComboboxState = {
	options: ReadonlyArray<ComboboxOption>
	value: string
	clearLabel?: string
	onChange: (value: string) => void
}

function matches(option: ComboboxOption, words: string[]) {
	const text = normalizeText(
		`${option.label} ${option.description ?? ''} ${option.keywords ?? ''}`
	)
	return words.every(word => text.includes(word))
}

export function useCombobox({
	options,
	value,
	clearLabel,
	onChange,
}: ComboboxState) {
	const listId = useId()
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [active, setActive] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLUListElement>(null)

	const all = useMemo<ReadonlyArray<ComboboxOption>>(
		() =>
			clearLabel != null
				? [{ value: '', label: clearLabel }, ...options]
				: options,
		[clearLabel, options]
	)
	const filtered = useMemo(() => {
		const words = normalizeText(query).split(/\s+/).filter(Boolean)
		return words.length ? all.filter(option => matches(option, words)) : all
	}, [all, query])
	const selected = all.find(option => option.value === value)

	useEffect(() => {
		if (!open) return
		listRef.current
			?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
			?.scrollIntoView({ block: 'nearest' })
	}, [active, open])

	const toggle = (next: boolean) => {
		if (next) {
			setQuery('')
			setActive(
				Math.max(
					0,
					all.findIndex(option => option.value === value)
				)
			)
		}
		setOpen(next)
	}

	const commit = (option: ComboboxOption) => {
		onChange(option.value)
		setOpen(false)
	}

	const search = (text: string) => {
		setQuery(text)
		setActive(0)
	}

	const KEY_MOVES: Record<string, () => void> = {
		ArrowDown: () => setActive(a => Math.min(a + 1, filtered.length - 1)),
		ArrowUp: () => setActive(a => Math.max(a - 1, 0)),
		Home: () => setActive(0),
		End: () => setActive(filtered.length - 1),
		Enter: () => {
			const option = filtered[active]
			if (option) commit(option)
		},
	}

	const onKeyDown = (event: KeyboardEvent) => {
		const move = KEY_MOVES[event.key]
		if (!move) return
		event.preventDefault()
		move()
	}

	return {
		listId,
		open,
		query,
		active,
		setActive,
		inputRef,
		listRef,
		filtered,
		selected,
		toggle,
		commit,
		search,
		onKeyDown,
	}
}
