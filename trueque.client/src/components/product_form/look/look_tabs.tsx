import { Icon } from '@/components/ui/icon'
import { LOOK_TABS, type LookTab } from '@/constants/look_editor'
import { cn } from '@/utils/cn'

interface LookTabsProps {
	tab: LookTab
	photoCount: number
	onTab: (tab: LookTab) => void
}

export function LookTabs({ tab, photoCount, onTab }: LookTabsProps) {
	return (
		<div className='wizard__tabs' role='tablist' aria-label='Personalizar'>
			{LOOK_TABS.map(([id, label, icon]) => (
				<button
					key={id}
					type='button'
					role='tab'
					aria-selected={tab === id}
					aria-controls='wizard-pane'
					className={cn('wizard__tab', tab === id && 'is-active')}
					onClick={() => onTab(id)}>
					<Icon name={icon} />
					{label}
					{id === 'photos' && photoCount > 0 && (
						<span className='wizard__count num'>{photoCount}</span>
					)}
				</button>
			))}
		</div>
	)
}
