import { useState } from 'react'

import { ART } from '@/constants/art/artCatalog'
import { ALL_FIGURES } from '@/constants/lookEditor'

export function useFigureFilter() {
	const [group, setGroup] = useState(ALL_FIGURES.id)
	const [query, setQuery] = useState('')
	const needle = query.trim().toLowerCase()
	const figures = ART.filter(
		a =>
			(group === ALL_FIGURES.id || a.group === group) &&
			a.label.toLowerCase().includes(needle)
	)
	return { group, setGroup, query, setQuery, figures }
}

export type FigureFilter = ReturnType<typeof useFigureFilter>
