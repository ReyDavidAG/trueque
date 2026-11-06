import { useState } from 'react'

export function useChangeCount(value: unknown) {
	const [seen, setSeen] = useState(value)
	const [count, setCount] = useState(0)
	if (!Object.is(seen, value)) {
		setSeen(value)
		if (seen !== undefined && value !== undefined) setCount(c => c + 1)
	}
	return count
}
