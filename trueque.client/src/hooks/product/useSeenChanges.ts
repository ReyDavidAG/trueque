import { useEffect, useState } from 'react'

type Fields = Record<string, string>

const STORE = 'trueque.seen.v2.'

const read = (key: string): Fields | null => {
	try {
		const raw = localStorage.getItem(STORE + key)
		return raw ? (JSON.parse(raw) as Fields) : null
	} catch {
		return null
	}
}

const write = (key: string, snapshot: string) => {
	try {
		localStorage.setItem(STORE + key, snapshot)
	} catch {
		return
	}
}

const diff = (key: string | null, fields: Fields) => {
	const prev = key ? read(key) : null
	if (!prev) return new Set<string>()
	return new Set(
		Object.keys(fields).filter(k => k in prev && prev[k] !== fields[k])
	)
}

export function useSeenChanges(key: string | null, fields: Fields) {
	const [seen, setSeen] = useState(() => ({ key, changed: diff(key, fields) }))
	if (seen.key !== key && key) setSeen({ key, changed: diff(key, fields) })
	const snapshot = JSON.stringify(fields)
	useEffect(() => {
		if (key) write(key, snapshot)
	}, [key, snapshot])
	return seen.key === key ? seen.changed : new Set<string>()
}

export const photoStamp = (art: string, photo?: string) =>
	photo ? `${art}|${photo.length}:${photo.slice(-48)}` : art
