import { useHenFlocks } from '@/hooks/wallet/useHenFlocks'
import { useHenhouseScene } from '@/hooks/wallet/useHenhouseScene'
import type { Movement } from '@/types/walletType'
import { shortDate } from '@/utils/dates'
import { movementReference } from '@/utils/movementLabel'

import { HenhouseTip } from './henhouseTip'

export function Henhouse({ moves }: { moves: Movement[] }) {
	const flocks = useHenFlocks(moves)
	const { host, labelRef, tip } = useHenhouseScene(flocks)

	if (!flocks.length) return null

	return (
		<div className='henhouse'>
			<div ref={host} className='henhouse__stage'>
				<ol className='henhouse__tags' aria-hidden='true'>
					{flocks.map((flock, i) => (
						<li key={flock.source} ref={labelRef(i)}>
							<b className='num'>+{flock.total}</b>
							<span>{flock.source}</span>
						</li>
					))}
				</ol>
				{tip && <HenhouseTip tip={tip} />}
			</div>
			<p className='henhouse__hint muted'>
				Arrastra para recorrer tu gallinero · rueda o pellizca para acercarte
			</p>
			<ul className='sr-only'>
				{flocks.map(flock => (
					<li key={flock.source}>
						{flock.source}: {flock.total} cacaos en {flock.moves.length} abonos.{' '}
						{flock.moves
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
