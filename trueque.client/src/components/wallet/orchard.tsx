import { useOrchardScene } from '@/hooks/wallet/useOrchardScene'
import { useOrchardTrees } from '@/hooks/wallet/useOrchardTrees'
import type { Movement } from '@/types/walletType'
import { shortDate } from '@/utils/dates'
import { movementReference } from '@/utils/movementLabel'

import { OrchardTip } from './orchardTip'

export function Orchard({ moves }: { moves: Movement[] }) {
	const trees = useOrchardTrees(moves)
	const { host, labelRef, tip } = useOrchardScene(trees)

	if (!trees.length) return null

	return (
		<div className='orchard'>
			<div ref={host} className='orchard__stage'>
				<ol className='orchard__tags' aria-hidden='true'>
					{trees.map((tree, i) => (
						<li key={tree.source} ref={labelRef(i)}>
							<b className='num'>+{tree.total}</b>
							<span>{tree.source}</span>
						</li>
					))}
				</ol>
				{tip && <OrchardTip tip={tip} />}
			</div>
			<p className='orchard__hint muted'>
				Arrastra para recorrer tu huerto · rueda o pellizca para acercarte
			</p>
			<ul className='sr-only'>
				{trees.map(tree => (
					<li key={tree.source}>
						{tree.source}: {tree.total} cacaos en {tree.moves.length} abonos.{' '}
						{tree.moves
							.map(
								m =>
									`+${m.amount} ${movementReference(m)} ${shortDate(m.createdAt)}`
							)
							.join('; ')}
					</li>
				))}
			</ul>
		</div>
	)
}
