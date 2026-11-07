import { EXTRA_GOODS_ART } from './artExtraGoods'
import { EXTRA_MERCH_ART } from './artExtraMerch'
import { EXTRA_WORK_ART } from './artExtraWork'
import type { ArtEntry } from './artTypes'

export const EXTRA_ART: ArtEntry[] = [
	...EXTRA_WORK_ART,
	...EXTRA_GOODS_ART,
	...EXTRA_MERCH_ART,
]
