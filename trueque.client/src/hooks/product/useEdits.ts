import { useEffect, useState } from 'react'

import { clearEdits, type EditScope, readEdits } from '@/utils/editMarks'

export function useEdits(id: string, scope: EditScope, active = true) {
	const [edits] = useState(() => readEdits(id, scope))
	useEffect(() => {
		if (active && edits.size) clearEdits(id, scope)
	}, [id, scope, active, edits])
	return active ? edits : new Set<string>()
}
