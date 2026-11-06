import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type Char = { ch: string; id: number }
type Field = HTMLInputElement | HTMLTextAreaElement

const diff = (prev: Char[], next: string, seq: { current: number }) => {
	const b = Array.from(next)
	let s = 0
	while (s < prev.length && s < b.length && prev[s].ch === b[s]) s++
	let e = 0
	while (
		e < prev.length - s &&
		e < b.length - s &&
		prev[prev.length - 1 - e].ch === b[b.length - 1 - e]
	)
		e++
	return [
		...prev.slice(0, s),
		...b.slice(s, b.length - e).map(ch => ({ ch, id: ++seq.current })),
		...prev.slice(prev.length - e),
	]
}

export function useTyped<T extends Field>(
	register: UseFormRegisterReturn,
	multiline = false
) {
	const field = useRef<T | null>(null)
	const text = useRef<HTMLSpanElement>(null)
	const seq = useRef(0)
	const [chars, setChars] = useState<Char[]>([])

	const align = useCallback(() => {
		requestAnimationFrame(() => {
			const f = field.current
			const t = text.current
			if (!f || !t) return
			t.style.transform = multiline
				? `translateY(${-f.scrollTop}px)`
				: `translateX(${-f.scrollLeft}px)`
		})
	}, [multiline])

	const sync = useCallback(() => {
		const value = field.current?.value ?? ''
		setChars(prev =>
			prev.map(c => c.ch).join('') === value ? prev : diff(prev, value, seq)
		)
		align()
	}, [align])

	useEffect(() => {
		const f = field.current
		if (!f) return
		f.addEventListener('scroll', align)
		const id = window.setInterval(() => {
			if (document.activeElement !== f) sync()
		}, 400)
		sync()
		return () => {
			f.removeEventListener('scroll', align)
			window.clearInterval(id)
		}
	}, [align, sync])

	const bind = {
		...register,
		ref: (node: T | null) => {
			field.current = node
			register.ref(node)
		},
		onChange: async (e: ChangeEvent<T>) => {
			await register.onChange(e)
			sync()
		},
		onKeyUp: align,
		onSelect: align,
		onClick: align,
	}

	return { bind, chars, text }
}
