export type ArtGroup =
	| 'food'
	| 'health'
	| 'learn'
	| 'service'
	| 'merch'
	| 'leisure'
	| 'custodia'

export interface ArtEntry {
	id: string
	group: ArtGroup
	label: string
	draw: string
}
