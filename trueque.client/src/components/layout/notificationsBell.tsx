import { useState } from 'react'
import { Link } from 'react-router'
import * as Popover from '@radix-ui/react-popover'

import { Icon, type IconName } from '@/components/ui/icon'
import {
	useMarkAllRead,
	useNotifications,
} from '@/hooks/notifications/useNotifications'
import type { NotificationKind } from '@/types/configType'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'

const ICON: Record<NotificationKind, IconName> = {
	earn: 'spark',
	expire: 'clock',
	coupon: 'ticket',
	review: 'scale',
	rejected: 'info',
	budget: 'coins',
	custodia: 'laptop',
}

export function NotificationsBell() {
	const [open, setOpen] = useState(false)
	const { data = [] } = useNotifications()
	const markAll = useMarkAllRead()
	const unread = data.filter(n => !n.read).length

	const close = () => {
		setOpen(false)
		if (unread) markAll.mutate()
	}

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<button
					className='bell'
					type='button'
					aria-label={unread ? `Avisos, ${unread} sin leer` : 'Avisos'}>
					<Icon name='bell' />
					{unread > 0 && (
						<span className='bell__n num' aria-hidden='true'>
							{unread}
						</span>
					)}
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className='menu notes'
					align='end'
					sideOffset={10}
					collisionPadding={12}>
					<div className='notes__head'>
						<b>Avisos</b>
						{unread > 0 && (
							<button
								className='link-btn'
								type='button'
								onClick={() => markAll.mutate()}>
								Marcar como leídos
							</button>
						)}
					</div>
					{data.length ? (
						<ul className='notes__list' role='list'>
							{data.map(n => (
								<li key={n.id} className={cn('note', !n.read && 'is-new')}>
									<Link to={n.link ?? '/'} onClick={close}>
										<Icon name={ICON[n.kind]} />
										<span>
											{n.body}
											<small>{shortDate(n.createdAt)}</small>
										</span>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p className='muted small notes__empty'>
							Aquí te avisamos cuando ganes cacaos o algo esté por vencer.
						</p>
					)}
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
