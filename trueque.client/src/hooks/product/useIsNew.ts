import { useEffect, useState } from 'react'

const KNOWN_KEY = 'trueque.market.known'

const readKnown = (): string[] | null => {
	try {
		const raw = localStorage.getItem(KNOWN_KEY)
		return raw ? (JSON.parse(raw) as string[]) : null
	} catch {
		return null
	}
}

const remember = (id: string) => {
	try {
		const known = new Set(readKnown() ?? [])
		if (known.has(id)) return
		known.add(id)
		localStorage.setItem(KNOWN_KEY, JSON.stringify([...known]))
	} catch {
		return
	}
}

export function useIsNew(id: string, active: boolean) {
	const [isNew] = useState(() => {
		const known = readKnown()
		return known !== null && !known.includes(id)
	})
	useEffect(() => {
		if (active) remember(id)
	}, [id, active])
	return active && isNew
}
