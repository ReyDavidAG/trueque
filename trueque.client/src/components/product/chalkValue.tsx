import { Fragment } from 'react'

import { Hand } from '@/components/ui/hand'
import { useChangeCount } from '@/hooks/product/useChangeCount'
import { cn } from '@/utils/cn'

export function ChalkValue({
	value,
	paper = false,
	fresh = false,
}: {
	value: string
	paper?: boolean
	fresh?: boolean
}) {
	const writes = useChangeCount(value) + (fresh ? 1 : 0)
	return (
		<span className={cn('chalk-val', paper && 'chalk-val--paper')}>
			{value}
			{writes > 0 && (
				<Fragment key={writes}>
					<span className='chalk-val__wipe' aria-hidden='true' />
					<span className='chalk-val__pen' aria-hidden='true'>
						<Hand className='chalk-val__hand' />
					</span>
					<span className='chalk-val__tag'>¡Nuevo!</span>
				</Fragment>
			)}
		</span>
	)
}
