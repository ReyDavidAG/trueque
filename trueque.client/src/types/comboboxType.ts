import type { ReactNode } from 'react'

export interface ComboboxOption {
	value: string
	label: string
	description?: string
	keywords?: string
	leading?: ReactNode
}
