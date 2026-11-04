export type ArtGroup =
	| 'food'
	| 'health'
	| 'learn'
	| 'service'
	| 'merch'
	| 'leisure'
	| 'custodia'
	| 'work'

export interface ArtEntry {
	id: string
	group: ArtGroup
	label: string
	draw: string
}
